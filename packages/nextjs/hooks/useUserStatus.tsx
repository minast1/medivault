import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";

export const useUserStatus = () => {
  const { address, isConnected } = useAppKitAccount();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!isConnected || !address) return;
      setLoading(true);

      try {
        // Query Ponder's GraphQL endpoint directly
        const response = await fetch("http://localhost:42069/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query CheckUser($id: String!) {
                patient(id: $id) { id }
                gp(id: $id) { id }
              }
            `,
            variables: { id: address.toLowerCase() },
          }),
        });

        const result = await response.json();

        // If 'data' is missing or null, the table probably doesn't exist yet
        // In both cases (table missing OR user not found), they are "First Time"
        const registered = result.data?.patient || result.data?.gp;
        setIsFirstTime(!registered);
      } catch (err) {
        console.warn(err);
        // If the server is down or tables missing, treat as first-time/not-found
        setIsFirstTime(true);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [address, isConnected]);

  return { isFirstTime, loading };
};
