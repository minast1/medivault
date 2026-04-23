import { ponder } from "ponder:registry";
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import {
  gp,
  patient,
  permission,
  permissionRecord,
  record,
} from "ponder:schema";
import { recoverTypedDataAddress } from "viem";
import { EAS_ABI } from '../../nextjs/contracts/easAbi';

ponder.on("MediVault:DoctorRegistered", async ({ event, context }) => {
  const generateDID = (address: string, chainId: number) => {
    return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
  };
  const doctorAddress = event.args.doctor;
  const smartAccount = event.args.smartAccount;
  const didString = generateDID(doctorAddress, context.chain.id as number);
  // Create a new GP
  await context.db.insert(gp).values({
    id: doctorAddress,
    smartAccount,
    did: didString,
    name: event.args.name,
    institution: event.args.institution,
    department: event.args.department,
  });
});

ponder.on("MediVault:PatientRegistered", async ({ event, context }) => {
  const generateDID = (address: string, chainId: number) => {
    return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
  };

  const patientAddress = event.args.patient;
  const smartAccount = event.args.smartAccount;
  const didString = generateDID(patientAddress, context.chain.id as number);
  // Create a Patient
  await context.db.insert(patient).values({
    id: event.args.patient,
    smartAccount,
    pubKey: event.args.pubKey,
    did: didString,
    cardHash: event.args.key,
    name: event.args.name,
  });
});

ponder.on("MediVault:RecordAdded", async ({ event, context }) => {
  const {
    patient,
    author,
    ipfsCID,
    category,
    mimeType,
    ephPubKey,
    nonce,
    description,
    timestamp,
  } = event.args;

  // Determine if it's an official medical record (Verified)
  const isVerified = author.toLowerCase() !== patient.toLowerCase();

  await context.db.insert(record).values({
    id: ipfsCID,
    patientId: patient,
    author: author,
    category,
    description,
    mimeType,
    ephPubKey,
    nonce,
    isVerified,
    timestamp: Number(timestamp),
  });
});

ponder.on("MediVault:AccessRequested", async ({ event, context }) => {
  const { patient, doctor, cids, duration, reason, urgency } = event.args;
  const permissionId = event.id;

  await context.db.insert(permission).values({
    id: permissionId,
    patientId: patient,
    doctorId: doctor,
    cids,
    reason,

    createdAt: Math.floor(Date.now() / 1000),
  });

  for (const cid of cids) {
    await context.db.insert(permissionRecord).values({
      id: `${permissionId}-${cid}`,
      permissionId: doctor,
      recordId: String(cid),
      duration: Number(duration),
      status: "pending",
      urgency: Number(urgency),
      patientId: patient
    });
  }
});

ponder.on("EAS:Attested", async ({ event, context }) => {
  const { uid } = event.args;

  // The Attested event only emits (recipient, attester, uid, schemaUID).
  // We must read the full attestation on-chain to get the encoded `data` bytes.
  const attestation = await context.client.readContract({
    address: "0x4200000000000000000000000000000000000021",
    abi: EAS_ABI,
    functionName: "getAttestation",
    args: [uid],
  });

  const schemaEncoder = new SchemaEncoder(
    "bytes32 ipfsCID, address patient, address doctor, uint64 expiration",
  );
  const decodedData = schemaEncoder.decodeData(attestation.data);

  const cid = decodedData.find((val) => val.name === "ipfsCID")?.value.value as string;
  const patient = decodedData.find((val) => val.name === "patient")?.value.value;
  const doctor = decodedData.find((val) => val.name === "doctor")?.value.value;
  const expiration = decodedData.find((val) => val.name === "expiration")?.value.value as bigint;

  const item = await context.db.sql.query.permissionRecord.findFirst({
    where: (fields, { eq, and }) =>
      and(eq(fields.recordId, cid), eq(fields.status, "pending"), eq(fields.permissionId, String(doctor))),
    with: {
      permission: true,
    },
  });

  if (item && item.permission.patientId === patient) {
    await context.db.update(permissionRecord, { id: item.id }).set({
      status: "granted",
      duration: Number(BigInt(Math.floor(Date.now() / 1000)) + expiration),
    });
  }
});
