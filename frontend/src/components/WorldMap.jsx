import { useState } from "react";
import "../styles/rpg-global.css";
import "../styles/dashboard.css";

// Region card with language badge built-in
function RegionCard({ icon, title, description, locked, lockXp, onClick, variant, lang }) {
    const isCamp = variant === "camp";
    return (
        <div
            className={`region-card${isCamp ? " region-card-camp" : ""}${locked ? " locked" : ""}`}
            onClick={locked ? undefined : onClick}
            style={{ position:"relative" }}
        >
            {/* Language badge */}
            {lang && !isCamp && (
                <span className="region-lang-badge">{lang}</span>
            )}
            <span className="region-icon">{icon}</span>
            <div className="region-title">{title}</div>
            <div className="region-desc">{description}</div>
            {locked && (
                <div className="region-lock">🔒 Requires {lockXp} XP</div>
            )}
        </div>
    );
}

export default function WorldMap({ profile }) {
    const [campOpen, setCampOpen] = useState(false);

    const templeUnlocked  = profile.xp >= 300;
    const reasoningUnlocked = profile.xp >= 600;

    return (
        <div className="world-container">
            <div className="world-header">
                <p className="rpg-subtitle" style={{ marginBottom:0 }}>
                    Choose Your Quest ◆ Explore the Cognitive Realms
                </p>
            </div>

            <div className="world-map-grid">
                {/* Explorer Camp — full width */}
                <RegionCard
                    icon="⛺" title="Explorer Camp" description="Your base of operations"
                    variant="camp" onClick={() => setCampOpen(true)}
                />

                {/* Memory Forest — ENG only */}
                <RegionCard
                    icon="🌲" title="Memory Forest" description="Recall Challenge"
                    lang="ENG"
                    onClick={() => (window.location.href = "/recall")}
                />

                {/* Language Lake — bilingual */}
                <RegionCard
                    icon="🌊" title="Language Lake" description="Verbal Fluency"
                    lang="HIN / ENG"
                    onClick={() => (window.location.href = "/fluency")}
                />

                {/* Reasoning Peaks — locked at 600 XP */}
                <RegionCard
                    icon="⛰️" title="Reasoning Peaks" description="Detective Mission"
                    lang="ENG"
                    locked={!reasoningUnlocked} lockXp={600}
                    onClick={() => (window.location.href = "/detective")}
                />

                {/* Wisdom Temple — locked at 300 XP, bilingual */}
                <RegionCard
                    icon="🏛️" title="Wisdom Temple" description="Vision Challenge"
                    lang="HIN / ENG"
                    locked={!templeUnlocked} lockXp={300}
                    onClick={() => (window.location.href = "/vision")}
                />
            </div>

            {/* Camp Modal */}
            {campOpen && (
                <div className="camp-overlay" onClick={() => setCampOpen(false)}>
                    <div className="camp-menu" onClick={e => e.stopPropagation()}>
                        <h2>⛺ Explorer Camp</h2>
                        <button onClick={() => (window.location.href = "/history")}>
                            📜 Assessment History
                        </button>
                        <button onClick={() => {
                            const email = localStorage.getItem("userEmail");
                            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
                            window.open(`${backendUrl}/pdf-report/${email}`, "_blank");
                        }}>
                            📄 Cognitive Report
                        </button>
                        <button className="logout-btn" onClick={() => {
                            localStorage.removeItem("userEmail");
                            window.location.href = "/login";
                        }}>
                            🚪 Abandon Quest (Logout)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
