import { GraphQLClient } from "graphql-request";

const ponderUrl = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";
const graphqlClient = new GraphQLClient(`${ponderUrl}`);

export default graphqlClient;
