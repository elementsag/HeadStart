import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "./lib/wallet";

export const metadata: Metadata = {
  title: "HeadStart — Token Launchpad on Hedera",
  description:
    "Fair launch tokens with automatic LP creation, built-in staking rewards, and transparent fundraising on Hedera.",
  keywords: ["hedera", "token", "launchpad", "staking", "DeFi", "crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise-overlay grid-bg">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
