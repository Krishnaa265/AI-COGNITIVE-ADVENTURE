import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/challenges.css";

/*
  FLOW:
  setup → loading → listening (story spoken aloud) → questioning (Q&A) → evaluating → result

  - Story is SPOKEN via TTS, never shown as text
  - Each question is spoken, then user answers by VOICE or TYPING
  - Easy: 2 questions, slow story speed, can replay story
  - Medium: 3 questions, normal speed, one replay allowed
  - Hard: 4 questions, fast speed, no replay
*/

const DIFFICULTY_CONFIG = {
    Easy:   { questions: 2, rate: 0.75, replays: 2, label: "2 questions · Slow narration · Replay allowed" },
    Medium: { questions: 3, rate: 0.90, replays: 1, label: "3 questions · Normal speed · 1 replay" },
    Hard:   { questions: 4, rate: 1.10, replays: 0, label: "4 questions · Fast narration · No replay" },
};

const PHASES = {
    SETUP:       "setup",
    LOADING:     "loading",
    LISTENING:   "listening",   // story being spoken
    QUESTIONING: "questioning", // answering questions
    EVALUATING:  "evaluating",
    RESULT:      "result",
};

export default function DetectiveChallenge() {
    const [phase,          setPhase]          = useState(PHASES.SETUP);
    const [difficulty,     setDifficulty]     = useState("Easy");
    const [mission,        setMission]        = useState(null);
    const [currentQ,       setCurrentQ]       = useState(0);
    const [answers,        setAnswers]        = useState([]);
    const [transcript,     setTranscript]     = useState("");
    const [typedAnswer,    setTypedAnswer]    = useState("");
    const [isRecording,    setIsRecording]    = useState(false);
    const [inputMode,      setInputMode]      = useState("voice"); // "voice" | "type"
    const [result,         setResult]         = useState(null);
    const [replaysLeft,    setReplaysLeft]    = useState(0);
    const [storyProgress,  setStoryProgress]  = useState(0); // 0-100 for progress bar
    const [qSpoken,        setQSpoken]        = useState(false); // has current question been spoken?
    const recognitionRef = useRef(null);
    const progressRef    = useRef(null);

    const cfg = DIFFICULTY_CONFIG[difficulty];

    // ── TTS helper ──────────────────────────────────────────────
    const speak = (text, rate = 1.0, onEnd = null) => {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.lang = "en-IN";
        if (onEnd) u.onend = onEnd;
        speechSynthesis.speak(u);
    };

    // ── Start mission ────────────────────────────────────────────
    const startMission = async () => {
        setPhase(PHASES.LOADING);
        setAnswers([]);
        setCurrentQ(0);
        setResult(null);
        setTranscript("");
        setTypedAnswer("");
        setReplaysLeft(cfg.replays);

        try {
            const res = await api.get("/detective/mission");
            const data = res.data;

            // Trim questions to difficulty count
            data.questions = data.questions.slice(0, cfg.questions);
            setMission(data);
            setPhase(PHASES.LISTENING);

            // Animate progress bar while story is spoken
            const estimatedMs = (data.story.split(" ").length / cfg.rate) * 700;
            let elapsed = 0;
            progressRef.current = setInterval(() => {
                elapsed += 200;
                setStoryProgress(Math.min(99, Math.round((elapsed / estimatedMs) * 100)));
            }, 200);

            speak(data.story, cfg.rate, () => {
                clearInterval(progressRef.current);
                setStoryProgress(100);
                setTimeout(() => startQuestion(0, data), 600);
            });
        } catch (err) {
            console.error(err);
            setPhase(PHASES.SETUP);
            alert("Failed to generate mission. Check your backend.");
        }
    };

    // ── Replay story ─────────────────────────────────────────────
    const replayStory = () => {
        if (replaysLeft <= 0 || !mission) return;
        setReplaysLeft(r => r - 1);
        speak(mission.story, cfg.rate);
    };

    // ── Ask a question ───────────────────────────────────────────
    const startQuestion = (index, missionData = mission) => {
        if (index >= missionData.questions.length) {
            submitMission(answers);
            return;
        }
        setCurrentQ(index);
        setTranscript("");
        setTypedAnswer("");
        setQSpoken(false);
        setPhase(PHASES.QUESTIONING);

        const q = missionData.questions[index]?.question || missionData.questions[index];
        setTimeout(() => {
            speak(`Question ${index + 1}. ${q}`, 0.95, () => setQSpoken(true));
        }, 400);
    };

    // ── Replay current question ──────────────────────────────────
    const replayQuestion = () => {
        if (!mission) return;
        const q = mission.questions[currentQ]?.question || mission.questions[currentQ];
        speak(`Question ${currentQ + 1}. ${q}`, 0.9);
    };

    // ── Voice recording ──────────────────────────────────────────
    const startRecording = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Speech recognition not supported. Use typing mode."); return; }
        speechSynthesis.cancel();
        const recog = new SR();
        recognitionRef.current = recog;
        recog.continuous     = true;
        recog.interimResults = true;
        recog.lang           = "en-IN";
        recog.onstart        = () => setIsRecording(true);
        recog.onend          = () => setIsRecording(false);
        recog.onerror        = (e) => console.error(e.error);
        recog.onresult       = (event) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript + " ";
            }
            setTranscript(text);
        };
        recog.start();
    };

    const stopRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
    };

    // ── Submit answer for current question ───────────────────────
    const submitAnswer = () => {
        stopRecording();
        const ans = inputMode === "voice" ? transcript.trim() : typedAnswer.trim();
        if (!ans) return;
        const updated = [...answers, ans];
        setAnswers(updated);

        if (currentQ + 1 >= mission.questions.length) {
            submitMission(updated);
        } else {
            setTimeout(() => startQuestion(currentQ + 1), 500);
        }
    };

    // ── Final submission ─────────────────────────────────────────
    const submitMission = async (finalAnswers) => {
        speechSynthesis.cancel();
        setPhase(PHASES.EVALUATING);
        try {
            const res = await api.post("/detective/evaluate", {
                story:     mission.story,
                questions: mission.questions,
                answers:   finalAnswers,
                email:     localStorage.getItem("userEmail"),
            });
            setResult(res.data);
            setPhase(PHASES.RESULT);
        } catch (err) {
            console.error(err);
            alert("Evaluation failed.");
            setPhase(PHASES.SETUP);
        }
    };

    const reset = () => {
        speechSynthesis.cancel();
        clearInterval(progressRef.current);
        setPhase(PHASES.SETUP);
        setMission(null);
        setAnswers([]);
        setCurrentQ(0);
        setResult(null);
        setTranscript("");
        setTypedAnswer("");
        setStoryProgress(0);
    };

    // Current question text
    const currentQuestion = mission?.questions?.[currentQ];
    const currentQText    = currentQuestion?.question || currentQuestion || "";
    const totalQ          = mission?.questions?.length || cfg.questions;

    return (
        <div className="challenge-page">

            {/* ── Header ── */}
            <div className="challenge-header">
                <span className="challenge-zone-badge zone-peaks">⛰️ Reasoning Peaks</span>
                <h1 className="rpg-title">Detective Mission</h1>
                <p className="rpg-subtitle" style={{ marginBottom: 0 }}>
                    Listen carefully · Answer what you remember
                </p>
            </div>

            {/* ── SETUP ── */}
            {phase === PHASES.SETUP && (
                <div className="challenge-card">
                    {/* How it works */}
                    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                        <h3 className="rpg-heading" style={{ textAlign:"center" }}>✦ How the Mission Works ✦</h3>

                        {[
                            { num:"01", title:"Hear the Story", desc:"A mystery story is read aloud by the oracle. No text shown — listen carefully!" },
                            { num:"02", title:"Answer Questions", desc:"Questions are spoken one by one. Answer by voice or typing." },
                            { num:"03", title:"Get Evaluated", desc:"AI scores your memory, attention, reasoning and language." },
                        ].map((s, i) => (
                            <div key={i} className="vision-step">
                                <span className="vision-step-num">{s.num}</span>
                                <div>
                                    <strong>{s.title}</strong>
                                    <p>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rpg-divider">◆</div>

                    {/* Difficulty */}
                    <div>
                        <p className="rpg-label" style={{ marginBottom:"12px" }}>Choose Mission Difficulty</p>
                        <div className="difficulty-group">
                            {["Easy","Medium","Hard"].map(d => (
                                <button
                                    key={d}
                                    className={`difficulty-btn difficulty-${d.toLowerCase()} ${difficulty === d ? "selected" : ""}`}
                                    onClick={() => setDifficulty(d)}
                                >
                                    {d === "Easy" ? "🕯" : d === "Medium" ? "⚔" : "💀"} {d}
                                </button>
                            ))}
                        </div>
                        <p style={{ textAlign:"center", marginTop:"12px", fontFamily:"var(--font-body)", fontStyle:"italic", color:"rgba(245,230,200,0.5)", fontSize:"0.88rem" }}>
                            {cfg.label}
                        </p>
                    </div>

                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-red" onClick={startMission}>
                            🔍 Begin Investigation
                        </button>
                    </div>
                </div>
            )}

            {/* ── LOADING ── */}
            {phase === PHASES.LOADING && (
                <div className="rpg-loading">
                    <span className="rpg-loading-rune">🔮</span>
                    <span className="rpg-loading-text">Summoning the Mystery...</span>
                </div>
            )}

            {/* ── LISTENING (story being spoken) ── */}
            {phase === PHASES.LISTENING && (
                <div className="challenge-card" style={{ textAlign:"center", gap:"28px", display:"flex", flexDirection:"column" }}>
                    <div>
                        <span style={{ fontSize:"3.5rem", display:"block", marginBottom:"16px", filter:"drop-shadow(0 0 16px rgba(139,26,26,0.7))", animation:"flicker 2s ease-in-out infinite" }}>
                            📖
                        </span>
                        <h3 className="rpg-heading">The Oracle Speaks...</h3>
                        <p style={{ fontFamily:"var(--font-body)", fontStyle:"italic", color:"rgba(245,230,200,0.6)", fontSize:"0.95rem", marginTop:"8px" }}>
                            Listen carefully. The story will not be shown.
                        </p>
                    </div>

                    {/* Story progress bar */}
                    <div className="xp-bar-wrap">
                        <div className="xp-bar-label">
                            <span>Narrating...</span>
                            <span>{storyProgress}%</span>
                        </div>
                        <div className="xp-bar-track">
                            <div className="xp-bar-fill" style={{ width:`${storyProgress}%`, background:"linear-gradient(90deg, var(--blood-red), #ff6b6b)" }} />
                        </div>
                    </div>

                    <p style={{ fontFamily:"var(--font-heading)", fontSize:"0.75rem", letterSpacing:"0.15em", color:"rgba(245,230,200,0.3)" }}>
                        Questions will follow automatically
                    </p>
                </div>
            )}

            {/* ── QUESTIONING ── */}
            {phase === PHASES.QUESTIONING && (
                <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

                    {/* Progress pips */}
                    <div className="detective-progress">
                        {Array.from({ length: totalQ }).map((_, i) => (
                            <div key={i} className={`detective-pip ${i < currentQ ? "done" : i === currentQ ? "active" : ""}`} />
                        ))}
                    </div>

                    {/* Question card */}
                    <div className="challenge-card">
                        <div className="detective-question-card">
                            <span className="detective-q-num">
                                Clue {currentQ + 1} of {totalQ}
                            </span>

                            {/* Question text — shown AFTER it's been spoken */}
                            <div style={{
                                minHeight:"60px",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                padding:"16px",
                                background:"rgba(0,0,0,0.3)",
                                borderRadius:"var(--radius-md)",
                                border:"1px solid rgba(201,162,39,0.2)",
                            }}>
                                {qSpoken ? (
                                    <p style={{ fontFamily:"var(--font-body)", fontSize:"1.05rem", color:"var(--parchment)", lineHeight:1.7, textAlign:"center", margin:0 }}>
                                        {currentQText}
                                    </p>
                                ) : (
                                    <p style={{ fontFamily:"var(--font-heading)", fontSize:"0.85rem", letterSpacing:"0.1em", color:"rgba(245,230,200,0.4)", textAlign:"center" }}>
                                        🔊 Question being spoken...
                                    </p>
                                )}
                            </div>

                            {/* Replay question button */}
                            {qSpoken && (
                                <button className="rpg-btn rpg-btn-ghost" style={{ fontSize:"0.78rem", padding:"8px 16px" }} onClick={replayQuestion}>
                                    🔊 Replay Question
                                </button>
                            )}

                            {/* Replay story button */}
                            {replaysLeft > 0 && qSpoken && (
                                <button className="rpg-btn rpg-btn-ghost" style={{ fontSize:"0.78rem", padding:"8px 16px", borderColor:"rgba(139,26,26,0.4)", color:"rgba(252,165,165,0.7)" }} onClick={replayStory}>
                                    📖 Replay Story ({replaysLeft} left)
                                </button>
                            )}
                        </div>

                        {/* Input mode toggle */}
                        {qSpoken && (
                            <>
                                <div style={{ display:"flex", justifyContent:"center", margin:"4px 0" }}>
                                    <div className="lang-toggle">
                                        <button className={`lang-toggle-btn ${inputMode === "voice" ? "active" : ""}`} onClick={() => setInputMode("voice")}>
                                            🎤 Voice
                                        </button>
                                        <button className={`lang-toggle-btn ${inputMode === "type" ? "active" : ""}`} onClick={() => setInputMode("type")}>
                                            ⌨️ Type
                                        </button>
                                    </div>
                                </div>

                                {/* Voice input */}
                                {inputMode === "voice" && (
                                    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                                        <div>
                                            <p className="rpg-label" style={{ marginBottom:"8px" }}>Your Answer</p>
                                            <div className="rpg-transcript">{transcript || ""}</div>
                                        </div>
                                        <div className="challenge-actions">
                                            {!isRecording ? (
                                                <button className="rpg-btn rpg-btn-gold" onClick={startRecording}>🎤 Speak Answer</button>
                                            ) : (
                                                <button className="rpg-btn rpg-btn-red" onClick={stopRecording}>⏹ Stop</button>
                                            )}
                                            <button className="rpg-btn rpg-btn-emerald" onClick={submitAnswer} disabled={!transcript.trim()}>
                                                {currentQ + 1 >= totalQ ? "⚖ Submit Mission" : "Next Clue →"}
                                            </button>
                                        </div>
                                        {isRecording && (
                                            <div style={{ textAlign:"center" }}>
                                                <span className="rpg-status rpg-status-recording">🎤 Recording</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Type input */}
                                {inputMode === "type" && (
                                    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                                        <div>
                                            <p className="rpg-label" style={{ marginBottom:"8px" }}>Your Answer</p>
                                            <textarea
                                                className="rpg-input"
                                                rows={3}
                                                placeholder="Type your answer here..."
                                                value={typedAnswer}
                                                onChange={e => setTypedAnswer(e.target.value)}
                                                style={{ resize:"vertical", lineHeight:1.7 }}
                                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && typedAnswer.trim()) { e.preventDefault(); submitAnswer(); }}}
                                            />
                                        </div>
                                        <div className="challenge-actions">
                                            <button className="rpg-btn rpg-btn-emerald" onClick={submitAnswer} disabled={!typedAnswer.trim()}>
                                                {currentQ + 1 >= totalQ ? "⚖ Submit Mission" : "Next Clue →"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── EVALUATING ── */}
            {phase === PHASES.EVALUATING && (
                <div className="rpg-loading">
                    <span className="rpg-loading-rune">⚖️</span>
                    <span className="rpg-loading-text">The Council is Deliberating...</span>
                </div>
            )}

            {/* ── RESULT ── */}
            {phase === PHASES.RESULT && result && (
                <div className="cognitive-report rpg-animate-in">
                    <h2 className="rpg-heading" style={{ textAlign:"center" }}>✦ Mission Debrief ✦</h2>

                    {/* Score grid */}
                    <div className="cognitive-score-grid">
                        {[
                            { label:"Memory",    val: result.memory    },
                            { label:"Attention",  val: result.attention  },
                            { label:"Reasoning",  val: result.reasoning  },
                            { label:"Language",   val: result.language   },
                        ].map(item => (
                            <div key={item.label} className="cognitive-score-item">
                                <span className="cognitive-score-label">{item.label}</span>
                                <span className="cognitive-score-val">{item.val}</span>
                                <div className="cognitive-score-bar">
                                    <div className="cognitive-score-bar-fill" style={{ width:`${item.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overall */}
                    <div className="rpg-result-row">
                        <span className="rpg-result-key">Overall Score</span>
                        <span className="rpg-result-val">{result.overall}</span>
                    </div>

                    {/* Your answers summary */}
                    {answers.length > 0 && (
                        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                            <p className="rpg-label">Your Answers</p>
                            {answers.map((ans, i) => {
                                const q = mission?.questions?.[i];
                                const qText = q?.question || q || "";
                                return (
                                    <div key={i} style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(201,162,39,0.15)", borderRadius:"var(--radius-md)", padding:"12px 16px" }}>
                                        <p style={{ fontFamily:"var(--font-heading)", fontSize:"0.7rem", letterSpacing:"0.12em", color:"rgba(245,230,200,0.45)", marginBottom:"4px" }}>Q{i+1}: {qText}</p>
                                        <p style={{ fontFamily:"var(--font-body)", fontSize:"0.9rem", color:"var(--parchment)", fontStyle:"italic" }}>"{ans}"</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* XP banner */}
                    <div className="xp-earned-banner">
                        <span className="xp-earned-label">XP Earned</span>
                        <span className="xp-earned-val">+{result.xp}</span>
                    </div>

                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-gold" onClick={reset}>🔍 New Investigation</button>
                        <button className="rpg-btn rpg-btn-ghost" onClick={() => (window.location.href = "/dashboard")}>🗺 Return to Map</button>
                    </div>
                </div>
            )}
        </div>
    );
}
