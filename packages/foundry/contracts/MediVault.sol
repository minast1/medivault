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
        address indexed doctor,
        string ipfsCID,
        string description,
        uint256 timestamp
    );
    event DoctorRegistered(
        string name,
        address indexed doctor,
        string institution,
        string department
    );
    event PatientRegistered(string name, address indexed patient, bytes32 key);
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
        string calldata _department
    ) external {
        isRegisteredDoctor[msg.sender] = true;
        emit DoctorRegistered(_name, msg.sender, _institution, _department);
    }

    /**
     * @notice Registers a patient account.
     */
    function registerPatient(
        string calldata _name,
        address patient,
        bytes32 _key
    ) external {
        emit PatientRegistered(_name, patient, _key);
    }

    /**
     * @notice Adds a record signed by a doctor.
     * @param patient The patient's address.
     * @param ipfsCID The IPFS content identifier.
     * @param category The medical category (e.g., "Radiology").
     * @param signature The doctor's cryptographic signature.
     */
    function addRecord(
        string calldata ipfsCID,
        address patient,
        bytes calldata signature,
        string calldata category
    ) external {
        address author;

        //Check if the caller is the patient (via thier Smart Account)
        if (msg.sender == patient) {
            author = patient; /// Patient is adding their own record
        } else {
            // Recover the doctor/author from the signature if a Paymaster/Relayer called this
            bytes32 structHash = keccak256(
                abi.encode(
                    RECORD_TYPEHASH,
                    patient,
                    keccak256(bytes(ipfsCID)),
                    keccak256(bytes(category))
                )
            );

            // 2. Recover the signer (the doctor)
            author = MessageHashUtils
                .toEthSignedMessageHash(structHash)
                .recover(signature);
        }
        // 1. Reconstruct the signed message hash

        emit RecordAdded(patient, author, ipfsCID, category, block.timestamp);
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
