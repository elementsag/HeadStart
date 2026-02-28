"use client";

interface LaunchCardData {
    id: number;
    name: string;
    symbol: string;
    totalRaised: number;
    hardCap: number;
    softCap: number;
    contributors: number;
    timeRemaining: number;
    state: number; // 0=ACTIVE, 1=SUCCEEDED, 2=FINALIZED, 3=FAILED
    tokenPrice: number;
}

const stateLabels: Record<number, { label: string; class: string }> = {
    0: { label: "LIVE", class: "badge-live" },
    1: { label: "SUCCEEDED", class: "badge-upcoming" },
    2: { label: "FINALIZED", class: "badge-ended" },
    3: { label: "FAILED", class: "badge-ended" },
};

function formatTime(seconds: number): string {
    if (seconds <= 0) return "Ended";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export default function LaunchCard({
    launch,
    onClick,
}: {
    launch: LaunchCardData;
    onClick: () => void;
}) {
    const progress = launch.hardCap > 0
        ? Math.min((launch.totalRaised / launch.hardCap) * 100, 100)
        : 0;

    const stateInfo = stateLabels[launch.state] || stateLabels[0];

    return (
        <div
            className="glass-card"
            onClick={onClick}
            style={{
                padding: 24,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Glow effect */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                        launch.state === 0
                            ? "linear-gradient(90deg, var(--cyan), var(--acid))"
                            : launch.state === 2
                                ? "linear-gradient(90deg, var(--gold), var(--magenta))"
                                : "var(--void-border)",
                    opacity: launch.state === 0 ? 1 : 0.5,
                }}
            />

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${["var(--cyan)", "var(--magenta)", "var(--acid)", "var(--gold)"][
                                launch.id % 4
                            ]
                                }, var(--void-elevated))`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 18,
                            color: "white",
                        }}
                    >
                        {launch.symbol.charAt(0)}
                    </div>
                    <div>
                        <div
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: 18,
                                color: "var(--text-primary)",
                                lineHeight: 1.2,
                            }}
                        >
                            {launch.name}
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                color: "var(--text-dim)",
                            }}
                        >
                            ${launch.symbol}
                        </div>
                    </div>
                </div>

                <span className={`badge ${stateInfo.class}`}>
                    {launch.state === 0 && (
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "currentColor",
                                display: "inline-block",
                                animation: "pulse-glow-cyan 2s infinite",
                            }}
                        />
                    )}
                    {stateInfo.label}
                </span>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                    }}
                >
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 13,
                            color: "var(--text-primary)",
                            fontWeight: 600,
                        }}
                    >
                        {launch.totalRaised.toLocaleString()} ℏ
                    </span>
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 13,
                            color: "var(--text-dim)",
                        }}
                    >
                        {launch.hardCap.toLocaleString()} ℏ
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 4,
                    }}
                >
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--cyan)",
                        }}
                    >
                        {progress.toFixed(1)}%
                    </span>
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--text-dim)",
                        }}
                    >
                        Soft: {launch.softCap.toLocaleString()} ℏ
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    padding: "14px 0",
                    borderTop: "1px solid var(--void-border)",
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 14,
                            color: "var(--text-primary)",
                            fontWeight: 700,
                        }}
                    >
                        {launch.contributors}
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 10,
                            color: "var(--text-dim)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Contributors
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 14,
                            color: "var(--text-primary)",
                            fontWeight: 700,
                        }}
                    >
                        {formatTime(launch.timeRemaining)}
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 10,
                            color: "var(--text-dim)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Time Left
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 14,
                            color: "var(--gold)",
                            fontWeight: 700,
                        }}
                    >
                        {launch.tokenPrice.toFixed(4)}
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 10,
                            color: "var(--text-dim)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Price (ℏ)
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { LaunchCardData };
