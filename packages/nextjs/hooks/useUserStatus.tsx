import { useMemo } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "urql";
import { CHECK_USER_QUERY } from "~~/graphql/queries/auth";

export const useUserStatus = () => {
  const { address, isConnected } = useAppKitAccount();
  const shouldPause = isConnected === false || address === undefined;
  const [{ data, fetching, error }] = useQuery({
    query: CHECK_USER_QUERY,
    variables: { id: address?.toLowerCase() ?? "" },
    requestPolicy: "cache-and-network",
    pause: shouldPause,
  });

  const isFirstTime = useMemo(() => {
    // If we haven't connected or are still fetching, we don't know yet
    if (!isConnected || !address || fetching) return null;

    // 4. Fallback: If there's an error (server down/table missing), treat as first-time
    if (error) {
      console.warn("User status check error:", error);
      return true;
    }

    // Check if the user exists in either the patient or gp table
    const registered = !!(data?.patient || data?.gp);
    return !registered;
  }, [data, fetching, error, isConnected, address]);

  return {
    isFirstTime,
    loading: fetching,
    error,
  };
};
