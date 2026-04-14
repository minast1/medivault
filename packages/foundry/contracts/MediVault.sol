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
        string category,
        string description,
        string mimeType,
        string ephPubKey,
        string nonce,
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

    event AccessRequested(
        address indexed patient,
        address indexed doctor,
        string[] cids,
        uint256 duration,
        string reason
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
     * @param ephPubKey The Ephemeral Public Key (Base64).
     * @param nonce The nonce (Base64).
     */
    function addRecord(
        string calldata ipfsCID,
        address patient,
        string calldata mimeType,
        string calldata ephPubKey,
        string calldata category,
        string calldata description,
        string calldata nonce
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
            description,
            mimeType,
            ephPubKey,
            nonce,
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

    function requestAccess(
        address patient,
        address doctor,
        string[] calldata cids,
        uint256 duration,
        string calldata reason
    ) external {
        emit AccessRequested(patient, doctor, cids, duration, reason);
    }
}
