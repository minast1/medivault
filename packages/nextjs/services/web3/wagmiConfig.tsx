import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { type AppKitNetwork } from "@reown/appkit/networks";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { cookieStorage, createStorage } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

//import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}
// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [...enabledChains] as [AppKitNetwork, ...AppKitNetwork[]];
//export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, hardhat, foundry, sepolia, baseSepolia];
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks,
  projectId,
  //chains : enabledChains
  //   client: ({ chain }) => {
  //     const mainnetFallbackWithDefaultRPC = [http("https://mainnet.rpc.buidlguidl.com")];
  //     let rpcFallbacks = [...(chain.id === mainnet.id ? mainnetFallbackWithDefaultRPC : []), http()];
  //     const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id];
  //     if (rpcOverrideUrl) {
  //       rpcFallbacks = [http(rpcOverrideUrl), ...rpcFallbacks];
  //     } else {
  //       const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
  //       if (alchemyHttpUrl) {
  //         const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
  //         rpcFallbacks = isUsingDefaultKey
  //           ? [...rpcFallbacks, http(alchemyHttpUrl)]
  //           : [http(alchemyHttpUrl), ...rpcFallbacks];
  //       }
  //     }
  //     return createClient({
  //       chain,
  //       transport: fallback(rpcFallbacks),
  //       ...(chain.id !== (hardhat as Chain).id ? { pollingInterval: scaffoldConfig.pollingInterval } : {}),
  //     });
  //   },
});
// export const wagmiConfig = createConfig({
//   chains: enabledChains,
//   connectors: wagmiConnectors(),
//   ssr: true,
//   client: ({ chain }) => {
//     const mainnetFallbackWithDefaultRPC = [http("https://mainnet.rpc.buidlguidl.com")];
//     let rpcFallbacks = [...(chain.id === mainnet.id ? mainnetFallbackWithDefaultRPC : []), http()];
//     const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id];
//     if (rpcOverrideUrl) {
//       rpcFallbacks = [http(rpcOverrideUrl), ...rpcFallbacks];
//     } else {
//       const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
//       if (alchemyHttpUrl) {
//         const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
//         rpcFallbacks = isUsingDefaultKey
//           ? [...rpcFallbacks, http(alchemyHttpUrl)]
//           : [http(alchemyHttpUrl), ...rpcFallbacks];
//       }
//     }
//     return createClient({
//       chain,
//       transport: fallback(rpcFallbacks),
//       ...(chain.id !== (hardhat as Chain).id ? { pollingInterval: scaffoldConfig.pollingInterval } : {}),
//     });
//   },
// });
