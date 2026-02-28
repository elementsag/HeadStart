"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { LaunchCardData } from "./LaunchCard";
import GameEmbed from "./GameEmbed";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TokenChart from "./TokenChart";

export default function TokenDetail({
    tokenData,
    onBack,
}: {
    tokenData: any;
    onBack: () => void;
}) {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState("chart");
    const [activeView, setActiveView] = useState<"chart" | "games">("chart");
    const [showChart, setShowChart] = useState(true);
    const [showGames, setShowGames] = useState(false);
    const [amount, setAmount] = useState("");

    const progress =
        tokenData.hardCap > 0
            ? Math.min((tokenData.totalRaised / tokenData.hardCap) * 100, 100)
            : 0;

    return (
        <div>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    cursor: "pointer",
                    marginBottom: 24,
                    padding: 0,
                    transition: "color 0.2s",
                }}
            >
                ← Back to Launches
            </button>

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 32,
                    flexWrap: "wrap",
                    gap: 16,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: "var(--cyan)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 24,
                            color: "white",
                        }}
                    >
                        {tokenData.symbol.charAt(0)}
                    </div>
                    <div>
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 28,
                                fontWeight: 800,
                                color: "var(--text-primary)",
                                lineHeight: 1.2,
                            }}
                        >
                            {tokenData.name}
                        </h2>
                        <div
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 14,
                                color: "var(--text-dim)",
                            }}
                        >
                            ${tokenData.symbol}
                        </div>
                    </div>
                </div>
                <span
                    className={`badge ${tokenData.state === 0
                        ? "badge-live"
                        : tokenData.state === 2
                            ? "badge-ended"
                            : "badge-upcoming"
                        }`}
                    style={{ fontSize: 13, padding: "6px 14px" }}
                >
                    {tokenData.state === 0
                        ? "🟢 LIVE"
                        : tokenData.state === 2
                            ? "FINALIZED"
                            : "SUCCEEDED"}
                </span>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: 24,
                }}
                className="flex flex-col md:grid"
            >
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Chart/Games toggles */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                            padding: "12px 0",
                        }}
                    >
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                cursor: "pointer",
                            }}
                        >
                            <div
                                className={`toggle-switch ${showChart ? "active" : ""}`}
                                onClick={() => {
                                    setShowChart(!showChart);
                                    if (!showChart) setActiveView("chart");
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: showChart ? "var(--cyan)" : "var(--text-dim)",
                                }}
                            >
                                📈 Chart
                            </span>
                        </label>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                cursor: "pointer",
                            }}
                        >
                            <div
                                className={`toggle-switch ${showGames ? "active" : ""}`}
                                onClick={() => {
                                    setShowGames(!showGames);
                                    if (!showGames) setActiveView("games");
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: showGames ? "var(--cyan)" : "var(--text-dim)",
                                }}
                            >
                                🎮 Games
                            </span>
                        </label>
                    </div>

                    {/* Active view tabs (when both enabled) */}
                    {showChart && showGames && (
                        <div className="tab-group" style={{ maxWidth: 300 }}>
                            <button
                                className={`tab-item ${activeView === "chart" ? "active" : ""}`}
                                onClick={() => setActiveView("chart")}
                            >
                                📈 Chart
                            </button>
                            <button
                                className={`tab-item ${activeView === "games" ? "active" : ""}`}
                                onClick={() => setActiveView("games")}
                            >
                                🎮 Games
                            </button>
                        </div>
                    )}

                    {/* Chart */}
                    {showChart && activeView === "chart" && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <TokenChart symbol={tokenData.symbol} />
                        </div>
                    )}

                    {/* Games */}
                    {showGames && activeView === "games" && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <GameEmbed tokenSymbol={tokenData.symbol} />
                        </div>
                    )}

                    {/* No content */}
                    {!showChart && !showGames && (
                        <div
                            className="glass-card"
                            style={{
                                padding: 60,
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                            <p
                                style={{
                                    fontFamily: "var(--font-body)",
                                    color: "var(--text-dim)",
                                    fontSize: 14,
                                }}
                            >
                                Enable Chart or Games using the toggles above
                            </p>
                        </div>
                    )}

                    {/* About */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                marginBottom: 16,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            About {tokenData.name}
                        </h3>
                        <p
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: 14,
                                color: "var(--text-secondary)",
                                lineHeight: 1.7,
                            }}
                        >
                            {tokenData.name} is a community-driven project launched on HeadStart.
                            The project features automatic liquidity provisioning on SaucerSwap and
                            built-in staking rewards. Contributors receive assets proportional to
                            their HBAR contribution after the launch finalizes.
                        </p>
                    </div>
                </div>

                {/* Right column - Contribute */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Progress */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 6,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 18,
                                        color: "var(--cyan)",
                                        fontWeight: 700,
                                    }}
                                >
                                    {tokenData.totalRaised.toLocaleString("en-US")} ℏ
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 14,
                                        color: "var(--text-dim)",
                                    }}
                                >
                                    {tokenData.hardCap.toLocaleString("en-US")} ℏ
                                </span>
                            </div>
                            <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%`, borderRadius: 6 }}
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 6,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 13,
                                        color: "var(--acid)",
                                        fontWeight: 700,
                                    }}
                                >
                                    {progress.toFixed(1)}% Funded
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        color: "var(--text-dim)",
                                    }}
                                >
                                    Soft Cap: {tokenData.softCap.toLocaleString("en-US")} ℏ
                                </span>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                                marginBottom: 20,
                            }}
                        >
                            {[
                                { label: "Contributors", value: tokenData.contributors.toString() },
                                {
                                    label: "Time Left",
                                    value:
                                        tokenData.timeRemaining > 0
                                            ? `${Math.floor(tokenData.timeRemaining / 86400)}d ${Math.floor(
                                                (tokenData.timeRemaining % 86400) / 3600
                                            )}h`
                                            : "Ended",
                                },
                                {
                                    label: "Asset Price",
                                    value: `${tokenData.tokenPrice.toFixed(4)} ℏ`,
                                },
                                { label: "State", value: ["Active", "Succeeded", "Finalized", "Failed"][tokenData.state] },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    style={{
                                        padding: 10,
                                        background: "var(--void)",
                                        borderRadius: 8,
                                        border: "1px solid var(--void-border)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {s.value}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "var(--font-body)",
                                            fontSize: 10,
                                            color: "var(--text-dim)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            marginTop: 2,
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contribute form */}
                        {tokenData.state === 0 && (
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 8,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Contribute HBAR
                                </label>
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                {amount && parseFloat(amount) > 0 && (
                                    <div
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 12,
                                            color: "var(--text-dim)",
                                            marginBottom: 12,
                                            marginTop: 8,
                                        }}
                                    >
                                        ≈{" "}
                                        {(
                                            parseFloat(amount) / tokenData.tokenPrice
                                        ).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                                        {tokenData.symbol} assets
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Connect / Contribute Button */}
                        {!isConnected ? (
                            <ConnectButton.Custom>
                                {({ openConnectModal }: any) => (
                                    <button
                                        className="btn-primary"
                                        onClick={openConnectModal}
                                        style={{
                                            width: "100%",
                                            fontSize: 16,
                                            padding: "16px 24px",
                                        }}
                                    >
                                        Connect Wallet
                                    </button>
                                )}
                            </ConnectButton.Custom>
                        ) : (
                            <button
                                className="btn-primary"
                                disabled={!amount || isNaN(Number(amount))}
                                style={{
                                    width: "100%",
                                    fontSize: 16,
                                    padding: "16px 24px",
                                    opacity: !amount || isNaN(Number(amount)) ? 0.4 : 1,
                                }}
                            >
                                Contribute {amount} HBAR
                            </button>
                        )}
                    </div>

                    {tokenData.state === 2 && (
                        <button
                            className="btn-acid"
                            style={{ width: "100%", padding: "14px" }}
                        >
                            Claim Assets
                        </button>
                    )}
                </div>

                {/* Token distribution */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                            marginBottom: 16,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Allocation
                    </h3>
                    {[
                        { label: "Sale", percent: 60, color: "var(--cyan)" },
                        { label: "LP", percent: 20, color: "var(--acid)" },
                        { label: "Staking", percent: 15, color: "var(--magenta)" },
                        { label: "Creator", percent: 5, color: "var(--gold)" },
                    ].map((a) => (
                        <div
                            key={a.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: a.color,
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: 13,
                                    color: "var(--text-secondary)",
                                    flex: 1,
                                }}
                            >
                                {a.label}
                            </span>
                            <div
                                style={{
                                    width: 100,
                                    height: 4,
                                    background: "var(--void)",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${a.percent}%`,
                                        height: "100%",
                                        background: a.color,
                                        borderRadius: 2,
                                    }}
                                />
                            </div>
                            <span
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 12,
                                    color: a.color,
                                    fontWeight: 700,
                                    minWidth: 32,
                                    textAlign: "right",
                                }}
                            >
                                {a.percent}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
