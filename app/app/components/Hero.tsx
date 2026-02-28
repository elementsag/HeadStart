"use client";

import { useEffect, useRef, useState } from "react";

export default function Hero({ onNavigate }: { onNavigate: (section: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [counts, setCounts] = useState({ launches: 0, raised: 0, stakers: 0 });

    // Animate counters
    useEffect(() => {
        const targets = { launches: 142, raised: 2847, stakers: 5623 };
        const duration = 2000;
        const start = Date.now();

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setCounts({
                launches: Math.floor(targets.launches * eased),
                raised: Math.floor(targets.raised * eased),
                stakers: Math.floor(targets.stakers * eased),
            });

            if (progress < 1) requestAnimationFrame(animate);
        };

        const timer = setTimeout(animate, 500);
        return () => clearTimeout(timer);
    }, []);

    // Particle canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            opacity: number;
        }> = [];

        const colors = ["#00F0FF", "#FF006E", "#39FF14", "#FFD700"];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        // Initialize particles
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = p.x - particles[j].x;
                    const dy = p.y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = p.color;
                        ctx.globalAlpha = (1 - dist / 150) * 0.08;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            ctx.globalAlpha = 1;
            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <section
            id="hero"
            style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                }}
            />

            {/* Gradient orbs */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    background: "radial-gradient(circle, var(--cyan-glow) 0%, transparent 70%)",
                    top: "-10%",
                    right: "-10%",
                    pointerEvents: "none",
                    filter: "blur(80px)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    background: "radial-gradient(circle, var(--magenta-glow) 0%, transparent 70%)",
                    bottom: "-10%",
                    left: "-5%",
                    pointerEvents: "none",
                    filter: "blur(80px)",
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    textAlign: "center",
                    maxWidth: 900,
                    padding: "0 24px",
                }}
            >
                {/* Badge */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        background: "var(--void-surface)",
                        border: "1px solid var(--void-border)",
                        borderRadius: 20,
                        marginBottom: 32,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--cyan)",
                        letterSpacing: "0.05em",
                    }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--acid)",
                            display: "inline-block",
                            animation: "pulse-glow-cyan 2s infinite",
                        }}
                    />
                    LIVE ON HEDERA
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(40px, 8vw, 80px)",
                        fontWeight: 800,
                        lineHeight: 1.05,
                        marginBottom: 24,
                        letterSpacing: "-0.03em",
                    }}
                >
                    <span style={{ color: "var(--text-primary)" }}>Launch Your </span>
                    <span
                        style={{
                            background: "linear-gradient(135deg, var(--cyan), var(--acid))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Token
                    </span>
                    <br />
                    <span style={{ color: "var(--text-primary)" }}>Into The </span>
                    <span
                        style={{
                            background: "linear-gradient(135deg, var(--magenta), var(--gold))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Future
                    </span>
                </h1>

                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(16px, 2vw, 20px)",
                        color: "var(--text-secondary)",
                        maxWidth: 600,
                        margin: "0 auto 40px",
                        lineHeight: 1.6,
                    }}
                >
                    Fair launch tokens with automatic LP creation, built-in staking rewards,
                    and transparent fundraising — all on Hedera.
                </p>

                {/* CTA */}
                <div
                    style={{
                        display: "flex",
                        gap: 16,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: 64,
                    }}
                >
                    <button
                        className="btn-primary"
                        onClick={() => onNavigate("create")}
                        style={{ fontSize: 15, padding: "14px 36px" }}
                    >
                        🚀 Launch Token
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => onNavigate("launches")}
                        style={{ fontSize: 15, padding: "14px 36px" }}
                    >
                        Explore Launches
                    </button>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 24,
                        maxWidth: 600,
                        margin: "0 auto",
                    }}
                >
                    <div>
                        <div className="stat-value">{counts.launches}</div>
                        <div className="stat-label">Launches</div>
                    </div>
                    <div>
                        <div className="stat-value">
                            {counts.raised.toLocaleString()}
                            <span style={{ fontSize: 16, opacity: 0.6, marginLeft: 4 }}>
                                ℏ
                            </span>
                        </div>
                        <div className="stat-label">HBAR Raised</div>
                    </div>
                    <div>
                        <div className="stat-value">{counts.stakers.toLocaleString()}</div>
                        <div className="stat-label">Stakers</div>
                    </div>
                </div>
            </div>

            {/* Scan line effect */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "linear-gradient(90deg, transparent, var(--cyan), transparent)",
                    opacity: 0.15,
                    animation: "scan-line 4s linear infinite",
                    pointerEvents: "none",
                }}
            />
        </section>
    );
}
