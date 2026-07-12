import "../styles/rpg-global.css";
import "../styles/dashboard.css";

// XP thresholds per rank
const RANK_XP = {
    "Apprentice":  0,
    "Acolyte":     100,
    "Scholar":     250,
    "Arcanist":    500,
    "Sage":        900,
    "Archmage":    1400,
};

const RANK_ICONS = {
    "Apprentice": "🌱",
    "Acolyte":    "📚",
    "Scholar":    "🔭",
    "Arcanist":   "✨",
    "Sage":       "🧙",
    "Archmage":   "🔮",
};

function getXpProgress(rank, xp) {
    const ranks = Object.keys(RANK_XP);
    const values = Object.values(RANK_XP);
    const idx = ranks.indexOf(rank);
    if (idx === -1 || idx === ranks.length - 1) return 100;
    const current = values[idx];
    const next    = values[idx + 1];
    return Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
}

export default function PlayerPanel({ profile, stats }) {
    const xpPct = getXpProgress(profile.rank, profile.xp);
    const icon  = RANK_ICONS[profile.rank] || "⚔️";

    return (
        <div className="player-panel">
            <div className="player-avatar">{icon}</div>

            <div className="player-name">{profile.username}</div>
            <div className="player-rank">✦ {profile.rank} ✦</div>

            <div className="xp-bar-wrap">
                <div className="xp-bar-label">
                    <span>XP</span>
                    <span>{profile.xp}</span>
                </div>
                <div className="xp-bar-track">
                    <div
                        className="xp-bar-fill"
                        style={{ width: `${xpPct}%` }}
                    />
                </div>
            </div>

            <div className="player-divider" />

            <div className="player-stats-grid">
                <div className="player-stat-box">
                    <span className="player-stat-val">⚡ {profile.xp}</span>
                    <span className="player-stat-key">Total XP</span>
                </div>
                <div className="player-stat-box">
                    <span className="player-stat-val">🗺 {profile.sessions}</span>
                    <span className="player-stat-key">Quests</span>
                </div>
                {stats?.chi !== undefined && (
                    <div className="player-stat-box" style={{ gridColumn: "span 2" }}>
                        <span className="player-stat-val">🧠 {stats.chi}</span>
                        <span className="player-stat-key">Cognitive Index</span>
                    </div>
                )}
            </div>
        </div>
    );
}
