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

        const colors = ["#555570", "#8888aa"];

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
                padding: "160px 0 80px",
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

            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    textAlign: "center",
                    maxWidth: 860,
                    padding: "0 24px",
                }}
            >
                {/* Live badge */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "5px 14px",
                        background: "var(--void-surface)",
                        border: "1px solid var(--void-border)",
                        borderRadius: 20,
                        marginBottom: 40,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-dim)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                    }}
                >
                    <span
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "var(--cyan)",
                            display: "inline-block",
                        }}
                    />
                    Live on Hedera
                </div>

                {/* Main headline */}
                <h1
                    style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        lineHeight: 1.08,
                        marginBottom: 16,
                        letterSpacing: "-0.03em",
                    }}
                >
                    <span
                        style={{
                            display: "block",
                            fontSize: "clamp(44px, 7vw, 80px)",
                            color: "var(--text-primary)",
                        }}
                    >
                        Raise Funds For Your
                    </span>
                    <span
                        style={{
                            display: "block",
                            fontSize: "clamp(44px, 7vw, 80px)",
                            color: "var(--cyan)",
                        }}
                    >
                        Project or Game
                    </span>
                </h1>

                {/* Sub-headline — smaller, different weight, muted */}
                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(13px, 1.4vw, 16px)",
                        fontWeight: 400,
                        fontStyle: "italic",
                        color: "var(--text-dim)",
                        letterSpacing: "0.02em",
                        marginBottom: 36,
                    }}
                >
                    from the Hedera community
                </p>

                {/* Description */}
                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(14px, 1.6vw, 17px)",
                        color: "var(--text-secondary)",
                        maxWidth: 560,
                        margin: "0 auto 48px",
                        lineHeight: 1.7,
                    }}
                >
                    A launchpad for products and games to fundraise directly with the community —
                    with automatic LP creation and built-in staking rewards.
                </p>

                {/* CTA */}
                <div
                    style={{
                        display: "flex",
                        gap: 14,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: 72,
                    }}
                >
                    <button
                        className="btn-primary"
                        onClick={() => onNavigate("create")}
                        style={{ fontSize: 14, padding: "13px 32px", letterSpacing: "0.04em" }}
                    >
                        Launch Project
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => onNavigate("launches")}
                        style={{ fontSize: 14, padding: "13px 32px", letterSpacing: "0.04em" }}
                    >
                        Explore Launches
                    </button>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 32,
                        maxWidth: 540,
                        margin: "0 auto",
                        borderTop: "1px solid var(--void-border)",
                        paddingTop: 32,
                    }}
                >
                    <div>
                        <div className="stat-value" style={{ fontSize: 28 }}>{counts.launches}</div>
                        <div className="stat-label">Launches</div>
                    </div>
                    <div>
                        <div className="stat-value" style={{ fontSize: 28 }}>
                            {counts.raised.toLocaleString("en-US")}
                            <span style={{ fontSize: 14, opacity: 0.5, marginLeft: 3 }}>ℏ</span>
                        </div>
                        <div className="stat-label">HBAR Raised</div>
                    </div>
                    <div>
                        <div className="stat-value" style={{ fontSize: 28 }}>{counts.stakers.toLocaleString("en-US")}</div>
                        <div className="stat-label">Stakers</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
