"use client";

import { ConnectWalletButton } from "./ConnectWallet";
import { useState } from "react";

export default function Navbar({
    activeSection,
    onNavigate,
}: {
    activeSection: string;
    onNavigate: (section: string) => void;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: "launches", label: "Launches" },
        { id: "create", label: "Create" },
        { id: "staking", label: "Staking" },
        { id: "portfolio", label: "Portfolio" },
    ];

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: "rgba(5, 5, 16, 0.9)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--void-border)",
            }}
        >
            <div
                style={{
                    maxWidth: 1400,
                    margin: "0 auto",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 72,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                    }}
                    onClick={() => onNavigate("hero")}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            background: "var(--cyan)",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 18,
                            color: "white",
                        }}
                    >
                        H
                    </div>
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 22,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        HEAD
                        <span style={{ color: "var(--cyan)" }}>START</span>
                    </span>
                </div>

                {/* Desktop Nav */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                    className="hidden md:flex"
                >
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            style={{
                                padding: "8px 18px",
                                borderRadius: 8,
                                border: "none",
                                background:
                                    activeSection === item.id
                                        ? "var(--cyan-glow)"
                                        : "transparent",
                                color:
                                    activeSection === item.id
                                        ? "var(--cyan)"
                                        : "var(--text-secondary)",
                                fontFamily: "var(--font-body)",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Wallet */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ConnectWalletButton />

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-primary)",
                            fontSize: 24,
                            cursor: "pointer",
                            padding: 4,
                        }}
                    >
                        {mobileOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {
                mobileOpen && (
                    <div
                        className="md:hidden"
                        style={{
                            padding: "8px 24px 20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            borderTop: "1px solid var(--void-border)",
                        }}
                    >
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    setMobileOpen(false);
                                }}
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    border: "none",
                                    background:
                                        activeSection === item.id
                                            ? "var(--cyan-glow)"
                                            : "transparent",
                                    color:
                                        activeSection === item.id
                                            ? "var(--cyan)"
                                            : "var(--text-secondary)",
                                    fontFamily: "var(--font-body)",
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )
            }
        </nav >
    );
}
