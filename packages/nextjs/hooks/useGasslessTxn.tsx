import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "@reown/appkit/react";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { Abi, Address, BaseError, encodeFunctionData, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { baseSepolia } from "viem/chains";
import { usePublicClient, useWalletClient } from "wagmi";
import { derivePublicKeyFromAddress } from "~~/utils/cryptography";

const useGasslessTxn = (
  contractAddress: Address | undefined,
  abi: Abi | undefined,
  userRole: "patient" | "doctor" | undefined,
  actionType: "register" | "txn" = "txn",
) => {
  const router = useRouter();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const sendTx = useCallback(
    async (functionName: string, args: any[]) => {
      if (!walletClient?.account || !contractAddress || !abi || !publicClient) {
        console.warn("Missing requirements for transaction");
        return;
      }
      setIsPending(true);

      try {
        const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;

        const pimlicoClient = createPimlicoClient({
          chain: baseSepolia,
          transport: http(pimlicoUrl),
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
        });

        const customSigner = {
          address: walletClient.account.address,
          type: "local",
          source: "custom",
          signMessage: async ({ message }: { message: any }) =>
            await walletClient.signMessage({ message, account: walletClient.account }),
          signTypedData: async (typedData: any) =>
            await walletClient.signTypedData({ ...typedData, account: walletClient.account }),
        } as any;

        const safeAccount = await toSafeSmartAccount({
          client: publicClient,
          owners: [customSigner],
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
          version: "1.4.1",
        });

        const smartClient = createSmartAccountClient({
          account: safeAccount,
          chain: baseSepolia,
          bundlerTransport: http(pimlicoUrl),
          paymaster: pimlicoClient,
          userOperation: {
            estimateFeesPerGas: async () => {
              return (await pimlicoClient.getUserOperationGasPrice()).fast;
            },
          },
        });
        let finalArgs = args;
        if (actionType === "register" && userRole === "patient") {
          const publicKey = await derivePublicKeyFromAddress(safeAccount.address);
          finalArgs = [...args, publicKey];
        }
        //  args = actionType === "register" && userRole === "patient" ? [...args, publicKey] : args;
        const hash = await smartClient.sendTransaction({
          to: contractAddress,

          data: encodeFunctionData({
            abi,
            functionName,
            args: finalArgs,
          }),
        });

        setIsPending(false);
        setIsWaiting(true);

        await publicClient.waitForTransactionReceipt({ hash, timeout: 120000 });

        if (actionType === "register") {
          // Small delay to let the "Vault Ready" animation finish
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Redirect based on role
          if (userRole === "patient") {
            router.push("/dashboard/patient");
          } else if (userRole === "doctor") {
            router.push("/dashboard/doctor");
          }
        }
      } catch (error: any) {
        setIsPending(false);
        setIsWaiting(false);
        await disconnect({ namespace: "eip155" });
        console.error("Gasless Tx Failed:", error);

        // 3. Robust Error Handling
        if (error instanceof BaseError) {
          console.error("Viem/Contract Error:", error.shortMessage);
        } else if (error?.message?.includes("user rejected")) {
          console.error("User cancelled the signing request.");
        } else if (error?.message?.includes("paymaster")) {
          console.error("Pimlico Paymaster error: Check your balance or API key.");
        } else {
          console.error("Gasless Tx Failed:", error.message || error);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletClient, contractAddress, abi, publicClient, actionType, userRole, router],
  );

  return {
    sendTx,
    isPending,
    isWaiting,
  };
};

export default useGasslessTxn;
