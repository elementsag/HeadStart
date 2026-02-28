"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, walletConnectWallet, coinbaseWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, http } from "wagmi";
import { hederaTestnet, hedera } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const PROJECT_ID = "5b12871146603aeb001099fd87aa192d"; // WalletConnect Public Project ID

export const hashpackWallet = () => {
    // We emulate HashPack by wrapping WalletConnect, which HashPack fully supports
    const wcWallet = walletConnectWallet({ projectId: PROJECT_ID });
    return {
        ...wcWallet,
        id: "hashpack",
        name: "HashPack",
        iconUrl: "https://raw.githubusercontent.com/Hashpack/brand-assets/main/Logo/logo-vector-transparent.png",
        iconBackground: "#000",
    };
};

const config = getDefaultConfig({
    appName: "HeadStart Launchpad",
    projectId: PROJECT_ID,
    chains: [hederaTestnet, hedera],
    wallets: [
        {
            groupName: "Hedera Supported",
            wallets: [hashpackWallet, metaMaskWallet, walletConnectWallet],
        },
        {
            groupName: "Other",
            wallets: [coinbaseWallet, rainbowWallet],
        },
    ],
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
