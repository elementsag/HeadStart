"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectWalletInline } from "./ConnectWallet";
import { parseEther } from "viem";
import { STAKING_ABI, ERC20_ABI } from "../lib/contracts";
import { useStakingPools } from "../lib/hooks";
import type { LiveStakingPool } from "../lib/hooks";

function formatNum(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
}

export default function StakingPanel() {
    const { isConnected, address: userAddress } = useAccount();
    const { pools, isLoading } = useStakingPools();
    const [activePool, setActivePool] = useState(0);
    const [amount, setAmount] = useState("");
    const [action, setAction] = useState<"stake" | "unstake">("stake");
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const [needsApproval, setNeedsApproval] = useState(false);

    const { writeContract, data: txHash, isPending, error: txError, reset: resetTx } = useWriteContract();
    const { isLoading: txConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const isTxPending = isPending || txConfirming;

    useEffect(() => {
        if (txConfirmed) {
            setTxStatus("✅ Transaction confirmed!");
            setAmount("");
            setTimeout(() => { setTxStatus(null); resetTx(); }, 3000);
        }
        if (txError) {
            setTxStatus(`❌ ${txError.message?.slice(0, 80)}`);
            setTimeout(() => setTxStatus(null), 5000);
        }
    }, [txConfirmed, txError]);

    // Filter to only show initialized staking pools
    const activePools = pools.filter((p) => p.initialized);

    const pool: LiveStakingPool | null = activePools[activePool] || null;
    const daysLeft = pool ? Math.max(0, Math.floor((pool.stakingEnd - Date.now() / 1000) / 86400)) : 0;
    const aprPct = pool ? (pool.apr / 100).toFixed(0) : "0";
    const maxAmount = pool ? (action === "stake" ? pool.tokenBalance : pool.userStaked) : 0;

    const projectedReward = (mult: number) => {
        if (!pool) return "0.00";
        const a = parseFloat(amount || "0");
        const base = action === "stake" ? a : pool.userStaked;
        return (base * (pool.apr / 10000) * mult).toFixed(2);
    };

    const handleApprove = () => {
        if (!pool) return;
        writeContract({
            address: pool.tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [pool.stakingAddress as `0x${string}`, parseEther(amount || "0")],
        });
        setTxStatus("⏳ Approving tokens...");
        setNeedsApproval(false);
    };

    const handleStake = () => {
        if (!pool || !amount) return;
        writeContract({
            address: pool.stakingAddress as `0x${string}`,
            abi: STAKING_ABI,
            functionName: "stake",
            args: [parseEther(amount)],
        });
        setTxStatus("⏳ Staking tokens...");
    };

    const handleUnstake = () => {
        if (!pool || !amount) return;
        writeContract({
            address: pool.stakingAddress as `0x${string}`,
            abi: STAKING_ABI,
            functionName: "unstake",
            args: [parseEther(amount)],
        });
        setTxStatus("⏳ Unstaking tokens...");
    };

    const handleClaimReward = () => {
        if (!pool) return;
        writeContract({
            address: pool.stakingAddress as `0x${string}`,
            abi: STAKING_ABI,
            functionName: "claimReward",
        });
        setTxStatus("⏳ Claiming rewards...");
    };

    const handleExit = () => {
        if (!pool) return;
        writeContract({
            address: pool.stakingAddress as `0x${string}`,
            abi: STAKING_ABI,
            functionName: "exit",
        });
        setTxStatus("⏳ Exiting pool...");
    };

    const handleAction = () => {
        if (action === "stake") {
            // For staking, user needs to approve first
            setNeedsApproval(true);
            handleApprove();
        } else {
            handleUnstake();
        }
    };

    // After approval succeeds, stake
    useEffect(() => {
        if (txConfirmed && needsApproval === false && amount && action === "stake") {
            // This was the approval tx, now stake
        }
    }, [txConfirmed]);

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
                    {isLoading
                        ? "Loading staking pools from chain..."
                        : activePools.length > 0
                            ? `${activePools.length} active staking pool${activePools.length !== 1 ? "s" : ""} available`
                            : "No active staking pools yet. Pools are created when a launch is finalized."}
                </p>
            </div>

            {/* Tx Status Banner */}
            {txStatus && (
                <div style={{
                    padding: "12px 20px", marginBottom: 20, borderRadius: "var(--radius-md)",
                    background: txStatus.startsWith("✅") ? "rgba(106,168,106,0.1)" : txStatus.startsWith("❌") ? "rgba(193,85,126,0.1)" : "rgba(74,178,196,0.1)",
                    border: `1px solid ${txStatus.startsWith("✅") ? "var(--acid)" : txStatus.startsWith("❌") ? "var(--magenta)" : "var(--cyan)"}40`,
                    fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-primary)", fontWeight: 600,
                }}>
                    {txStatus}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>⏳</div>
                    <p style={{
                        fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontWeight: 600,
                    }}>Loading staking pools...</p>
                </div>
            )}

            {/* No pools */}
            {!isLoading && activePools.length === 0 && (
                <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
                    <p style={{
                        fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontWeight: 600,
                        marginBottom: 8,
                    }}>No Active Staking Pools</p>
                    <p style={{
                        fontFamily: "var(--font-body)", color: "var(--text-dim)", fontSize: 14,
                    }}>Staking pools are automatically created when a launch is finalized.</p>
                </div>
            )}

            {/* Pools available */}
            {!isLoading && activePools.length > 0 && pool && (
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
                                {activePools.map((p, i) => {
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
                                                background: active ? "rgba(74, 178, 196, 0.08)" : "rgba(255, 255, 255, 0.03)",
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

                            {/* Pool address chip */}
                            <div style={{
                                marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11,
                                color: "var(--text-dim)",
                            }}>
                                Contract: {pool.stakingAddress.slice(0, 10)}...{pool.stakingAddress.slice(-8)}
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

                                {/* Toggle */}
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

                        {/* Position / Preview */}
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
                                    { label: "Est. Daily", value: projectedReward(1 / 365), color: "var(--text-primary)" },
                                    { label: "Est. Monthly", value: projectedReward(30 / 365), color: "var(--text-primary)" },
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

                            {/* Claim rewards button */}
                            {pool.userEarned > 0 && (
                                <button
                                    onClick={handleClaimReward}
                                    disabled={isTxPending}
                                    style={{
                                        width: "100%", padding: "14px", marginBottom: 12,
                                        background: "rgba(106,168,106,0.15)",
                                        border: "1px solid var(--acid)",
                                        borderRadius: 10,
                                        fontFamily: "var(--font-display)", fontWeight: 800,
                                        fontSize: 15, color: "var(--acid)",
                                        cursor: "pointer", transition: "all 0.2s",
                                        textTransform: "uppercase", letterSpacing: "0.05em",
                                        opacity: isTxPending ? 0.4 : 1,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(106,168,106,0.25)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(106,168,106,0.15)")}
                                >
                                    Claim {pool.userEarned.toFixed(2)} {pool.tokenSymbol} Rewards
                                </button>
                            )}

                            {/* Exit button */}
                            {pool.userStaked > 0 && (
                                <button
                                    onClick={handleExit}
                                    disabled={isTxPending}
                                    style={{
                                        width: "100%", padding: "12px", marginBottom: 16,
                                        background: "transparent",
                                        border: "1px solid var(--void-border)",
                                        borderRadius: 10,
                                        fontFamily: "var(--font-display)", fontWeight: 700,
                                        fontSize: 13, color: "var(--text-secondary)",
                                        cursor: "pointer", transition: "all 0.2s",
                                        textTransform: "uppercase", letterSpacing: "0.05em",
                                        opacity: isTxPending ? 0.4 : 1,
                                    }}
                                >
                                    Exit Pool (Unstake All + Claim)
                                </button>
                            )}

                            {/* Main action button */}
                            {!isConnected ? (
                                <ConnectWalletInline label="Connect Wallet to Stake" />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {action === "stake" && (
                                        <button
                                            className="btn-primary"
                                            onClick={handleApprove}
                                            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isTxPending}
                                            style={{
                                                width: "100%",
                                                fontSize: 14,
                                                padding: "12px 32px",
                                                opacity: !amount || isNaN(Number(amount)) || Number(amount) <= 0 || isTxPending ? 0.4 : 1,
                                                background: "rgba(255,255,255,0.1)",
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            {isTxPending ? "⏳ Approving..." : `Step 1: Approve ${pool.tokenSymbol}`}
                                        </button>
                                    )}
                                    <button
                                        className="btn-primary"
                                        disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isTxPending}
                                        onClick={action === "stake" ? handleStake : handleUnstake}
                                        style={{
                                            width: "100%",
                                            fontSize: 16,
                                            padding: "16px 32px",
                                            opacity: !amount || isNaN(Number(amount)) || Number(amount) <= 0 || isTxPending ? 0.4 : 1,
                                            background: action === "stake" ? "var(--cyan)" : "var(--magenta)",
                                            color: "var(--void)",
                                            boxShadow: action === "stake" ? "0 4px 14px rgba(74, 178, 196, 0.3)" : "0 4px 14px rgba(193, 85, 126, 0.3)"
                                        }}
                                    >
                                        {isTxPending ? "⏳ Processing..." : `${action === "stake" ? "Stake" : "Unstake"} ${amount ? `${amount} ${pool.tokenSymbol}` : ""}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
