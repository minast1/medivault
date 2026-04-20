import { createConfig } from "ponder";
import { parseAbi } from "viem";
import deployedContracts from "../nextjs/contracts/deployedContracts";
import scaffoldConfig from "../nextjs/scaffold.config";

const targetNetwork = scaffoldConfig.targetNetworks[0];

const deployedContractsForNetwork = deployedContracts[targetNetwork.id];
if (!deployedContractsForNetwork) {
  throw new Error(
    `No deployed contracts found for network ID ${targetNetwork.id}`,
  );
}

const chains = {
  [targetNetwork.name]: {
    id: targetNetwork.id,
    rpc: "https://base-sepolia.g.alchemy.com/v2/OwUO0Ax2yKri2eHGFWnYu",
    ws: "wss://base-sepolia.g.alchemy.com/v2/OwUO0Ax2yKri2eHGFWnYu",
  },
};

const contractNames = Object.keys(deployedContractsForNetwork);

const contracts = Object.fromEntries(
  contractNames.map((contractName) => {
    return [
      contractName,
      {
        chain: targetNetwork.name as string,
        abi: deployedContractsForNetwork[contractName].abi,
        address: deployedContractsForNetwork[contractName].address,
        startBlock: "latest", // deployedContractsForNetwork[contractName].deployedOnBlock || 0,
      },
    ];
  }),
);


export default createConfig({
  chains: chains,
  contracts,
});
