import "../styles/rpg-global.css";
import "../styles/dashboard.css";

const ACHIEVEMENTS = [
    {
        id: "first_explorer",
        icon: "🎖",
        name: "First Explorer",
        desc: "Completed 5 quests",
        check: (p) => p.sessions >= 5,
    },
    {
        id: "scholar",
        icon: "📚",
        name: "Scholar",
        desc: "Earned 100 XP",
        check: (p) => p.xp >= 100,
    },
    {
        id: "researcher",
        icon: "🧠",
        name: "Researcher",
        desc: "Earned 300 XP",
        check: (p) => p.xp >= 300,
    },
    {
        id: "archmage",
        icon: "🔮",
        name: "Archmage",
        desc: "Earned 900 XP",
        check: (p) => p.xp >= 900,
    },
];

export default function AchievementPanel({ profile }) {
    const earned = ACHIEVEMENTS.filter((a) => a.check(profile));
    const locked = ACHIEVEMENTS.filter((a) => !a.check(profile));

    return (
        <div className="achievement-panel">
            <h2 className="rpg-heading" style={{ textAlign: "center", marginBottom: "16px" }}>
                🏆 Achievements
            </h2>

            <div className="achievement-list">
                {earned.map((a) => (
                    <div key={a.id} className="achievement-item">
                        <span className="achievement-icon">{a.icon}</span>
                        <div>
                            <div className="achievement-name">{a.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "rgba(245,230,200,0.5)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
                                {a.desc}
                            </div>
                        </div>
                    </div>
                ))}

                {locked.map((a) => (
                    <div
                        key={a.id}
                        className="achievement-item"
                        style={{ opacity: 0.35, filter: "grayscale(0.8)" }}
                    >
                        <span className="achievement-icon">🔒</span>
                        <div>
                            <div className="achievement-name">{a.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "rgba(245,230,200,0.4)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
                                {a.desc}
                            </div>
                        </div>
                    </div>
                ))}

                {earned.length === 0 && (
                    <div className="achievement-empty">
                        Complete quests to<br />unlock achievements
                    </div>
                )}
            </div>
        </div>
    );
}
