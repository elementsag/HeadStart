"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";

// ── ConnectWalletButton (Navbar) ─────────────────────────
export function ConnectWalletButton() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);
    const handleDisconnect = () => {
        disconnect();
        setDropdownOpen(false);
    };

    if (isConnected && address) {
        return (
            <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="btn-primary"
                    style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(74, 178, 196, 0.1)",
                        border: "1px solid var(--cyan)",
                        color: "var(--cyan)",
                    }}
                >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} />
                    {address.slice(0, 6)}...{address.slice(-4)}
                </button>

                {dropdownOpen && (
                    <div
                        className="glass-card"
                        style={{
                            position: "absolute", top: "calc(100% + 8px)", right: 0,
                            padding: "8px", width: "220px",
                            animation: "slideUp 0.2s ease-out", zIndex: 1000
                        }}
                    >
                        <div style={{
                            padding: "12px", borderBottom: "1px solid var(--void-border)",
                            marginBottom: "8px"
                        }}>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Connected Wallet</div>
                            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </div>
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(address); setDropdownOpen(false); }}
                            style={{
                                width: "100%", padding: "10px", textAlign: "left",
                                background: "none", border: "none", color: "var(--text-primary)",
                                cursor: "pointer", borderRadius: "8px", transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                            📋 Copy Address
                        </button>
                        <button
                            onClick={handleDisconnect}
                            style={{
                                width: "100%", padding: "10px", textAlign: "left",
                                background: "none", border: "none", color: "var(--magenta)",
                                cursor: "pointer", borderRadius: "8px", transition: "all 0.2s",
                                fontWeight: 700
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(193, 85, 126, 0.1)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                            🔌 Disconnect
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <button
                className="btn-primary"
                onClick={() => setModalOpen(true)}
                style={{
                    padding: "8px 24px",
                    fontSize: "15px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                }}
            >
                Connect Wallet
            </button>
            <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </>
    );
}

// ── ConnectWalletInline (forms) ──────────────────────────
export function ConnectWalletInline({ label = "Connect Wallet" }: { label?: string }) {
    const { isConnected } = useAccount();
    const [modalOpen, setModalOpen] = useState(false);

    if (isConnected) return null;

    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <button
                className="btn-primary"
                onClick={(e) => { e.preventDefault(); setModalOpen(true); }}
                style={{
                    padding: "16px 32px", fontSize: "16px", width: "100%", maxWidth: "400px",
                }}
            >
                🚀 {label}
            </button>
            <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}

// ── Wallet Connection Modal ──────────────────────────────
function WalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { connectors, connect, error, isPending } = useConnect();
    const [localError, setLocalError] = useState<string | null>(null);

    // EIP-6963 automatically detects injected wallets like HashPack and MetaMask
    // We filter them out nicely so we don't duplicate
    const injectedConnectors = connectors.filter(c => c.type === 'injected');

    const handleConnect = async (connector: any) => {
        setLocalError(null);
        try {
            connect({ connector });
            // Let Wagmi handle success state, it automatically closes the modal if isConnected triggers (handled higher up)
        } catch (err: any) {
            setLocalError(err?.message || "Failed to connect");
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 5, 0.8)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, animation: "fadeIn 0.2s ease-out", padding: "20px"
        }}>
            <div className="glass-card" style={{
                position: "relative", width: "100%", maxWidth: "420px", padding: "32px",
                animation: "scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                display: "flex", flexDirection: "column", gap: "24px"
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: "16px", right: "16px",
                        background: "none", border: "none", color: "var(--text-secondary)",
                        cursor: "pointer", fontSize: "20px", width: "32px", height: "32px",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                    ✕
                </button>

                {/* Header */}
                <div style={{ textAlign: "center" }}>
                    <h2 style={{
                        fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800,
                        color: "var(--text-primary)", marginBottom: "8px"
                    }}>Connect Wallet</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Select a Hedera EIP-6963 compatible provider
                    </p>
                </div>

                {/* Wallet Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {injectedConnectors.length === 0 ? (
                        <div style={{
                            padding: "24px", textAlign: "center", color: "var(--text-secondary)",
                            background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px dashed var(--void-border)"
                        }}>
                            No active wallets detected. Please install the HashPack or MetaMask browser extension.
                        </div>
                    ) : (
                        injectedConnectors.map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => handleConnect(connector)}
                                disabled={isPending}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "16px 20px", background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--void-border)", borderRadius: "12px",
                                    cursor: isPending ? "not-allowed" : "pointer",
                                    transition: "all 0.2s", opacity: isPending ? 0.6 : 1
                                }}
                                onMouseOver={(e) => !isPending && (e.currentTarget.style.background = "rgba(74, 178, 196, 0.05)")}
                                onMouseOut={(e) => !isPending && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "10px",
                                        background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "24px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                                    }}>
                                        {/* Auto icon mapping based on connector name */}
                                        {connector.name.toLowerCase().includes('hash') ? '🟣' :
                                            connector.name.toLowerCase().includes('meta') ? '🦊' : '🔌'}
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                            {connector.name}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: "var(--cyan)", fontWeight: 800 }}>→</div>
                            </button>
                        ))
                    )}
                </div>

                {isPending && (
                    <div style={{
                        textAlign: "center", color: "var(--cyan)", fontSize: "14px",
                        animation: "pulse 2s infinite"
                    }}>
                        Check your extension to authorize...
                    </div>
                )}

                {(error || localError) && (
                    <div style={{
                        padding: "12px", background: "rgba(193, 85, 126, 0.1)",
                        border: "1px solid rgba(193, 85, 126, 0.2)", borderRadius: "8px",
                        color: "var(--magenta)", fontSize: "13px", textAlign: "center"
                    }}>
                        ❌ {localError || error?.message || "Failed to connect"}
                    </div>
                )}
            </div>
        </div>
    );
}
