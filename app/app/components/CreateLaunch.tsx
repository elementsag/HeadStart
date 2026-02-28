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
        hardCap: "100000",
        softCap: "25000",
        duration: "7",
        lpPercent: "50",
        stakingRewardPercent: "15",
        stakingDuration: "90",
    });
    const [isDeploying, setIsDeploying] = useState(false);

    // Steps: 1=Identity, 2=Fundraise, 3=Tokenomics, 4=Preview, 5=Success
    const [step, setStep] = useState(1);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeploy = async () => {
        if (!isConnected) return;
        setIsDeploying(true);
        // Simulation
        setTimeout(() => {
            setStep(5);
            setIsDeploying(false);
        }, 3000);
    };

    // Calculations
    const supply = parseFloat(formData.totalSupply) || 0;
    const stakingAlloc = (supply * parseFloat(formData.stakingRewardPercent || "0")) / 100;
    const lpAlloc = supply * (parseFloat(formData.lpPercent || "0") / 100);
    const creatorAlloc = supply * 0.05; // 5% flat fee internally mapped
    const saleAlloc = supply - stakingAlloc - lpAlloc - creatorAlloc;

    const renderStepDots = () => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            {[1, 2, 3, 4].map(s => (
                <div key={s} style={{
                    width: 32, height: 4, borderRadius: 2,
                    background: step === s ? "var(--cyan)" : step > s ? "var(--text-primary)" : "var(--void-border)",
                    transition: "all 0.3s ease",
                    boxShadow: step === s ? "0 0 10px rgba(0,240,255,0.4)" : "none"
                }} />
            ))}
        </div>
    );

    if (step === 5) {
        return (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <div style={{ fontSize: 72, marginBottom: 24, animation: "float 4s ease-in-out infinite" }}>🚀</div>
                <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800,
                    marginBottom: 16, color: "var(--cyan)",
                }}>Project Deployed!</h2>
                <p style={{
                    fontFamily: "var(--font-body)", color: "var(--text-secondary)",
                    fontSize: 16, marginBottom: 40, fontWeight: 500
                }}>
                    <strong style={{ color: "var(--text-primary)" }}>{formData.name}</strong> (${formData.symbol}) is now fully deployed with LP and Staking configured.
                </p>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setStep(1);
                        setFormData({
                            name: "", symbol: "", totalSupply: "1000000000",
                            hardCap: "100000", softCap: "25000", duration: "7",
                            lpPercent: "50", stakingRewardPercent: "15", stakingDuration: "90",
                        });
                    }}
                    style={{ padding: "16px 40px", fontSize: 16 }}
                >
                    Launch Another Project
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800,
                    marginBottom: 8, color: "var(--text-primary)",
                }}>Create Project</h2>
                <p style={{
                    fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: 15, fontWeight: 500
                }}>Deploy your token, launchpad, and staking pool in one transaction.</p>
            </div>

            {renderStepDots()}

            <div className="glass-card" style={{ padding: 32, minHeight: 400, display: "flex", flexDirection: "column" }}>

                {step === 1 && (
                    <div style={{ flex: 1, animation: "count-up 0.4s ease-out" }}>
                        <h3 style={{
                            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
                            color: "var(--cyan)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Step 1: Project Identity</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <InputField label="Project Name" value={formData.name} placeholder="e.g. Nebula Swap" onChange={(v: string) => updateField("name", v)} />
                            <InputField label="Token Symbol" value={formData.symbol} placeholder="e.g. NEBU" onChange={(v: string) => updateField("symbol", v.toUpperCase())} maxLength={8} />
                            <InputField label="Total Supply" value={formData.totalSupply} type="number" placeholder="1000000000" onChange={(v: string) => updateField("totalSupply", v)} />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ flex: 1, animation: "count-up 0.4s ease-out" }}>
                        <h3 style={{
                            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
                            color: "var(--magenta)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Step 2: Fundraise Parameters</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <InputField label="Hard Cap (HBAR)" value={formData.hardCap} type="number" onChange={(v: string) => updateField("hardCap", v)} />
                                <InputField label="Soft Cap (HBAR)" value={formData.softCap} type="number" onChange={(v: string) => updateField("softCap", v)} />
                            </div>
                            <InputField label="Duration (Days)" value={formData.duration} type="number" onChange={(v: string) => updateField("duration", v)} />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ flex: 1, animation: "count-up 0.4s ease-out" }}>
                        <h3 style={{
                            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
                            color: "var(--acid)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Step 3: Tokenomics & Utility</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                            <SliderField label="Liquidity Pool Allocation" value={formData.lpPercent} min={20} max={80} color="var(--acid)" onChange={(v: string) => updateField("lpPercent", v)} />
                            <SliderField label="Staking Reward Allocation" value={formData.stakingRewardPercent} min={5} max={30} color="var(--gold)" onChange={(v: string) => updateField("stakingRewardPercent", v)} />
                            <InputField label="Staking Duration (Days)" value={formData.stakingDuration} type="number" onChange={(v: string) => updateField("stakingDuration", v)} />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ flex: 1, animation: "count-up 0.4s ease-out" }}>
                        <h3 style={{
                            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
                            color: "var(--text-primary)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Step 4: Review & Deploy</h3>

                        <div style={{
                            background: "var(--void)", border: "1px solid var(--void-border)",
                            borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 24
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: "var(--radius-md)", background: "var(--cyan)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "white"
                                }}>{formData.symbol.charAt(0) || "?"}</div>
                                <div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>{formData.name || "Unnamed"}</div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", fontWeight: 700 }}>${formData.symbol || "TKN"}</div>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <PreviewStat label="Hard Cap" value={`${formatNum(parseFloat(formData.hardCap))} ℏ`} color="var(--magenta)" />
                                <PreviewStat label="Total Supply" value={formatNum(parseFloat(formData.totalSupply))} color="var(--cyan)" />
                                <PreviewStat label="Sale %" value={`${((saleAlloc / supply) * 100).toFixed(0)}%`} color="var(--text-primary)" />
                                <PreviewStat label="LP / Staking" value={`${formData.lpPercent}% / ${formData.stakingRewardPercent}%`} color="var(--acid)" />
                            </div>
                        </div>

                        {!isConnected ? (
                            <ConnectButton.Custom>
                                {({ openConnectModal }: any) => (
                                    <button className="btn-primary" onClick={openConnectModal} style={{ width: "100%", padding: 16 }}>Connect Wallet to Deploy</button>
                                )}
                            </ConnectButton.Custom>
                        ) : (
                            <button
                                className="btn-primary"
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                style={{
                                    width: "100%", padding: "16px", fontSize: 16,
                                    background: "var(--cyan)", color: "var(--void)",
                                    boxShadow: "0 0 20px rgba(0,240,255,0.3)"
                                }}
                            >
                                {isDeploying ? "⏳ Deploying Project..." : `🚀 Deploy ${formData.symbol}`}
                            </button>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                    display: "flex", justifyContent: "space-between", marginTop: 32,
                    paddingTop: 24, borderTop: "1px solid var(--void-border)"
                }}>
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        style={{
                            padding: "12px 24px", background: "transparent", border: "1px solid var(--void-border)",
                            borderRadius: "var(--radius-md)", color: "var(--text-primary)",
                            fontFamily: "var(--font-display)", fontWeight: 700, cursor: step === 1 ? "not-allowed" : "pointer",
                            opacity: step === 1 ? 0 : 1, transition: "all 0.2s"
                        }}
                        disabled={step === 1}
                    >Back</button>

                    {step < 4 && (
                        <button
                            className="btn-primary"
                            onClick={() => setStep(s => Math.min(4, s + 1))}
                            disabled={(step === 1 && (!formData.name || !formData.symbol)) || (step === 2 && (!formData.hardCap || !formData.duration))}
                            style={{ padding: "12px 32px", fontSize: 15 }}
                        >Next Step →</button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helpers
function formatNum(n: number) {
    if (isNaN(n)) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
}

function InputField({ label, value, onChange, placeholder, type = "text", maxLength }: any) {
    return (
        <div>
            <label style={{
                fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)",
                textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontWeight: 700
            }}>{label}</label>
            <input
                className="input-field" type={type} placeholder={placeholder} maxLength={maxLength}
                value={value} onChange={e => onChange(e.target.value)}
                style={{ width: "100%", padding: 16, fontSize: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--void-border)" }}
            />
        </div>
    );
}

function SliderField({ label, value, onChange, min, max, color }: any) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{
                    fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)",
                    textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700
                }}>{label}</label>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color, fontWeight: 800 }}>{value}%</span>
            </div>
            <input
                type="range" min={min} max={max} value={value} onChange={e => onChange(e.target.value)}
                style={{ width: "100%", accentColor: color, height: 6, cursor: "pointer" }}
            />
        </div>
    );
}

function PreviewStat({ label, value, color }: any) {
    return (
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color, fontWeight: 800 }}>{value}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4, fontWeight: 700 }}>{label}</div>
        </div>
    );
}
