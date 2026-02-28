"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface StakingPool {
    tokenName: string;
    tokenSymbol: string;
    totalStaked: number;
    userStaked: number;
    userEarned: number;
    apr: number;          // in basis points (e.g. 8500 = 85%)
    totalRewards: number;
    stakingEnd: number;   // unix timestamp
    totalStakers: number;
    tokenBalance: number;
}

const MOCK_POOLS: StakingPool[] = [
    {
        tokenName: "HeadStart Token", tokenSymbol: "HDST",
        totalStaked: 42_500_000, userStaked: 150_000, userEarned: 3240,
        apr: 8500, totalRewards: 15_000_000,
        stakingEnd: Date.now() / 1000 + 86400 * 67,
        totalStakers: 342, tokenBalance: 500_000,
    },
    {
        tokenName: "Nebula Finance", tokenSymbol: "NEBU",
        totalStaked: 18_750_000, userStaked: 0, userEarned: 0,
        apr: 12000, totalRewards: 30_000_000,
        stakingEnd: Date.now() / 1000 + 86400 * 120,
        totalStakers: 128, tokenBalance: 0,
    },
    {
        tokenName: "Quantum Swap", tokenSymbol: "QSWP",
        totalStaked: 67_800_000, userStaked: 500_000, userEarned: 12845,
        apr: 4500, totalRewards: 10_000_000,
        stakingEnd: Date.now() / 1000 + 86400 * 30,
        totalStakers: 891, tokenBalance: 200_000,
    },
];

function formatNum(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
}

export default function StakingPanel() {
    const { isConnected } = useAccount();
    const [activePool, setActivePool] = useState(0);
    const [amount, setAmount] = useState("");
    const [action, setAction] = useState<"stake" | "unstake">("stake");

    const pool = MOCK_POOLS[activePool];
    const daysLeft = Math.max(0, Math.floor((pool.stakingEnd - Date.now() / 1000) / 86400));
    const aprPct = (pool.apr / 100).toFixed(0);
    const maxAmount = action === "stake" ? pool.tokenBalance : pool.userStaked;

    const projectedReward = (n: number, mult: number) => {
        const a = parseFloat(amount || "0");
        const base = action === "stake" ? a : pool.userStaked;
        return (base * (pool.apr / 10000) * mult).toFixed(2);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 28,
                        fontWeight: 800,
                        marginBottom: 8,
                        color: "var(--text-primary)",
                    }}
                >
                    Staking
                </h2>
                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-secondary)",
                        fontSize: 16,
                    }}
                >
                    Select a pool, configure your stake, and start earning passive rewards securely.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 32,
                }}
                className="flex flex-col md:grid"
            >
                {/* Left Column: Pool Selection & Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Pool Selection */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "var(--cyan)",
                                marginBottom: 16,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            1. Select Pool
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {MOCK_POOLS.map((p, i) => {
                                const active = activePool === i;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => { setActivePool(i); setAmount(""); }}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: 16,
                                            background: active ? "rgba(0, 240, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                                            border: active ? "1px solid var(--cyan)" : "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: 12,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.06)";
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255, 255, 255, 0.2)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.03)";
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255, 255, 255, 0.1)";
                                            }
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div
                                                style={{
                                                    width: 44, height: 44, borderRadius: 10,
                                                    background: active ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
                                                    color: active ? "var(--void)" : "var(--text-primary)", flexShrink: 0,
                                                    transition: "all 0.2s ease"
                                                }}
                                            >
                                                {p.tokenSymbol.charAt(0)}
                                            </div>
                                            <div style={{ textAlign: "left" }}>
                                                <div style={{
                                                    fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                                                    color: active ? "var(--cyan)" : "var(--text-primary)",
                                                }}>
                                                    {p.tokenName}
                                                </div>
                                                <div style={{
                                                    fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)",
                                                }}>
                                                    ${p.tokenSymbol}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{
                                                fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800,
                                                color: active ? "var(--cyan)" : "var(--acid)",
                                            }}>
                                                {(p.apr / 100).toFixed(0)}%
                                            </div>
                                            <div style={{
                                                fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)",
                                                textTransform: "uppercase", letterSpacing: "0.05em",
                                                fontWeight: 600,
                                            }}>
                                                APR
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pool Details */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "var(--acid)",
                                marginBottom: 16,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Pool Overview
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[
                                { label: "Total Staked", value: formatNum(pool.totalStaked), color: "var(--cyan)" },
                                { label: "APR", value: `${aprPct}%`, color: "var(--acid)" },
                                { label: "Stakers", value: pool.totalStakers.toLocaleString(), color: "var(--text-primary)" },
                                { label: "Days Left", value: daysLeft.toString(), color: "var(--gold)" },
                            ].map(s => (
                                <div key={s.label} style={{
                                    padding: 16,
                                    background: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: 8,
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                }}>
                                    <div style={{
                                        fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
                                        color: s.color,
                                    }}>{s.value}</div>
                                    <div style={{
                                        fontFamily: "var(--font-body)", fontSize: 11,
                                        color: "var(--text-secondary)", textTransform: "uppercase",
                                        letterSpacing: "0.08em", marginTop: 4, fontWeight: 600
                                    }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column: Manage Stake & Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Action form */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "var(--magenta)",
                                marginBottom: 16,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            2. Manage Stake
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* Toggle Stake/Unstake */}
                            <div style={{
                                display: "flex", gap: 8, padding: 6,
                                background: "rgba(255, 255, 255, 0.05)", borderRadius: 12,
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                            }}>
                                {(["stake", "unstake"] as const).map(a => (
                                    <button
                                        key={a}
                                        onClick={() => { setAction(a); setAmount(""); }}
                                        style={{
                                            flex: 1, padding: "12px",
                                            background: action === a ? (a === "stake" ? "var(--cyan)" : "var(--magenta)") : "transparent",
                                            borderRadius: 8, cursor: "pointer",
                                            fontFamily: "var(--font-display)", fontWeight: 800,
                                            fontSize: 14, color: action === a ? "var(--void)" : "var(--text-primary)",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                            border: "none", transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (action !== a) {
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.08)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (action !== a) {
                                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                            }
                                        }}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>

                            {/* Amount Input */}
                            <div>
                                <div style={{
                                    display: "flex", justifyContent: "space-between", marginBottom: 8,
                                }}>
                                    <label style={{
                                        fontFamily: "var(--font-body)", fontSize: 13,
                                        color: "var(--text-primary)", textTransform: "uppercase",
                                        letterSpacing: "0.08em", fontWeight: 600
                                    }}>
                                        Amount ({pool.tokenSymbol})
                                    </label>
                                    <span style={{
                                        fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", fontWeight: 600
                                    }}>
                                        Available: <span style={{ color: "var(--text-primary)" }}>{formatNum(maxAmount)}</span>
                                    </span>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <input
                                        className="input-field"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        style={{
                                            paddingRight: 80,
                                            fontSize: 18,
                                            padding: "16px 80px 16px 16px",
                                            background: "rgba(255, 255, 255, 0.05)",
                                            border: "1px solid rgba(255, 255, 255, 0.15)",
                                            color: "var(--text-primary)"
                                        }}
                                    />
                                    <button
                                        onClick={() => setAmount(maxAmount.toString())}
                                        style={{
                                            position: "absolute", right: 12, top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "var(--cyan)",
                                            border: "none",
                                            borderRadius: 6, padding: "6px 12px",
                                            color: "var(--void)", fontFamily: "var(--font-mono)",
                                            fontSize: 12, fontWeight: 800, cursor: "pointer",
                                            transition: "opacity 0.2s"
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                                    >MAX</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview / Position */}
                    <div
                        className="glass-card"
                        style={{
                            padding: 24,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: "var(--text-primary)",
                            }}
                        />
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                marginBottom: 20,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Your Position
                        </h3>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                marginBottom: 24,
                            }}
                        >
                            {[
                                { label: "Staked", value: formatNum(pool.userStaked), color: "var(--cyan)" },
                                { label: "Earned", value: formatNum(pool.userEarned), color: "var(--acid)" },
                                { label: "Est. Daily", value: projectedReward(0, 1 / 365), color: "var(--text-primary)" },
                                { label: "Est. Monthly", value: projectedReward(0, 30 / 365), color: "var(--text-primary)" },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    style={{
                                        padding: 16,
                                        background: "rgba(255, 255, 255, 0.03)",
                                        borderRadius: 8,
                                        border: "1px solid rgba(255, 255, 255, 0.08)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: m.color,
                                        }}
                                    >
                                        {m.value}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "var(--font-body)",
                                            fontSize: 11,
                                            color: "var(--text-secondary)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            marginTop: 4,
                                            fontWeight: 600
                                        }}
                                    >
                                        {m.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pool.userEarned > 0 && (
                            <button
                                style={{
                                    width: "100%", padding: "14px", marginBottom: 20,
                                    background: "rgba(57,255,20,0.15)",
                                    border: "1px solid var(--acid)",
                                    borderRadius: 10,
                                    fontFamily: "var(--font-display)", fontWeight: 800,
                                    fontSize: 15, color: "var(--acid)",
                                    cursor: "pointer", transition: "all 0.2s",
                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(57,255,20,0.25)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(57,255,20,0.15)")}
                            >
                                Claim {formatNum(pool.userEarned)} {pool.tokenSymbol} Rewards
                            </button>
                        )}

                        {/* Deploy / Connect button */}
                        {!isConnected ? (
                            <ConnectButton.Custom>
                                {({ openConnectModal }: any) => (
                                    <button
                                        className="btn-primary"
                                        onClick={openConnectModal}
                                        style={{
                                            width: "100%",
                                            fontSize: 16,
                                            padding: "16px 32px",
                                            boxShadow: "0 4px 14px rgba(0, 240, 255, 0.3)"
                                        }}
                                    >
                                        Connect Wallet to Stake
                                    </button>
                                )}
                            </ConnectButton.Custom>
                        ) : (
                            <button
                                className="btn-primary"
                                disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
                                style={{
                                    width: "100%",
                                    fontSize: 16,
                                    padding: "16px 32px",
                                    opacity: !amount || isNaN(Number(amount)) || Number(amount) <= 0 ? 0.4 : 1,
                                    background: action === "stake" ? "var(--cyan)" : "var(--magenta)",
                                    color: "var(--void)",
                                    boxShadow: action === "stake" ? "0 4px 14px rgba(0, 240, 255, 0.3)" : "0 4px 14px rgba(255, 0, 110, 0.3)"
                                }}
                            >
                                {action === "stake" ? "Stake" : "Unstake"} {amount ? `${amount} ${pool.tokenSymbol}` : ""}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
