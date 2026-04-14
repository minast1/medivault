import { createClient as createWSClient } from "graphql-ws";
import { Client, cacheExchange, fetchExchange, subscriptionExchange } from "urql";

const wsClient = createWSClient({
  url: "ws://localhost:42069/graphql",
});
//const ponderUrl = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069/grphql";
const urqlClient = new Client({
  url: "http://localhost:42069/graphql",
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(request) {
        const input = { ...request, query: request.query || "" };
        return {
          subscribe(sink) {
            const unsubscribe = wsClient.subscribe(input, sink);
            return {
              unsubscribe,
            };
          },
        };
      },
    }),
  ],
  preferGetMethod: false,
  //requestPolicy: "cache-and-network",
});

export default urqlClient;
