import * as schema from "../../ponder/ponder.schema";
import { createClient } from "@ponder/client";

const ponderUrl = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";
const client = createClient(`${ponderUrl}/sql`, {
  schema,
});

export type PonderSchema = typeof schema;

export { client, schema };
