"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LaunchCard from "./components/LaunchCard";
import type { LaunchCardData } from "./components/LaunchCard";
import TokenDetail from "./components/TokenDetail";
import CreateLaunch from "./components/CreateLaunch";
import StakingPanel from "./components/StakingPanel";

// Mock launch data
const MOCK_LAUNCHES: LaunchCardData[] = [
  {
    id: 0,
    name: "HeadStart Token",
    symbol: "HDST",
    totalRaised: 47500,
    hardCap: 100000,
    softCap: 25000,
    contributors: 342,
    timeRemaining: 86400 * 3 + 3600 * 8,
    state: 0,
    tokenPrice: 0.000133,
  },
  {
    id: 1,
    name: "Nebula Finance",
    symbol: "NEBU",
    totalRaised: 180000,
    hardCap: 200000,
    softCap: 50000,
    contributors: 891,
    timeRemaining: 86400 * 1 + 3600 * 2,
    state: 0,
    tokenPrice: 0.000267,
  },
  {
    id: 2,
    name: "Quantum Swap",
    symbol: "QSWP",
    totalRaised: 500000,
    hardCap: 500000,
    softCap: 100000,
    contributors: 2103,
    timeRemaining: 0,
    state: 2,
    tokenPrice: 0.000667,
  },
  {
    id: 3,
    name: "HashVault",
    symbol: "HVLT",
    totalRaised: 12000,
    hardCap: 75000,
    softCap: 20000,
    contributors: 67,
    timeRemaining: 86400 * 12,
    state: 0,
    tokenPrice: 0.0001,
  },
  {
    id: 4,
    name: "Pixel Protocol",
    symbol: "PIXL",
    totalRaised: 350000,
    hardCap: 350000,
    softCap: 80000,
    contributors: 1456,
    timeRemaining: 0,
    state: 2,
    tokenPrice: 0.000467,
  },
  {
    id: 5,
    name: "SolarFlare",
    symbol: "SFLR",
    totalRaised: 5000,
    hardCap: 150000,
    softCap: 30000,
    contributors: 23,
    timeRemaining: 86400 * 25,
    state: 0,
    tokenPrice: 0.0002,
  },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchCardData | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "ended">("all");

  const navigate = (section: string) => {
    setActiveSection(section);
    setSelectedLaunch(null);
    if (section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredLaunches = MOCK_LAUNCHES.filter((l) => {
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
                  Discover and participate in the latest token launches on Hedera
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {filteredLaunches.map((launch) => (
                <LaunchCard
                  key={launch.id}
                  launch={launch}
                  onClick={() => {
                    setSelectedLaunch(launch);
                    setActiveSection("launches");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>

            {filteredLaunches.length === 0 && (
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
                  No launches found with the selected filter
                </p>
              </div>
            )}
          </section>
        )}

        {/* TOKEN DETAIL */}
        {activeSection === "launches" && selectedLaunch && (
          <TokenDetail
            tokenData={selectedLaunch}
            onBack={() => setSelectedLaunch(null)}
          />
        )}

        {/* CREATE SECTION */}
        {activeSection === "create" && <CreateLaunch />}

        {/* STAKING SECTION */}
        {activeSection === "staking" && <StakingPanel />}

        {/* PORTFOLIO SECTION */}
        {activeSection === "portfolio" && (
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
              Track your contributions, claimed tokens, and staking positions.
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
                  label: "Total Invested",
                  value: "12,500 ℏ",
                  color: "var(--cyan)",
                  icon: "💰",
                },
                {
                  label: "Total Tokens",
                  value: "5 Assets",
                  color: "var(--acid)",
                  icon: "🪙",
                },
                {
                  label: "Staking Rewards",
                  value: "3,240 HDST",
                  color: "var(--magenta)",
                  icon: "⛏️",
                },
                {
                  label: "Active Stakes",
                  value: "2 Pools",
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

            {/* Recent activity */}
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
                Recent Activity
              </h3>
              {[
                {
                  action: "Contributed",
                  token: "HDST",
                  amount: "5,000 ℏ",
                  time: "2h ago",
                  color: "var(--cyan)",
                },
                {
                  action: "Staked",
                  token: "QSWP",
                  amount: "500,000 QSWP",
                  time: "1d ago",
                  color: "var(--acid)",
                },
                {
                  action: "Claimed",
                  token: "PIXL",
                  amount: "750,000 PIXL",
                  time: "3d ago",
                  color: "var(--magenta)",
                },
                {
                  action: "Reward",
                  token: "HDST",
                  amount: "3,240 HDST",
                  time: "5d ago",
                  color: "var(--gold)",
                },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom:
                      i < 3 ? "1px solid var(--void-border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: a.color,
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
                        {a.action}{" "}
                        <span style={{ color: a.color }}>{a.token}</span>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-dim)",
                        }}
                      >
                        {a.time}
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
                    {a.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                background: "linear-gradient(135deg, var(--cyan), var(--magenta))",
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
