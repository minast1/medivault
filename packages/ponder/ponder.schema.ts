import { index, onchainTable } from "ponder";

/**
 * Patients: The primary entity for Web2-style profiles.
 */
export const patient = onchainTable(
  "patients",
  (t) => ({
    id: t.hex().primaryKey().notNull(),
    did: t.text().notNull(),
    cardHash: t.text().notNull(),
    name: t.text().notNull(),
    registeredAt: t
      .bigint()
      .notNull()
      .$default(() => BigInt(Math.floor(Date.now() / 1000))),
  }),
  (table) => ({
    cardHashIdx: index().on(table.cardHash),
  }),
);

export const gp = onchainTable("gps", (t) => ({
  id: t.hex().primaryKey().notNull(),
  name: t.text().notNull(),
  did: t.text().notNull(),
  institution: t.text().notNull(),
  department: t.text().notNull(),
  //lastActive
  createdAt: t
    .bigint()
    .notNull()
    .$default(() => BigInt(Math.floor(Date.now() / 1000))),
}));

// /**
//  * Records: Indexed from the 'RecordAdded' event.
//  */
export const record = onchainTable("record", (t) => ({
  id: t.text().primaryKey(), // IPFS CID
  patientId: t.text().notNull(), // The vault owner
  authorId: t.text().notNull(), // The actual signer/creator
  category: t.text().notNull(),
  isVerified: t.boolean().notNull(), // True if author is a doctor
  timestamp: t.integer().notNull(),
}));

// /**
//  * Permissions: Junction table for Patient <-> Doctor many-to-many relationship.
//  * Populated by 'AccessGranted' and 'AccessRevoked' events.
//  */
// export const permission = onchainTable("permission", (t) => ({
//   id: t.text().primaryKey(), // Composite: patientAddress-doctorAddress-recordCID
//   patientId: t.text().notNull(),
//   doctorId: t.text().notNull(),
//   recordId: t.text().notNull(),
//   expiresAt: t.integer(),
//   isActive: t.boolean().notNull().default(true),
// }));

// // Define Relationships for GraphQL Efficiency
// export const patientRelations = relations(patient, ({ many }) => ({
//   records: many(record),
//   grantedPermissions: many(permission),
// }));

// export const recordRelations = relations(record, ({ one }) => ({
//   patient: one(patient, { fields: [record.patientId], references: [patient.id] }),
// }));

// export const permissionRelations = relations(permission, ({ one }) => ({
//   patient: one(patient, { fields: [permission.patientId], references: [patient.id] }),
//   record: one(record, { fields: [permission.recordId], references: [record.id] }),
// }));
