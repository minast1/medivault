import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { graphql } from "ponder";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.use("/graphql", graphql({ db, schema }));
//app.use("/sql/*", client({ db, schema }));

export default app;
