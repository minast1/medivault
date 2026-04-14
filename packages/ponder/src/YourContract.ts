import { ponder } from "ponder:registry";
import { gp, patient, permission, record } from "ponder:schema";
import { recoverTypedDataAddress } from "viem";

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
    id: String(ipfsCID),
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
  const { patient, doctor, cids, duration, reason } = event.args;
  await context.db.insert(permission).values({
    id: event.id,
    patientId: patient,
    doctorId: doctor,
    cids,
    expiresAt: duration,
    reason,
    createdAt: Date.now(),
  });
});
