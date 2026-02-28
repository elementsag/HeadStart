"use client";

import { useState } from "react";
import type { LaunchCardData } from "./LaunchCard";
import TokenChart from "./TokenChart";
import GameEmbed from "./GameEmbed";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const STATE_INFO: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: "Live", color: "var(--acid)", bg: "rgba(57,255,20,0.08)" },
    1: { label: "Succeeded", color: "var(--gold)", bg: "rgba(255,215,0,0.08)" },
    2: { label: "Finalized", color: "var(--cyan)", bg: "rgba(0,240,255,0.08)" },
    3: { label: "Failed", color: "var(--magenta)", bg: "rgba(255,0,110,0.08)" },
};

const ALLOCATION = [
    { label: "Sale", percent: 60, color: "var(--cyan)" },
    { label: "Liquidity", percent: 20, color: "var(--acid)" },
    { label: "Staking", percent: 15, color: "var(--magenta)" },
    { label: "Creator", percent: 5, color: "var(--gold)" },
];

function formatNum(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export default function TokenDetail({
    tokenData,
    onBack,
}: {
    tokenData: LaunchCardData;
    onBack: () => void;
}) {
    const { isConnected } = useAccount();
    const [amount, setAmount] = useState("");
    const [activeTab, setActiveTab] = useState<"chart" | "game">("chart");

    const progress = tokenData.hardCap > 0
        ? Math.min((tokenData.totalRaised / tokenData.hardCap) * 100, 100)
        : 0;

    const stateInfo = STATE_INFO[tokenData.state] || STATE_INFO[0];
    const isLive = tokenData.state === 0;
    const isFinalized = tokenData.state === 2;
    const estimatedTokens = amount && parseFloat(amount) > 0
        ? Math.floor(parseFloat(amount) / tokenData.tokenPrice)
        : 0;

    return (
        <div>
            {/* Back */}
            <button
                onClick={onBack}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "none", border: "none", padding: 0,
                    color: "var(--text-secondary)", fontFamily: "var(--font-display)",
                    fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 24,
                    transition: "color 0.2s", textTransform: "uppercase", letterSpacing: "0.05em"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
                ← Back to Launches
            </button>

            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 32, flexWrap: "wrap", gap: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: "var(--radius-md)",
                        background: "var(--cyan)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: 26, color: "var(--void)",
                    }}>{tokenData.symbol.charAt(0)}</div>
                    <div>
                        <h2 style={{
                            fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800,
                            color: "var(--text-primary)", lineHeight: 1.1, margin: 0,
                        }}>{tokenData.name}</h2>
                        <div style={{
                            fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700,
                            color: "var(--text-secondary)", marginTop: 4,
                        }}>${tokenData.symbol}</div>
                    </div>
                </div>

                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: stateInfo.bg,
                    border: `1px solid ${stateInfo.color}40`,
                    borderRadius: "var(--radius-xl)", padding: "6px 16px",
                }}>
                    {isLive && (
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "var(--acid)", boxShadow: "0 0 10px var(--acid)",
                        }} />
                    )}
                    <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 12,
                        color: stateInfo.color, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{stateInfo.label}</span>
                </div>
            </div>

            {/* Main 2-col grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Tabs */}
                    <div style={{
                        display: "flex", gap: 8,
                        background: "var(--void-light)",
                        border: "1px solid var(--void-border)",
                        borderRadius: "var(--radius-md)", padding: 6, alignSelf: "flex-start",
                    }}>
                        {([
                            { id: "chart" as const, label: "📈 Chart" },
                            { id: "game" as const, label: "🎮 Games" },
                        ]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    padding: "10px 20px",
                                    background: activeTab === t.id ? "var(--cyan)" : "transparent",
                                    border: "none",
                                    borderRadius: "var(--radius-sm)", cursor: "pointer",
                                    fontFamily: "var(--font-display)", fontWeight: 800,
                                    fontSize: 14, color: activeTab === t.id ? "var(--void)" : "var(--text-secondary)",
                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                    transition: "all 0.2s",
                                }}
                            >{t.label}</button>
                        ))}
                    </div>

                    {/* Chart / Game */}
                    <div style={{
                        background: "var(--void-light)",
                        border: "1px solid var(--void-border)", borderRadius: "var(--radius-lg)",
                        padding: 24, minHeight: 320,
                    }}>
                        {activeTab === "chart"
                            ? <TokenChart symbol={tokenData.symbol} />
                            : <GameEmbed tokenSymbol={tokenData.symbol} />
                        }
                    </div>

                    {/* About */}
                    <div style={{
                        background: "var(--void-light)",
                        border: "1px solid var(--void-border)", borderRadius: "var(--radius-lg)", padding: 24,
                    }}>
                        <div style={{
                            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                            color: "var(--text-primary)", textTransform: "uppercase",
                            letterSpacing: "0.08em", marginBottom: 12,
                        }}>About</div>
                        <p style={{
                            fontFamily: "var(--font-body)", fontSize: 15,
                            color: "var(--text-secondary)", lineHeight: 1.7, margin: 0,
                            fontWeight: 500,
                        }}>
                            <strong style={{ color: "var(--text-primary)" }}>{tokenData.name}</strong> is a community-driven project launched on HeadStart.
                            Contributors receive tokens proportional to their HBAR contribution
                            after finalization. Liquidity is automatically added to SaucerSwap,
                            and staking rewards are distributed over time.
                        </p>
                    </div>

                    {/* Token allocation */}
                    <div style={{
                        background: "var(--void-light)",
                        border: "1px solid var(--void-border)", borderRadius: "var(--radius-lg)", padding: 24,
                    }}>
                        <div style={{
                            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                            color: "var(--text-primary)", textTransform: "uppercase",
                            letterSpacing: "0.08em", marginBottom: 20,
                        }}>Token Allocation</div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {ALLOCATION.map(a => (
                                <div key={a.label} style={{
                                    display: "flex", alignItems: "center", gap: 12
                                }}>
                                    <div style={{
                                        width: 12, height: 12, borderRadius: 3,
                                        background: a.color, flexShrink: 0,
                                    }} />
                                    <span style={{
                                        fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                                        color: "var(--text-primary)", width: 100, flexShrink: 0,
                                    }}>{a.label}</span>
                                    <div style={{
                                        flex: 2, height: 8,
                                        background: "rgba(255,255,255,0.06)",
                                        borderRadius: 4, overflow: "hidden",
                                    }}>
                                        <div style={{
                                            width: `${a.percent}%`, height: "100%",
                                            background: a.color, borderRadius: 4,
                                        }} />
                                    </div>
                                    <span style={{
                                        fontFamily: "var(--font-mono)", fontSize: 14,
                                        color: a.color, fontWeight: 800,
                                        width: 48, textAlign: "right",
                                    }}>{a.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Fundraise progress card */}
                    <div style={{
                        background: "var(--void-light)",
                        border: "1px solid var(--void-border)", borderRadius: "var(--radius-lg)", padding: 24,
                    }}>
                        {/* Big raised amount */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{
                                fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 800,
                                color: isLive ? "var(--cyan)" : "var(--text-primary)", lineHeight: 1,
                            }}>{formatNum(tokenData.totalRaised)} ℏ</div>
                            <div style={{
                                fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                                color: "var(--text-secondary)", marginTop: 6,
                            }}>raised of {formatNum(tokenData.hardCap)} ℏ goal</div>
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            width: "100%", height: 10,
                            background: "rgba(255,255,255,0.06)", borderRadius: 5,
                            overflow: "hidden", marginBottom: 8,
                        }}>
                            <div style={{
                                width: `${progress}%`, height: "100%",
                                background: isLive ? "var(--cyan)" : "var(--text-dim)",
                                borderRadius: 5, transition: "width 0.5s ease",
                            }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{
                                fontFamily: "var(--font-mono)", fontSize: 13,
                                color: isLive ? "var(--cyan)" : "var(--text-secondary)", fontWeight: 800,
                            }}>{progress.toFixed(1)}% funded</span>
                            <span style={{
                                fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600
                            }}>soft {formatNum(tokenData.softCap)} ℏ</span>
                        </div>

                        {/* Key stats */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
                            {[
                                { label: "Backers", value: tokenData.contributors.toLocaleString(), color: "var(--text-primary)" },
                                {
                                    label: "Time Left",
                                    value: tokenData.timeRemaining > 0
                                        ? `${Math.floor(tokenData.timeRemaining / 86400)}d ${Math.floor((tokenData.timeRemaining % 86400) / 3600)}h`
                                        : "Ended",
                                    color: "var(--gold)"
                                },
                                { label: "Asset Price", value: `${tokenData.tokenPrice.toFixed(4)} ℏ`, color: "var(--text-primary)" },
                                { label: "Status", value: ["Active", "Succeeded", "Finalized", "Failed"][tokenData.state], color: stateInfo.color },
                            ].map(s => (
                                <div key={s.label} style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    borderRadius: "var(--radius-sm)", padding: "12px 14px",
                                }}>
                                    <div style={{
                                        fontFamily: "var(--font-mono)", fontSize: 15,
                                        fontWeight: 800, color: s.color,
                                    }}>{s.value}</div>
                                    <div style={{
                                        fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
                                        color: "var(--text-secondary)", textTransform: "uppercase",
                                        letterSpacing: "0.08em", marginTop: 4,
                                    }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contribute card (live only) */}
                    {isLive && (
                        <div style={{
                            background: "var(--void-light)",
                            border: "1px solid var(--cyan-dim)", borderRadius: "var(--radius-lg)", padding: 24,
                            boxShadow: "0 8px 32px rgba(0,240,255,0.05)",
                        }}>
                            <div style={{
                                fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                                color: "var(--cyan)", textTransform: "uppercase",
                                letterSpacing: "0.08em", marginBottom: 16,
                            }}>Contribute</div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{
                                    display: "flex", justifyContent: "space-between", marginBottom: 8,
                                }}>
                                    <label style={{
                                        fontFamily: "var(--font-body)", fontSize: 13,
                                        color: "var(--text-primary)", textTransform: "uppercase",
                                        letterSpacing: "0.08em", fontWeight: 700
                                    }}>HBAR Amount</label>
                                </div>
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    style={{
                                        width: "100%",
                                        fontSize: 18,
                                        padding: "16px",
                                    }}
                                />
                                {estimatedTokens > 0 && (
                                    <div style={{
                                        fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                                        color: "var(--text-secondary)", marginTop: 8,
                                    }}>
                                        ≈ <span style={{ color: "var(--cyan)" }}>{estimatedTokens.toLocaleString()}</span> {tokenData.symbol} assets
                                    </div>
                                )}
                            </div>

                            {!isConnected ? (
                                <ConnectButton.Custom>
                                    {({ openConnectModal }: any) => (
                                        <button
                                            className="btn-primary"
                                            onClick={openConnectModal}
                                            style={{
                                                width: "100%", padding: "16px", fontSize: 16,
                                            }}
                                        >Connect Wallet</button>
                                    )}
                                </ConnectButton.Custom>
                            ) : (
                                <button
                                    className="btn-primary"
                                    disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
                                    style={{
                                        width: "100%", padding: "16px", fontSize: 16,
                                        opacity: (!amount || isNaN(Number(amount)) || Number(amount) <= 0) ? 0.4 : 1,
                                    }}
                                >
                                    Submit {amount ? `${amount} HBAR` : ""}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Claim card (finalized) */}
                    {isFinalized && (
                        <div style={{
                            background: "var(--void-light)",
                            border: "1px solid var(--magenta-dim)", borderRadius: "var(--radius-lg)", padding: 24,
                            boxShadow: "0 8px 32px rgba(255,0,110,0.05)",
                        }}>
                            <div style={{
                                fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800,
                                color: "var(--magenta)", textTransform: "uppercase",
                                letterSpacing: "0.08em", marginBottom: 12,
                            }}>Claim Assets</div>
                            <p style={{
                                fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
                                color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20,
                            }}>
                                The launch has successfully finalized! Your allocated <strong style={{ color: "var(--text-primary)" }}>{tokenData.symbol}</strong> assets are ready.
                            </p>
                            <button className="btn-primary" style={{
                                width: "100%", padding: "16px", fontSize: 16,
                            }}>Claim {tokenData.symbol}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
