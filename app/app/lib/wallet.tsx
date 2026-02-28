"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { hederaTestnet, hedera } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
    appName: "HeadStart Launchpad",
    projectId: "YOUR_PROJECT_ID", // Required for WalletConnect v2
    chains: [hederaTestnet, hedera],
    transports: {
        [hederaTestnet.id]: http(),
        [hedera.id]: http(),
    },
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: "var(--cyan)",
                        accentColorForeground: "var(--void)",
                        borderRadius: "large",
                        fontStack: "system",
                        overlayBlur: "small",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Re-export useAccount to keep compatibility with existing components (if needed, or they can import directly)
export { useAccount as useWallet } from "wagmi";
