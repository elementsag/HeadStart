"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { hederaTestnet, hedera } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { defineChain } from "viem";

// Override chain definitions with multicall3 address
// Standard address deployed on 250+ chains: https://multicall3.com
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`;

const hederaTestnetChain = defineChain({
    ...hederaTestnet,
    contracts: {
        multicall3: {
            address: MULTICALL3,
        },
    },
});

const hederaMainnetChain = defineChain({
    ...hedera,
    contracts: {
        multicall3: {
            address: MULTICALL3,
        },
    },
});

const wagmiConfig = createConfig({
    chains: [hederaTestnetChain, hederaMainnetChain],
    transports: {
        [hederaTestnetChain.id]: http(),
        [hederaMainnetChain.id]: http(),
    },
    // Disable multicall batching — Hedera may not have Multicall3 deployed.
    // wagmi will fall back to individual eth_call for each read.
    batch: {
        multicall: false,
    },
    connectors: [
        injected()
    ]
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
