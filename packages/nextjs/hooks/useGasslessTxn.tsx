import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSendTransaction, useWaitForTransactionReceipt } from "@permissionless/wagmi";
import { Abi, Address, encodeFunctionData } from "viem";

const useGasslessTxn = (
  contractAddress: Address | undefined,
  abi: Abi | undefined,
  userRole?: "patient" | "doctor",
) => {
  const router = useRouter();

  const { sendTransaction, data: txId, isPending: isSending, error: sendError } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ id: txId });

  const canRegister = !!contractAddress && !!abi;

  //Dynamic Trigger Function
  const register = (functionName: string, args: any[]) => {
    if (!canRegister) {
      console.error("Registration failed: Contract address or ABI is undefined");
      return;
    }

    sendTransaction({
      to: contractAddress,
      data: encodeFunctionData({
        abi,
        functionName,
        args,
      }),
    });
  };

  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() =>
        userRole === "patient" ? router.push("/dashboard/patient") : router.push("/dashboard/doctor"),
      );
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, router, userRole]);

  return {
    register,
    isSending,
    canRegister,
    isConfirming,
    isConfirmed,
    error: sendError || receiptError,
  };
};

export default useGasslessTxn;
