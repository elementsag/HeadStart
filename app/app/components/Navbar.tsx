"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "./ConnectWallet";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { href: "/launches", label: "Launches" },
        { href: "/create", label: "Create" },
        { href: "/staking", label: "Staking" },
        { href: "/portfolio", label: "Portfolio" },
    ];

    const isActive = (href: string) => {
        if (href === "/launches") return pathname === "/launches" || pathname.startsWith("/launches/");
        return pathname === href;
    };

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
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        textDecoration: "none",
                    }}
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
                </Link>

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
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                padding: "8px 18px",
                                borderRadius: 8,
                                border: "none",
                                background: isActive(item.href)
                                    ? "rgba(74, 178, 196, 0.08)"
                                    : "transparent",
                                color: isActive(item.href)
                                    ? "var(--cyan)"
                                    : "var(--text-secondary)",
                                fontFamily: "var(--font-body)",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                textDecoration: "none",
                            }}
                        >
                            {item.label}
                        </Link>
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
            {mobileOpen && (
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
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                padding: "12px 16px",
                                borderRadius: 8,
                                border: "none",
                                background: isActive(item.href)
                                    ? "rgba(74, 178, 196, 0.08)"
                                    : "transparent",
                                color: isActive(item.href)
                                    ? "var(--cyan)"
                                    : "var(--text-secondary)",
                                fontFamily: "var(--font-body)",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                textAlign: "left",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                textDecoration: "none",
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
