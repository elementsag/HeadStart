"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LaunchCard from "./components/LaunchCard";
import type { LaunchCardData } from "./components/LaunchCard";
import TokenDetail from "./components/TokenDetail";
import CreateLaunch from "./components/CreateLaunch";
import StakingPanel from "./components/StakingPanel";
import { useLaunches } from "./lib/hooks";
import type { LiveLaunchData } from "./lib/hooks";

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedLaunch, setSelectedLaunch] = useState<LiveLaunchData | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "ended">("all");

  const { launches, isLoading, count } = useLaunches();

  const navigate = (section: string) => {
    setActiveSection(section);
    setSelectedLaunch(null);
    if (section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Map live launches to LaunchCardData format for the cards
  const launchCards: LaunchCardData[] = launches.map((l) => ({
    id: l.id,
    name: l.name,
    symbol: l.symbol,
    totalRaised: l.totalRaised,
    hardCap: l.hardCap,
    softCap: l.softCap,
    contributors: l.contributors,
    timeRemaining: l.timeRemaining,
    state: l.state,
    tokenPrice: l.tokenPrice,
  }));

  const filteredLaunches = launchCards.filter((l) => {
    if (filter === "live") return l.state === 0;
    if (filter === "ended") return l.state === 2 || l.state === 1;
    return true;
  });

  return (
    <div>
      <Navbar activeSection={activeSection} onNavigate={navigate} />

      {/* Hero */}
      {activeSection === "hero" && <Hero onNavigate={navigate} />}

      {/* Main Content */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: activeSection === "hero" ? "0 24px 80px" : "96px 24px 80px",
        }}
      >
        {/* LAUNCHES SECTION */}
        {(activeSection === "hero" || activeSection === "launches") && !selectedLaunch && (
          <section id="launches" style={{ paddingTop: activeSection === "hero" ? 0 : 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 32,
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontWeight: 800,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {activeSection === "hero" ? "Trending Launches" : "All Launches"}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                  }}
                >
                  {isLoading
                    ? "Loading launches from chain..."
                    : count > 0
                      ? `${count} project${count !== 1 ? "s" : ""} launched on Hedera`
                      : "No launches yet — be the first to create one!"}
                </p>
              </div>

              <div className="tab-group">
                {[
                  { id: "all" as const, label: "All" },
                  { id: "live" as const, label: "Live" },
                  { id: "ended" as const, label: "Ended" },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={`tab-item ${filter === f.id ? "active" : ""}`}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div
                className="glass-card"
                style={{
                  padding: 60,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>⏳</div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  Loading launches from Hedera Testnet...
                </p>
              </div>
            )}

            {/* Launch grid */}
            {!isLoading && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 16,
                }}
              >
                {filteredLaunches.map((card) => (
                  <LaunchCard
                    key={card.id}
                    launch={card}
                    onClick={() => {
                      const live = launches.find((l) => l.id === card.id);
                      if (live) {
                        setSelectedLaunch(live);
                        setActiveSection("launches");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {!isLoading && filteredLaunches.length === 0 && (
              <div
                className="glass-card"
                style={{
                  padding: 60,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-dim)",
                  }}
                >
                  {count === 0
                    ? "No launches deployed yet. Create the first one!"
                    : "No launches found with the selected filter"}
                </p>
              </div>
            )}
          </section>
        )}

        {/* TOKEN DETAIL */}
        {activeSection === "launches" && selectedLaunch && (
          <TokenDetail
            launch={selectedLaunch}
            onBack={() => setSelectedLaunch(null)}
          />
        )}

        {/* CREATE SECTION */}
        {activeSection === "create" && <CreateLaunch />}

        {/* STAKING SECTION */}
        {activeSection === "staking" && <StakingPanel />}

        {/* PORTFOLIO SECTION */}
        {activeSection === "portfolio" && (
          <PortfolioSection launches={launches} />
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--void-border)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                background: "var(--cyan)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                color: "white",
              }}
            >
              H
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-secondary)",
              }}
            >
              HEAD<span style={{ color: "var(--cyan)" }}>START</span>
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-dim)",
            }}
          >
            Built on Hedera · Powered by Smart Contracts
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["Docs", "GitHub", "Discord", "Twitter"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//                    PORTFOLIO SECTION
// ═══════════════════════════════════════════════════════════════

function PortfolioSection({ launches }: { launches: LiveLaunchData[] }) {
  const activeLaunches = launches.filter((l) => l.state === 0).length;
  const finalizedLaunches = launches.filter((l) => l.state === 2).length;

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 8,
          color: "var(--text-primary)",
        }}
      >
        Portfolio
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--text-secondary)",
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        Track your contributions, claimed assets, and staking positions.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {[
          {
            label: "Total Launches",
            value: `${launches.length}`,
            color: "var(--cyan)",
            icon: "🚀",
          },
          {
            label: "Active Launches",
            value: `${activeLaunches}`,
            color: "var(--acid)",
            icon: "🟢",
          },
          {
            label: "Finalized",
            value: `${finalizedLaunches}`,
            color: "var(--magenta)",
            icon: "✅",
          },
          {
            label: "Has Staking",
            value: `${launches.filter((l) => l.tokensForStaking > 0).length} Pools`,
            color: "var(--gold)",
            icon: "📊",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{ padding: 24, position: "relative", overflow: "hidden" }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: s.color,
              }}
            />
            <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 22,
                fontWeight: 700,
                color: s.color,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Launches list */}
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
          All Deployed Launches
        </h3>
        {launches.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--text-dim)",
            }}
          >
            No launches found. Create one to get started!
          </p>
        ) : (
          launches.map((l, i) => {
            const stateLabels = ["Active", "Succeeded", "Finalized", "Failed", "Cancelled"];
            const stateColors = ["var(--acid)", "var(--gold)", "var(--cyan)", "var(--magenta)", "var(--text-dim)"];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: i < launches.length - 1 ? "1px solid var(--void-border)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: stateColors[l.state] || "var(--text-dim)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 14,
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {l.name}{" "}
                      <span style={{ color: stateColors[l.state] || "var(--text-dim)" }}>
                        ${l.symbol}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--text-dim)",
                      }}
                    >
                      {stateLabels[l.state] || "Unknown"} · {l.totalRaised.toFixed(2)} ℏ raised
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {l.contributors} backers
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
