import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { cn } from "~~/lib/utils";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = async ({ children }: { children: React.ReactNode }) => {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  return (
    <html suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders cookies={cookies}>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
