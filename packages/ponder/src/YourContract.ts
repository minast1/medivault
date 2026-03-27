import { ponder } from "ponder:registry";
import { gp, patient } from "ponder:schema";

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
