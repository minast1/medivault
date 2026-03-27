import { networks, projectId, wagmiAdapter } from "./wagmiConfig";
import { createAppKit } from "@reown/appkit/react";

const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId as string,
  networks: networks,
  defaultNetwork: networks[0],
  themeMode: "light",
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    socials: ["google"],
  },
});
