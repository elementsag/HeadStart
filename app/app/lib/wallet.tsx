"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { hederaTestnet, hedera } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const wagmiConfig = createConfig({
    chains: [hederaTestnet, hedera],
    transports: {
        [hederaTestnet.id]: http(),
        [hedera.id]: http(),
    },
    // The injected connector automatically discovers MetaMask, HashPack (v6 via EIP-6963), etc.
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
