//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title MediVault
 * Health data and sovereign vault
 * @author Edmond Marfo
 */
contract MediVault {
    using ECDSA for bytes32;
    // We only store the "Consent Status" to allow the contract to
    // verify permissions for on-chain logic if needed.
    // Mapping: Patient => Doctor => RecordCID => IsActive
    mapping(address => mapping(address => mapping(string => bool)))
        public hasAccess;
    mapping(address => bool) public isRegisteredDoctor;

    // This "Typehash" defines the structure for EIP-712 signing
    bytes32 private constant RECORD_TYPEHASH =
        keccak256("Record(address patient,string ipfsCID,string category)");

    event RecordAdded(
        address indexed patient,
        address author,
        string indexed ipfsCID,
        string description,
        string mimeType,
        string wrappedKey,
        string ivector,
        uint256 timestamp
    );
    event DoctorRegistered(
        string name,
        address indexed doctor,
        address smartAccount,
        string institution,
        string department
    );
    event PatientRegistered(
        string name,
        address indexed patient,
        address smartAccount,
        bytes32 key,
        string pubKey
    );
    event AccessGranted(
        address indexed patient,
        address indexed doctor,
        string ipfsCID,
        uint256 timestamp
    );
    event AccessRevoked(
        address indexed patient,
        address indexed doctor,
        string ipfsCID
    );

    /**
     * @notice Registers a professional doctor account.
     */
    function registerDoctor(
        string calldata _name,
        string calldata _institution,
        string calldata _department,
        address doctor
    ) external {
        isRegisteredDoctor[msg.sender] = true;
        emit DoctorRegistered(
            _name,
            doctor,
            msg.sender,
            _institution,
            _department
        );
    }

    /**
     * @notice Registers a patient account.
     */
    function registerPatient(
        string calldata _name,
        address patient,
        bytes32 _key,
        string calldata _pubKey
    ) external {
        emit PatientRegistered(_name, patient, msg.sender, _key, _pubKey);
    }

    /**
     * @notice Adds a record signed by a doctor.
     * @param patient The patient's address.
     * @param ipfsCID The IPFS content identifier.
     * @param category The medical category (e.g., "Radiology").
     * @param mimeType The MIME type of the record.
     * @param ivector The AES Initialization Vector (Base64).
     * @param wrappedKey The RSA-wrapped AES Key (Base64).
     */
    function addRecord(
        string calldata ipfsCID,
        address patient,
        string calldata mimeType,
        string calldata ivector,
        string calldata category,
        string calldata wrappedKey
    ) external {
        address author = msg.sender;

        //Check if the caller is the patient (via thier Smart Account)
        if (msg.sender == patient) {
            author = patient; /// Patient is adding their own record
        }
        emit RecordAdded(
            patient,
            author,
            ipfsCID,
            category,
            mimeType,
            wrappedKey,
            ivector,
            block.timestamp
        );
    }

    /**
     * @notice Grants a doctor access to a specific record.
     */
    function grantAccess(
        address doctor,
        string calldata ipfsCID,
        uint256 duration
    ) external {
        hasAccess[msg.sender][doctor][ipfsCID] = true;
        uint256 expiresAt = block.timestamp + duration;
        emit AccessGranted(msg.sender, doctor, ipfsCID, expiresAt);
    }

    /**
     * @notice Revokes a doctor's access.
     */
    function revokeAccess(address doctor, string calldata ipfsCID) external {
        hasAccess[msg.sender][doctor][ipfsCID] = false;
        emit AccessRevoked(msg.sender, doctor, ipfsCID);
    }
}
