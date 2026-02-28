"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface StakingData {
    tokenName: string;
    tokenSymbol: string;
    totalStaked: number;
    userStaked: number;
    userEarned: number;
    apr: number;
    totalRewards: number;
    stakingEnd: number;
    totalStakers: number;
    tokenBalance: number;
}

// Mock staking pools
const MOCK_POOLS: StakingData[] = [
    {
        tokenName: "HeadStart Token",
        tokenSymbol: "HDST",
        totalStaked: 42500000,
        userStaked: 150000,
        userEarned: 3240,
        apr: 8500, // 85% in bps
        totalRewards: 15000000,
        stakingEnd: Date.now() / 1000 + 86400 * 67,
        totalStakers: 342,
        tokenBalance: 500000,
    },
    {
        tokenName: "Nebula Finance",
        tokenSymbol: "NEBU",
        totalStaked: 18750000,
        userStaked: 0,
        userEarned: 0,
        apr: 12000,
        totalRewards: 30000000,
        stakingEnd: Date.now() / 1000 + 86400 * 120,
        totalStakers: 128,
        tokenBalance: 0,
    },
    {
        tokenName: "Quantum Swap",
        tokenSymbol: "QSWP",
        totalStaked: 67800000,
        userStaked: 500000,
        userEarned: 12845,
        apr: 4500,
        totalRewards: 10000000,
        stakingEnd: Date.now() / 1000 + 86400 * 30,
        totalStakers: 891,
        tokenBalance: 200000,
    },
];

export default function StakingPanel() {
    const { isConnected } = useAccount();
    const [activePool, setActivePool] = useState(0);
    const [stakeAmount, setStakeAmount] = useState("");
    const [unstakeAmount, setUnstakeAmount] = useState("");
    const [action, setAction] = useState<"stake" | "unstake">("stake");

    const pool = MOCK_POOLS[activePool];
    const daysRemaining = Math.max(0, Math.floor((pool.stakingEnd - Date.now() / 1000) / 86400));

    return (
        <div>
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
                        fontSize: 14,
                    }}
                >
                    Stake launched tokens to earn rewards over time.
                </p>
            </div>

            {/* Pool selector */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 24,
                    overflowX: "auto",
                    paddingBottom: 4,
                }}
            >
                {MOCK_POOLS.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => setActivePool(i)}
                        className="glass-card"
                        style={{
                            padding: "16px 20px",
                            cursor: "pointer",
                            minWidth: 200,
                            border: activePool === i ? "1px solid var(--cyan)" : undefined,
                            boxShadow: activePool === i ? "0 0 20px var(--cyan-glow)" : undefined,
                            transform: activePool === i ? "translateY(-2px)" : undefined,
                            textAlign: "left",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: `linear-gradient(135deg, ${["var(--cyan)", "var(--magenta)", "var(--acid)"][i % 3]
                                        }, var(--void-elevated))`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                    fontSize: 14,
                                    color: "white",
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                {p.tokenSymbol.charAt(0)}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {p.tokenSymbol}
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 18,
                                fontWeight: 700,
                                color: "var(--acid)",
                            }}
                        >
                            {(p.apr / 100).toFixed(0)}% APR
                        </div>
                    </button>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                }}
                className="flex flex-col md:grid"
            >
                {/* Left - Pool stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Overview stats */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 16,
                            }}
                        >
                            {[
                                {
                                    label: "Total Staked",
                                    value: `${(pool.totalStaked / 1e6).toFixed(1)}M`,
                                    color: "var(--cyan)",
                                },
                                {
                                    label: "APR",
                                    value: `${(pool.apr / 100).toFixed(0)}%`,
                                    color: "var(--acid)",
                                },
                                {
                                    label: "Stakers",
                                    value: pool.totalStakers.toLocaleString(),
                                    color: "var(--text-primary)",
                                },
                                {
                                    label: "Days Left",
                                    value: daysRemaining.toString(),
                                    color: "var(--gold)",
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    style={{
                                        padding: 16,
                                        background: "var(--void)",
                                        borderRadius: 10,
                                        border: "1px solid var(--void-border)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: s.color,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {s.value}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "var(--font-body)",
                                            fontSize: 11,
                                            color: "var(--text-dim)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            marginTop: 6,
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Your position */}
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
                                height: 2,
                                background: "linear-gradient(90deg, var(--magenta), var(--gold))",
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

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 16px",
                                    background: "var(--void)",
                                    borderRadius: 8,
                                    border: "1px solid var(--void-border)",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 13,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    Staked
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "var(--cyan)",
                                    }}
                                >
                                    {pool.userStaked.toLocaleString()} {pool.tokenSymbol}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 16px",
                                    background: "var(--void)",
                                    borderRadius: 8,
                                    border: "1px solid var(--void-border)",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 13,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    Earned
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "var(--acid)",
                                    }}
                                >
                                    {pool.userEarned.toLocaleString()} {pool.tokenSymbol}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 16px",
                                    background: "var(--void)",
                                    borderRadius: 8,
                                    border: "1px solid var(--void-border)",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 13,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    Wallet Balance
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {pool.tokenBalance.toLocaleString()} {pool.tokenSymbol}
                                </span>
                            </div>

                            {pool.userEarned > 0 && (
                                <button className="btn-acid" style={{ width: "100%" }}>
                                    Claim {pool.userEarned.toLocaleString()} {pool.tokenSymbol}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right - Stake/Unstake action */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        {/* Stake/Unstake toggle */}
                        <div className="tab-group" style={{ marginBottom: 24 }}>
                            <button
                                className={`tab-item ${action === "stake" ? "active" : ""}`}
                                onClick={() => setAction("stake")}
                            >
                                Stake
                            </button>
                            <button
                                className={`tab-item ${action === "unstake" ? "active" : ""}`}
                                onClick={() => setAction("unstake")}
                            >
                                Unstake
                            </button>
                        </div>

                        <div style={{ marginBottom: 20 }}>
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
                                {action === "stake" ? "Amount to Stake" : "Amount to Unstake"}
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="0.00"
                                    value={action === "stake" ? stakeAmount : unstakeAmount}
                                    onChange={(e) =>
                                        action === "stake"
                                            ? setStakeAmount(e.target.value)
                                            : setUnstakeAmount(e.target.value)
                                    }
                                    style={{ paddingRight: 90 }}
                                />
                                <button
                                    onClick={() => {
                                        const max =
                                            action === "stake"
                                                ? pool.tokenBalance.toString()
                                                : pool.userStaked.toString();
                                        action === "stake"
                                            ? setStakeAmount(max)
                                            : setUnstakeAmount(max);
                                    }}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "var(--void-surface)",
                                        border: "1px solid var(--void-border)",
                                        borderRadius: 4,
                                        padding: "4px 10px",
                                        color: "var(--cyan)",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        cursor: "pointer",
                                        fontWeight: 700,
                                    }}
                                >
                                    MAX
                                </button>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 8,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        color: "var(--text-dim)",
                                    }}
                                >
                                    Available:{" "}
                                    {action === "stake"
                                        ? pool.tokenBalance.toLocaleString()
                                        : pool.userStaked.toLocaleString()}{" "}
                                    {pool.tokenSymbol}
                                </span>
                            </div>
                        </div>

                        {/* Quick amount buttons */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: 8,
                                marginBottom: 24,
                            }}
                        >
                            {[25, 50, 75, 100].map((pct) => {
                                const max =
                                    action === "stake" ? pool.tokenBalance : pool.userStaked;
                                return (
                                    <button
                                        key={pct}
                                        onClick={() => {
                                            const val = ((max * pct) / 100).toString();
                                            action === "stake"
                                                ? setStakeAmount(val)
                                                : setUnstakeAmount(val);
                                        }}
                                        style={{
                                            padding: "8px",
                                            background: "var(--void)",
                                            border: "1px solid var(--void-border)",
                                            borderRadius: 6,
                                            color: "var(--text-secondary)",
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 12,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {pct}%
                                    </button>
                                );
                            })}
                        </div>

                        {!isConnected ? (
                            <ConnectButton.Custom>
                                {({ openConnectModal }: any) => (
                                    <button
                                        className="btn-primary"
                                        onClick={openConnectModal}
                                        style={{ width: "100%", fontSize: 14, padding: "14px" }}
                                    >
                                        Connect Wallet
                                    </button>
                                )}
                            </ConnectButton.Custom>
                        ) : (
                            <button
                                className={action === "stake" ? "btn-primary" : "btn-magenta"}
                                style={{ width: "100%", fontSize: 14, padding: "14px" }}
                            >
                                {action === "stake" ? "📥 Stake Tokens" : "📤 Unstake Tokens"}
                            </button>
                        )}
                    </div>

                    {/* Reward info */}
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
                            Reward Projection
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { period: "Daily", multiplier: 1 / 365 },
                                { period: "Weekly", multiplier: 7 / 365 },
                                { period: "Monthly", multiplier: 30 / 365 },
                                { period: "Yearly", multiplier: 1 },
                            ].map((p) => {
                                const amount = parseFloat(
                                    action === "stake"
                                        ? stakeAmount || "0"
                                        : pool.userStaked.toString()
                                );
                                const reward = (amount * (pool.apr / 10000) * p.multiplier);
                                return (
                                    <div
                                        key={p.period}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 0",
                                            borderBottom: "1px solid var(--void-border)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: "var(--font-body)",
                                                fontSize: 13,
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {p.period}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "var(--acid)",
                                            }}
                                        >
                                            +{reward.toFixed(2)} {pool.tokenSymbol}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
