"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { hederaTestnet, hedera } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Hedera Testnet chain ID for explicit use in hooks
export const HEDERA_TESTNET_CHAIN_ID = hederaTestnet.id; // 296

const wagmiConfig = createConfig({
    chains: [hederaTestnet, hedera],
    transports: {
        [hederaTestnet.id]: http("https://testnet.hashio.io/api"),
        [hedera.id]: http("https://mainnet.hashio.io/api"),
    },
    connectors: [
        injected()
    ],
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
