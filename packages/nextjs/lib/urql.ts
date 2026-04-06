import { Client, cacheExchange, fetchExchange } from "urql";

//const ponderUrl = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069/grphql";
const client = new Client({
  url: "http://localhost:42069/graphql",
  exchanges: [cacheExchange, fetchExchange],
  preferGetMethod: false,
  //requestPolicy: "cache-and-network",
});

export default client;
