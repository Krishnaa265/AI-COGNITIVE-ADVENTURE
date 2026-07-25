import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/dashboard2.css";

const RANK_XP = {
    "Apprentice": 0, "Acolyte": 100, "Scholar": 250,
    "Arcanist": 500, "Sage": 900, "Archmage": 1400,
};
const RANK_ICONS = {
    "Apprentice":"🌱","Acolyte":"📚","Scholar":"🔭",
    "Arcanist":"✨","Sage":"🧙","Archmage":"🔮",
};
const ACHIEVEMENTS = [
    { id:"first_explorer", icon:" ", name:"First Explorer", desc:"Complete 5 quests",   check: p => p.sessions >= 5    },
    { id:"scholar",        icon:" ", name:"Scholar",        desc:"Earn 100 XP",          check: p => p.xp >= 100        },
    { id:"researcher",     icon:" ", name:"Researcher",     desc:"Earn 300 XP",          check: p => p.xp >= 300        },
    { id:"arcanist",       icon:"", name:"Arcanist",       desc:"Earn 500 XP",          check: p => p.xp >= 500        },
    { id:"archmage",       icon:"", name:"Archmage",       desc:"Earn 900 XP",          check: p => p.xp >= 900        },
];

const REGIONS = [
    {
        id:"recall", icon:"🌲", title:"Memory Forest", subtitle:"Recall Challenge",
        desc:"Memorize ancient artifacts that vanish into shadow. Speak their names before the darkness takes them.",
        color:"#1a5c3a", glow:"rgba(26,92,58,0.6)", border:"#2d8a5a",
        lang:"ENG", path:"/recall", unlockXp:0,
        stat:"Trains short-term memory",
    },
    {
        id:"fluency", icon:"🌊", title:"Language Lake", subtitle:"Verbal Fluency",
        desc:"Race the hourglass. Name as many words as you can before the sands run out.",
        color:"#1a2a6c", glow:"rgba(26,42,108,0.6)", border:"#3b5bdb",
        lang:"HIN / ENG", path:"/fluency", unlockXp:0,
        stat:"Trains verbal fluency",
    },
    {
        id:"detective", icon:"⛰️", title:"Reasoning Peaks", subtitle:"Detective Mission",
        desc:"A mystery story is read aloud. Listen, remember, then answer the questions of the council.",
        color:"#6b1111", glow:"rgba(107,17,17,0.6)", border:"#8b1a1a",
        lang:"ENG", path:"/detective", unlockXp:600,
        stat:"Trains reasoning & attention",
    },
    {
        id:"vision", icon:"🏛️", title:"Wisdom Temple", subtitle:"Vision Challenge",
        desc:"Study a sacred image for 30 seconds, then name every object you can recall from memory.",
        color:"#4a1a6c", glow:"rgba(74,26,108,0.6)", border:"#7a2d8a",
        lang:"HIN / ENG", path:"/vision", unlockXp:300,
        stat:"Trains visual memory",
    },
];

const DASH_PARTICLES = [
    {char:"✦",x:5,  delay:0,  dur:20},{char:"⚔",x:12, delay:4,  dur:25},
    {char:"✦",x:22, delay:8,  dur:18},{char:"⚜",x:35, delay:2,  dur:22},
    {char:"☽",x:48, delay:6,  dur:28},{char:"✦",x:58, delay:11, dur:17},
    {char:"⚔",x:68, delay:1,  dur:23},{char:"⚜",x:78, delay:7,  dur:19},
    {char:"✦",x:88, delay:13, dur:21},{char:"☆",x:95, delay:3,  dur:26},
    {char:"✦",x:28, delay:16, dur:24},{char:"⚜",x:72, delay:9,  dur:20},
];

function getXpProgress(rank, xp) {
    const ranks  = Object.keys(RANK_XP);
    const values = Object.values(RANK_XP);
    const idx    = ranks.indexOf(rank);
    if (idx === -1 || idx === ranks.length - 1) return 100;
    return Math.min(100, Math.round(((xp - values[idx]) / (values[idx+1] - values[idx])) * 100));
}

function getNextRank(rank) {
    const ranks = Object.keys(RANK_XP);
    const idx   = ranks.indexOf(rank);
    return idx < ranks.length - 1 ? ranks[idx + 1] : null;
}

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [stats,   setStats]   = useState(null);
    const [hovered, setHovered] = useState(null);
    const [campOpen, setCampOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const handle = (e) => {
            const xP = (e.clientX / window.innerWidth  - 0.5) * 2;
            const yP = (e.clientY / window.innerHeight - 0.5) * 2;
            el.querySelectorAll("[data-dp]").forEach(layer => {
                const s = parseFloat(layer.dataset.dp);
                layer.style.transform = `translate(${xP*s}px,${yP*s}px)`;
            });
        };
        window.addEventListener("mousemove", handle, { passive:true });
        return () => window.removeEventListener("mousemove", handle);
    }, []);

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) { window.location.href = "/login"; return; }
        api.get(`/auth/profile/${email}`).then(r => setProfile(r.data)).catch(console.log);
        api.get(`/history/stats/${email}`).then(r => setStats(r.data)).catch(console.log);
    }, []);

    if (!profile) return (
        <div className="rpg-loading">
            <span className="rpg-loading-rune">🔮</span>
            <span className="rpg-loading-text">Consulting the Ancient Records...</span>
        </div>
    );

    const xpPct      = getXpProgress(profile.rank, profile.xp);
    const nextRank   = getNextRank(profile.rank);
    const rankIcon   = RANK_ICONS[profile.rank] || "⚔️";
    const earned     = ACHIEVEMENTS.filter(a => a.check(profile));
    const locked     = ACHIEVEMENTS.filter(a => !a.check(profile));
    const hoveredReg = REGIONS.find(r => r.id === hovered);

    return (
        <div className="db-wrap" ref={wrapRef}>
            {/* ── Parallax bg ── */}
            <div className="db-bg-deep"  data-dp="-5"  />
            <div className="db-bg-mid"   data-dp="-12" />
            <div className="db-bg-near"  data-dp="-20" />
            <div className="db-orb db-orb-1" data-dp="8"  />
            <div className="db-orb db-orb-2" data-dp="14" />
            <div className="db-orb db-orb-3" data-dp="6"  />
            <div className="db-particles" aria-hidden>
                {DASH_PARTICLES.map((p,i) => (
                    <span key={i} className="db-particle" style={{
                        left:`${p.x}%`, animationDelay:`${p.delay}s`,
                        animationDuration:`${p.dur}s`,
                        fontSize:`${0.6+(i%4)*0.15}rem`,
                        opacity:0.06+(i%3)*0.04,
                    }}>{p.char}</span>
                ))}
            </div>

            {/* ── Main layout ── */}
            <div className="db-layout">

                {/* ════ LEFT — Player Card ════ */}
                <aside className="db-player">
                    <div className="db-player-avatar">
                        <span className="db-player-avatar-icon">{rankIcon}</span>
                        <div className="db-player-avatar-ring" />
                    </div>

                    <div className="db-player-name">{profile.username}</div>
                    <div className="db-player-rank-badge">✦ {profile.rank} ✦</div>

                    {/* XP bar */}
                    <div className="db-xp-wrap">
                        <div className="db-xp-labels">
                            <span>⚡ {profile.xp} XP</span>
                            {nextRank && <span style={{color:"rgba(245,230,200,0.4)",fontSize:"0.72rem"}}>→ {nextRank}</span>}
                        </div>
                        <div className="db-xp-track">
                            <div className="db-xp-fill" style={{width:`${xpPct}%`}} />
                        </div>
                        <div className="db-xp-pct">{xpPct}%</div>
                    </div>

                    <div className="db-divider" />

                    {/* Stats */}
                    <div className="db-stats-grid">
                        <div className="db-stat">
                            <span className="db-stat-val">{profile.xp}</span>
                            <span className="db-stat-key">Total XP</span>
                        </div>
                        <div className="db-stat">
                            <span className="db-stat-val">{profile.sessions ?? 0}</span>
                            <span className="db-stat-key">Quests</span>
                        </div>
                        {stats?.chi !== undefined && (
                            <div className="db-stat db-stat-wide">
                                <span className="db-stat-val"> {Math.round(stats.chi)}</span>
                                <span className="db-stat-key">Cognitive Index</span>
                            </div>
                        )}
                        {stats?.best_score !== undefined && (
                            <div className="db-stat db-stat-wide">
                                <span className="db-stat-val">🏅 {stats.best_score}</span>
                                <span className="db-stat-key">Best Score</span>
                            </div>
                        )}
                    </div>

                    <div className="db-divider" />

                    {/* Camp button */}
                    <button className="db-camp-btn" onClick={() => setCampOpen(true)}>
                        ⛺ Explorer Camp
                    </button>
                </aside>

                {/* ════ CENTRE — World Map ════ */}
                <main className="db-map">
                    <div className="db-map-header">
                        <h1 className="db-map-title">World Map</h1>
                        <p className="db-map-sub">Choose your next quest, adventurer</p>
                    </div>

                    {/* Hover preview strip */}
                    <div className={`db-preview ${hoveredReg ? "db-preview-visible" : ""}`}
                         style={hoveredReg ? { borderColor: hoveredReg.border, boxShadow:`0 0 30px ${hoveredReg.glow}` } : {}}>
                        {hoveredReg ? (
                            <>
                                <span style={{fontSize:"2rem"}}>{hoveredReg.icon}</span>
                                <div>
                                    <div className="db-preview-title" style={{color:hoveredReg.border}}>{hoveredReg.title}</div>
                                    <div className="db-preview-desc">{hoveredReg.desc}</div>
                                </div>
                                <span className="db-preview-stat">📊 {hoveredReg.stat}</span>
                            </>
                        ) : <span style={{color:"rgba(245,230,200,0.3)",fontFamily:"var(--font-heading)",fontSize:"0.8rem",letterSpacing:"0.1em"}}>Hover a realm to learn more</span>}
                    </div>

                    {/* Region cards grid */}
                    <div className="db-regions">
                        {REGIONS.map(r => {
                            const isLocked = profile.xp < r.unlockXp;
                            return (
                                <div
                                    key={r.id}
                                    className={`db-region ${isLocked ? "db-region-locked" : "db-region-unlocked"}`}
                                    style={{ "--rc": r.color, "--rg": r.glow, "--rb": r.border }}
                                    onMouseEnter={() => setHovered(r.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => !isLocked && (window.location.href = r.path)}
                                >
                                    {/* Glow shimmer layer */}
                                    <div className="db-region-shimmer" />

                                    {/* Lang badge */}
                                    <span className="db-region-lang">{r.lang}</span>

                                    {/* Icon with ring */}
                                    <div className="db-region-icon-wrap">
                                        <span className="db-region-icon">{r.icon}</span>
                                        {!isLocked && <div className="db-region-icon-ring" />}
                                    </div>

                                    <div className="db-region-body">
                                        <div className="db-region-subtitle">{r.subtitle}</div>
                                        <div className="db-region-title">{r.title}</div>
                                    </div>

                                    {isLocked ? (
                                        <div className="db-region-lock">
                                            <span>🔒</span>
                                            <span>{r.unlockXp} XP to unlock</span>
                                            <div className="db-region-lock-bar">
                                                <div className="db-region-lock-fill"
                                                     style={{width:`${Math.min(100,(profile.xp/r.unlockXp)*100)}%`}} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="db-region-cta">Begin Quest →</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* ════ RIGHT — Achievements ════ */}
                <aside className="db-achievements">
                    <h2 className="db-aside-title">🏆 Achievements</h2>

                    <div className="db-ach-list">
                        {earned.map(a => (
                            <div key={a.id} className="db-ach-item db-ach-earned">
                                <div className="db-ach-icon">{a.icon}</div>
                                <div className="db-ach-text">
                                    <div className="db-ach-name">{a.name}</div>
                                    <div className="db-ach-desc">{a.desc}</div>
                                </div>
                                <div className="db-ach-check">✓</div>
                            </div>
                        ))}
                        {locked.map(a => (
                            <div key={a.id} className="db-ach-item db-ach-locked">
                                <div className="db-ach-icon">🔒</div>
                                <div className="db-ach-text">
                                    <div className="db-ach-name">{a.name}</div>
                                    <div className="db-ach-desc">{a.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="db-divider" style={{margin:"20px 0"}} />

                    {/* Quick stats */}
                    {stats && (
                        <div className="db-quick-stats">
                            <div className="db-aside-title" style={{marginBottom:"12px"}}>📊 Realm Stats</div>
                            {[
                                {label:"Memory Forest",    val: stats.recall_avg    ?? 0},
                                {label:"Language Lake",    val: stats.fluency_avg   ?? 0},
                                {label:"Reasoning Peaks",  val: stats.detective_avg ?? 0},
                                {label:"Wisdom Temple",    val: stats.vision_avg    ?? 0},
                            ].map(s => (
                                <div key={s.label} className="db-realm-stat">
                                    <div className="db-realm-stat-label">{s.label}</div>
                                    <div className="db-realm-stat-bar">
                                        <div className="db-realm-stat-fill" style={{width:`${s.val}%`}} />
                                    </div>
                                    <div className="db-realm-stat-val">{Math.round(s.val)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </div>

            {/* ── Camp Modal ── */}
            {campOpen && (
                <div className="db-camp-overlay" onClick={() => setCampOpen(false)}>
                    <div className="db-camp-menu" onClick={e => e.stopPropagation()}>
                        <h2>⛺ Explorer Camp</h2>
                        <button onClick={() => (window.location.href="/history")}>📜 Quest History</button>
                        <button onClick={() => { 
                            const e=localStorage.getItem("userEmail"); 
                            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
                            window.open(`${backendUrl}/pdf-report/${e}`, "_blank");
                            }}>
                            📄 Cognitive Report
                        </button>
                        <button className="db-camp-logout" onClick={() => { localStorage.removeItem("userEmail"); window.location.href="/login"; }}>
                            🚪 Abandon Quest (Logout)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
