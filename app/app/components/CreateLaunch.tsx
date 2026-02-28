"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function CreateLaunch() {
    const { isConnected } = useAccount();
    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        totalSupply: "1000000000",
        isGame: false,
        gameUri: "",
        hardCap: "100000",
        softCap: "25000",
        duration: "7",
        lpPercent: "50",
        stakingRewardPercent: "15",
        stakingDuration: "90",
    });
    const [isDeploying, setIsDeploying] = useState(false);
    const [step, setStep] = useState(0); // 0=form, 1=preview, 2=deploying, 3=success

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeploy = async () => {
        if (!isConnected) {
            // With RainbowKit, they should use the ConnectButton
            // We can just return or show an alert if they somehow bypass it
            return;
        }
        setIsDeploying(true);
        setStep(2);
        // Contract deployment would happen here
        setTimeout(() => {
            setStep(3);
            setIsDeploying(false);
        }, 3000);
    };

    // Token distribution calculation
    const supply = parseFloat(formData.totalSupply) || 0;
    const stakingAlloc = (supply * parseFloat(formData.stakingRewardPercent || "0")) / 100;
    const lpAlloc = supply * 0.2; // 20% for LP
    const creatorAlloc = supply * 0.05; // 5% for creator
    const saleAlloc = supply - stakingAlloc - lpAlloc - creatorAlloc;

    const allocations = [
        { label: "Sale", value: saleAlloc, percent: ((saleAlloc / supply) * 100) || 0, color: "var(--cyan)" },
        { label: "Liquidity Pool", value: lpAlloc, percent: 20, color: "var(--acid)" },
        { label: "Staking Rewards", value: stakingAlloc, percent: parseFloat(formData.stakingRewardPercent) || 0, color: "var(--magenta)" },
        { label: "Creator", value: creatorAlloc, percent: 5, color: "var(--gold)" },
    ];

    if (step === 3) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "60px 24px",
                }}
            >
                <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 32,
                        fontWeight: 800,
                        marginBottom: 16,
                        background: "linear-gradient(135deg, var(--cyan), var(--acid))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Launch Created!
                </h2>
                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-secondary)",
                        fontSize: 16,
                        marginBottom: 32,
                    }}
                >
                    {formData.name} (${formData.symbol}) is now live and accepting contributions.
                </p>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setStep(0);
                        setFormData({
                            name: "",
                            symbol: "",
                            totalSupply: "1000000000",
                            isGame: false,
                            gameUri: "",
                            hardCap: "100000",
                            softCap: "25000",
                            duration: "7",
                            lpPercent: "20",
                            stakingRewardPercent: "5",
                            stakingDuration: "90",
                        });
                    }}
                >
                    Create Another
                </button>
            </div>
        );
    }

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
                    Create Token Launch
                </h2>
                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-secondary)",
                        fontSize: 14,
                    }}
                >
                    Deploy your token with automatic LP and staking — all in one transaction.
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
                {/* Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Token Info */}
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
                            Token Info
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Token Name
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. HeadStart Token"
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Symbol
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. HDST"
                                    value={formData.symbol}
                                    onChange={(e) =>
                                        updateField("symbol", e.target.value.toUpperCase())
                                    }
                                    maxLength={8}
                                />
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Total Supply
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. 1000000000"
                                    type="number"
                                    value={formData.totalSupply}
                                    onChange={(e) => updateField("totalSupply", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Raise Config */}
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
                            Fundraise
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label
                                        style={{
                                            fontFamily: "var(--font-body)",
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                            display: "block",
                                            marginBottom: 6,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                        }}
                                    >
                                        Hard Cap (HBAR)
                                    </label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        value={formData.hardCap}
                                        onChange={(e) => updateField("hardCap", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            fontFamily: "var(--font-body)",
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                            display: "block",
                                            marginBottom: 6,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                        }}
                                    >
                                        Soft Cap (HBAR)
                                    </label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        value={formData.softCap}
                                        onChange={(e) => updateField("softCap", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Duration (days)
                                </label>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => updateField("duration", e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    LP Allocation (% of raised HBAR)
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <input
                                        type="range"
                                        min="20"
                                        max="80"
                                        value={formData.lpPercent}
                                        onChange={(e) => updateField("lpPercent", e.target.value)}
                                        style={{
                                            flex: 1,
                                            accentColor: "var(--acid)",
                                            height: 4,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 14,
                                            color: "var(--acid)",
                                            fontWeight: 700,
                                            minWidth: 40,
                                        }}
                                    >
                                        {formData.lpPercent}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staking Config */}
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
                            Staking
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Staking Reward (% of supply)
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <input
                                        type="range"
                                        min="5"
                                        max="30"
                                        value={formData.stakingRewardPercent}
                                        onChange={(e) =>
                                            updateField("stakingRewardPercent", e.target.value)
                                        }
                                        style={{
                                            flex: 1,
                                            accentColor: "var(--magenta)",
                                            height: 4,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 14,
                                            color: "var(--magenta)",
                                            fontWeight: 700,
                                            minWidth: 40,
                                        }}
                                    >
                                        {formData.stakingRewardPercent}%
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                        display: "block",
                                        marginBottom: 6,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Staking Duration (days)
                                </label>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={formData.stakingDuration}
                                    onChange={(e) =>
                                        updateField("stakingDuration", e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Token Preview Card */}
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
                                height: 3,
                                background: "linear-gradient(90deg, var(--cyan), var(--magenta), var(--acid))",
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
                            Launch Preview
                        </h3>

                        {/* Token avatar + name */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginBottom: 24,
                                padding: 16,
                                background: "var(--void)",
                                borderRadius: 12,
                                border: "1px solid var(--void-border)",
                            }}
                        >
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 14,
                                    background: "linear-gradient(135deg, var(--cyan), var(--magenta))",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 800,
                                    fontSize: 24,
                                    color: "white",
                                    flexShrink: 0,
                                }}
                            >
                                {formData.symbol ? formData.symbol.charAt(0) : "?"}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontWeight: 700,
                                        fontSize: 20,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {formData.name || "Token Name"}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 13,
                                        color: "var(--text-dim)",
                                    }}
                                >
                                    ${formData.symbol || "SYMBOL"}
                                </div>
                            </div>
                        </div>

                        {/* Key metrics */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                marginBottom: 24,
                            }}
                        >
                            {[
                                {
                                    label: "Hard Cap",
                                    value: `${Number(formData.hardCap).toLocaleString()} ℏ`,
                                    color: "var(--cyan)",
                                },
                                {
                                    label: "Soft Cap",
                                    value: `${Number(formData.softCap).toLocaleString()} ℏ`,
                                    color: "var(--text-primary)",
                                },
                                {
                                    label: "Duration",
                                    value: `${formData.duration} days`,
                                    color: "var(--text-primary)",
                                },
                                {
                                    label: "Token Price",
                                    value: supply > 0 && saleAlloc > 0
                                        ? `${(parseFloat(formData.hardCap) / saleAlloc).toFixed(6)} ℏ`
                                        : "—",
                                    color: "var(--gold)",
                                },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    style={{
                                        padding: 12,
                                        background: "var(--void)",
                                        borderRadius: 8,
                                        border: "1px solid var(--void-border)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: m.color,
                                        }}
                                    >
                                        {m.value}
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
                                        {m.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Distribution visual */}
                    <div className="glass-card" style={{ padding: 24 }}>
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
                            Token Distribution
                        </h3>

                        {/* Bar chart */}
                        <div
                            style={{
                                display: "flex",
                                height: 20,
                                borderRadius: 10,
                                overflow: "hidden",
                                marginBottom: 16,
                            }}
                        >
                            {allocations.map((a) => (
                                <div
                                    key={a.label}
                                    style={{
                                        width: `${a.percent}%`,
                                        background: a.color,
                                        transition: "width 0.5s ease",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {allocations.map((a) => (
                                <div
                                    key={a.label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 3,
                                                background: a.color,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontFamily: "var(--font-body)",
                                                fontSize: 13,
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {a.label}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 12,
                                                color: "var(--text-dim)",
                                            }}
                                        >
                                            {a.value.toLocaleString()}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: a.color,
                                                minWidth: 40,
                                                textAlign: "right",
                                            }}
                                        >
                                            {a.percent.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

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
                                    }}
                                >
                                    Connect Wallet to Deploy
                                </button>
                            )}
                        </ConnectButton.Custom>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={handleDeploy}
                            disabled={isDeploying || !formData.name || !formData.symbol}
                            style={{
                                width: "100%",
                                fontSize: 16,
                                padding: "16px 32px",
                                opacity: !formData.name || !formData.symbol ? 0.4 : 1,
                            }}
                        >
                            {isDeploying ? "⏳ Deploying..." : `🚀 Deploy ${formData.symbol || "Token"}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
