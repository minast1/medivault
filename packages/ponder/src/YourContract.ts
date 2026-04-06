import { ponder } from "ponder:registry";
import { gp, patient, record } from "ponder:schema";
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
    description,
    mimeType,
    wrappedKey,
    ivector,
  } = event.args;
  let authorAddress: string;

  // Determine if it's an official medical record (Verified)
  const isVerified = author.toLowerCase() !== patient.toLowerCase();

  await context.db.insert(record).values({
    id: ipfsCID,
    patientId: patient,
    author: author,
    category: description,
    mimeType,
    wrappedKey,
    ivector,
    isVerified,
    timestamp: Number(event.block.timestamp),
  });
});
