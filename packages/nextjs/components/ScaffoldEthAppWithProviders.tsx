"use client";

import "../services/web3/appkit";
import { PermissionlessProvider } from "@permissionless/wagmi";
import { PonderProvider } from "@ponder/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
//import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { Config, WagmiProvider, cookieToInitialState } from "wagmi";
import { client } from "~~/lib/ponder";
import { capabilities, wagmiAdapter } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div>
        <main className="min-h-screen bg-background flex flex-col bg bg-hero bg-repeat">{children}</main>
        {/* <Footer /> */}
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies: string | null;
}) => {
  // const { resolvedTheme } = useTheme();
  // const isDarkMode = resolvedTheme === "dark";
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);
  // Create the modal

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <PonderProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <PermissionlessProvider capabilities={capabilities}>
            <ProgressBar height="3px" color="#2299dd" />
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </PermissionlessProvider>
        </QueryClientProvider>
      </PonderProvider>
    </WagmiProvider>
  );
};
