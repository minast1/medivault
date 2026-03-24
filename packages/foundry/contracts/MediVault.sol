//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title MediVault
 * Health data and sovereign vault
 * @author Edmond Marfo
 */
contract MediVault {
    // We only store the "Consent Status" to allow the contract to
    // verify permissions for on-chain logic if needed.
    // Mapping: Patient => Doctor => RecordCID => IsActive
    mapping(address => mapping(address => mapping(string => bool)))
        public hasAccess;
    mapping(address => bool) public isRegisteredDoctor;

    event RecordAdded(
        address indexed patient,
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
    event PatientRegistered(string name, address indexed patient);
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
    function registerPatient(string calldata _name) external {}

    /**
     * @notice Adds a new medical record for a patient.
     * @param ipfsCID The IPFS CID of the medical record.
     * @param description A description of the medical record.
     * @param timestamp The timestamp of the medical record.
     */
    function addRecord(
        string calldata ipfsCID,
        string memory description,
        uint256 timestamp
    ) external {
        emit RecordAdded(msg.sender, ipfsCID, description, timestamp);
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
