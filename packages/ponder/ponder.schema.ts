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
