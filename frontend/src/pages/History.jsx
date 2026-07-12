// ── History.jsx (updated) ────────────────────────────────────
// Replace your existing frontend/src/pages/History.jsx with this
// Adds Vision sessions to the Quest Ledger filter + table

import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/challenges.css";

const TYPE_META = {
    Recall:    { icon: "🌲", label: "Memory Forest",   pillClass: "pill-recall"    },
    Fluency:   { icon: "🌊", label: "Language Lake",   pillClass: "pill-fluency"   },
    Detective: { icon: "⛰️", label: "Reasoning Peaks", pillClass: "pill-detective" },
    Vision:    { icon: "🏛️", label: "Wisdom Temple",   pillClass: "pill-vision"    },
};

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function History() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filter, setFilter]     = useState("all");

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) { window.location.href = "/login"; return; }
        api.get(`/history/${email}`)
            .then(res => setSessions(res.data))
            .catch(console.log)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === "all"
        ? sessions
        : sessions.filter(s => s.type.toLowerCase() === filter);

    if (loading) {
        return (
            <div className="rpg-loading">
                <span className="rpg-loading-rune">📜</span>
                <span className="rpg-loading-text">Unrolling the Ancient Tome...</span>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-header">
                <h1 className="rpg-title">Quest Ledger</h1>
                <p className="rpg-subtitle">A chronicle of your cognitive conquests</p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
                {[
                    { key: "all",       label: "📖 All Quests"       },
                    { key: "recall",    label: "🌲 Memory Forest"     },
                    { key: "fluency",   label: "🌊 Language Lake"     },
                    { key: "detective", label: "⛰️ Reasoning Peaks"   },
                    { key: "vision",    label: "🏛️ Wisdom Temple"     },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`rpg-btn ${filter === f.key ? "rpg-btn-gold" : "rpg-btn-ghost"}`}
                        style={{ padding: "8px 18px", fontSize: "0.8rem" }}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="challenge-card" style={{ textAlign: "center", padding: "60px 32px" }}>
                    <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>📭</span>
                    <p className="rpg-heading">No Quests Found</p>
                    <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "rgba(245,230,200,0.5)", marginTop: "8px" }}>
                        Complete some quests to fill your ledger
                    </p>
                    <button
                        className="rpg-btn rpg-btn-gold"
                        style={{ marginTop: "24px" }}
                        onClick={() => (window.location.href = "/dashboard")}
                    >
                        🗺 Go to World Map
                    </button>
                </div>
            ) : (
                <div className="history-scroll-container">
                    <table className="rpg-table">
                        <thead>
                            <tr>
                                <th>Quest Type</th>
                                <th>Score</th>
                                <th>XP Earned</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((session, i) => {
                                const meta = TYPE_META[session.type] || { icon: "❓", label: session.type, pillClass: "" };
                                const scorePct = Math.min(100, session.score || 0);
                                return (
                                    <tr key={i}>
                                        <td>
                                            <span className={`challenge-type-pill ${meta.pillClass}`}>
                                                {meta.icon} {meta.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="score-bar">
                                                <div className="score-bar-track">
                                                    <div
                                                        className="score-bar-fill"
                                                        style={{ width: `${scorePct}%` }}
                                                    />
                                                </div>
                                                <span className="score-num">{session.score ?? "—"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: "var(--font-heading)", color: "var(--gold)", fontSize: "0.9rem" }}>
                                                +{session.xp ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(245,230,200,0.55)" }}>
                                                {formatDate(session.date || session.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Vision pill CSS — add to challenges.css */}
            <style>{`.pill-vision { background: rgba(74,26,92,0.25); border: 1px solid #7a2d8a; color: #d8b4fe; }`}</style>

            <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button className="rpg-btn rpg-btn-ghost" onClick={() => (window.location.href = "/dashboard")}>
                    🗺 Return to World Map
                </button>
            </div>
        </div>
    );
}
