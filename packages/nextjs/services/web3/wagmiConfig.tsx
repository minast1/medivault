import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { type AppKitNetwork, baseSepolia } from "@reown/appkit/networks";
import { Chain, http } from "viem";
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

export const capabilities = {
  paymasterService: {
    [baseSepolia.id]: {
      url: `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
    },
  },
};
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [...enabledChains] as [AppKitNetwork, ...AppKitNetwork[]];
//export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, hardhat, foundry, sepolia, baseSepolia];
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks,
  projectId,
  chains: enabledChains,
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});
