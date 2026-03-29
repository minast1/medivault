import { ponder } from "ponder:registry";
import { gp, patient, record } from "ponder:schema";
import { recoverTypedDataAddress } from "viem";

ponder.on("MediVault:DoctorRegistered", async ({ event, context }) => {
  const generateDID = (address: string, chainId: number) => {
    return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
  };
  const doctorAddress = event.args.doctor;
  const didString = generateDID(doctorAddress, context.chain.id as number);
  // Create a new GP
  await context.db.insert(gp).values({
    id: doctorAddress,
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
  console.log("inserting patient.....!");
  const patientAddress = event.args.patient;
  const didString = generateDID(patientAddress, context.chain.id as number);
  // Create a Patient
  await context.db.insert(patient).values({
    id: event.args.patient,
    did: didString,
    cardHash: event.args.key,
    name: event.args.name,
  });
});

ponder.on("MediVault:RecordAdded", async ({ event, context }) => {
  const { patient, ipfsCID, category, signature } = event.args;
  let authorAddress: string;

  // Case 1: Patient Upload (Direct transaction, signature may be 0x)
  if (
    signature === "0x" ||
    signature ===
      "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
  ) {
    authorAddress = patient;
  }
  // Case 2: Doctor/GP Upload (Gasless, signature must be recovered)
  else {
    authorAddress = await recoverTypedDataAddress({
      domain: {
        name: "MediVault",
        version: "1",
        chainId: context.chain.id as number,
        verifyingContract: "0x3e99b9b86735125abE8b24F851c2c843C5f6e02A",
      },
      types: {
        Record: [
          { name: "patient", type: "address" },
          { name: "ipfsCID", type: "string" },
          { name: "category", type: "string" },
        ],
      },
      primaryType: "Record",
      message: { patient, ipfsCID, category },
      signature,
    });
  }

  // Determine if it's an official medical record (Verified)
  const isVerified = authorAddress.toLowerCase() !== patient.toLowerCase();

  await context.db.insert(record).values({
    id: ipfsCID,
    patientId: patient,
    authorId: authorAddress,
    category: category,
    isVerified: isVerified,
    timestamp: Number(event.block.timestamp),
  });
});
