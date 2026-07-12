import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/home.css";

const FLOATING_RUNES = ["✦","⚔","🔮","✦","☽","✦","⚜","✦","⚔","☆","✦","⚜","⚔","☽","✦"];

// Cards are INFO ONLY — no path, clicking does nothing
const FEATURE_CARDS = [
    {
        icon: "🌲", title: "Memory Forest", subtitle: "Recall Challenge",
        desc: "Memorize ancient artifacts that vanish into shadow. Speak their names before time runs out.",
        color: "var(--emerald)", glow: "rgba(26,92,58,0.35)",
        lang: "ENG",
    },
    {
        icon: "🌊", title: "Language Lake", subtitle: "Verbal Fluency",
        desc: "Race against the hourglass. Name as many words as you can in the chosen category.",
        color: "#3b5bdb", glow: "rgba(59,91,219,0.35)",
        lang: "HIN / ENG",
    },
    {
        icon: "⛰️", title: "Reasoning Peaks", subtitle: "Detective Mission",
        desc: "Listen to a mystery story read aloud, then answer questions from memory.",
        color: "var(--blood-red)", glow: "rgba(139,26,26,0.35)",
        lang: "ENG",
    },
    {
        icon: "🏛️", title: "Wisdom Temple", subtitle: "Vision Challenge",
        desc: "Study a sacred image for 30 seconds, then name every object you remember seeing.",
        color: "#7a2d8a", glow: "rgba(74,26,92,0.35)",
        lang: "HIN / ENG",
    },
];

export default function Home() {
    const [message, setMessage]   = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const heroRef  = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("userEmail"));
    }, []);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const handleMouse = (e) => {
            const xP = (e.clientX / window.innerWidth  - 0.5) * 2;
            const yP = (e.clientY / window.innerHeight - 0.5) * 2;
            hero.querySelectorAll("[data-parallax]").forEach(el => {
                const s = parseFloat(el.dataset.parallax);
                el.style.transform = `translate(${xP * s}px, ${yP * s}px)`;
            });
        };
        window.addEventListener("mousemove", handleMouse, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouse);
    }, []);

    useEffect(() => {
        api.get("/").then(res => setMessage(res.data.message)).catch(() => {});
    }, []);

    return (
        <div className="home-root">
            {/* ── HERO ── */}
            <section className="home-hero" ref={heroRef}>
                <div className="home-bg-layer home-bg-deep" data-parallax="-8"  />
                <div className="home-bg-layer home-bg-mid"  data-parallax="-18" />
                <div className="home-bg-layer home-bg-near" data-parallax="-28" />

                <div className="home-particles" aria-hidden>
                    {FLOATING_RUNES.map((r, i) => (
                        <span key={i} className="home-particle" style={{
                            left:              `${5 + (i * 6.5) % 92}%`,
                            animationDelay:    `${(i * 0.7) % 9}s`,
                            animationDuration: `${10 + (i * 1.3) % 12}s`,
                            fontSize:          `${0.7 + (i % 5) * 0.22}rem`,
                            opacity:            0.12 + (i % 4) * 0.06,
                        }}>{r}</span>
                    ))}
                </div>

                <div className="home-orb home-orb-1" data-parallax="12" />
                <div className="home-orb home-orb-2" data-parallax="20" />
                <div className="home-orb home-orb-3" data-parallax="6"  />

                <div className="home-hero-content">
                    <div className="home-crest" data-parallax="-6"></div>
                    <h1 className="home-title" data-parallax="-4">AI Cognitive<br />Adventure</h1>
                    <p className="home-tagline" data-parallax="-2">◆ Sharpen Your Mind · Conquer the Realms ◆</p>
                    {message && <p className="home-lore">{message}</p>}

                    <div className="home-cta-group">
                        <button onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")} className="rpg-btn rpg-btn-gold home-btn-lg">
                            {isLoggedIn ? "🗺 Go to World Map" : "⚔ Enter the Realm"}
                        </button>
                        {!isLoggedIn && (
                            <button onClick={() => navigate("/register")} className="rpg-btn rpg-btn-ghost home-btn-lg">
                                📜 Create Character
                            </button>
                        )}
                        {isLoggedIn && (
                            <button className="rpg-btn rpg-btn-ghost home-btn-lg" onClick={() => { localStorage.removeItem("userEmail"); setIsLoggedIn(false); }}>
                                🚪 Log Out
                            </button>
                        )}
                    </div>
                    <p className="home-scroll-hint">↓ Explore the Realms</p>
                </div>
            </section>

            {/* ── FEATURE CARDS (info only — no navigation) ── */}
            <section className="home-features">
                <p className="rpg-subtitle" style={{ marginBottom:"48px" }}>Choose Your Destiny</p>
                <div className="home-features-grid">
                    {FEATURE_CARDS.map((card, i) => (
                        <div
                            key={i}
                            className="home-feature-card"
                            style={{ "--card-color": card.color, "--card-glow": card.glow, animationDelay:`${i * 0.12}s`, cursor:"default" }}
                        >
                            {/* Language badge top-right */}
                            <span className="home-card-lang-badge">{card.lang}</span>

                            <div className="home-feature-icon">{card.icon}</div>
                            <div className="home-feature-sub">{card.subtitle}</div>
                            <h3 className="home-feature-title">{card.title}</h3>
                            <p className="home-feature-desc">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── STATS STRIP ── */}
            <section className="home-stats-strip">
                {[
                    { val:"4",  label:"Cognitive Realms"  },
                    { val:"∞",  label:"Unique Quests"     },
                    { val:"AI", label:"Powered Scoring"   },
                    { val:"🏆", label:"Achievement System"},
                ].map((s, i) => (
                    <div key={i} className="home-stat-item">
                        <span className="home-stat-val">{s.val}</span>
                        <span className="home-stat-key">{s.label}</span>
                    </div>
                ))}
            </section>
        </div>
    );
}
