import { useState, useRef, useCallback } from "react";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/challenges.css";

const objectPools = {
    Easy: [
        ["Apple","Book","Dog","Chair","Clock"],
        ["Car","Bottle","Elephant","Pencil","Fan"],
        ["Tree","Laptop","Monkey","Spoon","Phone"],
        ["Train","River","Tiger","Table","Camera"],
        ["Doctor","School","Rabbit","Window","Ball"],
        ["Orange","Horse","Notebook","Cup","Television"],
        ["Banana","Lion","Plate","Keyboard","Bridge"],
        ["Bus","Parrot","Door","Shoes","Mango"],
        ["Cow","Lamp","Bag","Garden","Pen"],
        ["Peacock","Mountain","Temple","River","Drum"],
    ],
    Medium: [
        ["Apple","Book","Dog","Chair","Clock","River","School"],
        ["Car","Bottle","Elephant","Pencil","Fan","Laptop","Monkey"],
        ["Train","Tiger","Camera","Doctor","Window","Ball","Garden"],
        ["Orange","Horse","Notebook","Television","Bridge","Shoes","Temple"],
        ["Banana","Lion","Plate","Keyboard","River","Bus","Lamp"],
    ],
    Hard: [
        ["Apple","Book","Dog","Chair","Clock","River","School","Laptop","Monkey","Temple"],
        ["Car","Bottle","Elephant","Pencil","Fan","Train","Camera","Garden","Shoes","Bridge"],
        ["Tiger","Doctor","Window","Ball","Orange","Horse","Notebook","Keyboard","River","Laptop"],
        ["Lion","Plate","Bus","Rabbit","Phone","Monkey","Lamp","Temple","Apple","Peacock"],
    ],
};

const OBJECT_ICONS = {
    Apple:"🍎",Book:"📚",Dog:"🐕",Chair:"🪑",Clock:"⏰",Car:"🚗",Bottle:"🍶",
    Elephant:"🐘",Pencil:"✏️",Fan:"🌀",Tree:"🌳",Laptop:"💻",Monkey:"🐒",
    Spoon:"🥄",Phone:"📱",Train:"🚂",River:"🌊",Tiger:"🐯",Table:"🪑",
    Camera:"📷",Doctor:"👨‍⚕️",School:"🏫",Rabbit:"🐇",Window:"🪟",Ball:"⚽",
    Orange:"🍊",Horse:"🐴",Notebook:"📓",Cup:"☕",Television:"📺",Banana:"🍌",
    Lion:"🦁",Plate:"🍽",Keyboard:"⌨️",Bridge:"🌉",Bus:"🚌",Parrot:"🦜",
    Door:"🚪",Shoes:"👟",Mango:"🥭",Cow:"🐄",Lamp:"💡",Bag:"👜",Garden:"🌸",
    Pen:"✒️",Mountain:"⛰️",Temple:"🏛",Drum:"🥁",Peacock:"🦚",
};

const DISPLAY_TIME = { Easy: 10000, Medium: 8000, Hard: 6000 };

export default function RecallChallenge() {
    const [difficulty,  setDifficulty]  = useState("Easy");
    const [objects,     setObjects]     = useState([]);
    const [phase,       setPhase]       = useState("select");
    const [transcript,  setTranscript]  = useState("");
    const [result,      setResult]      = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft,    setTimeLeft]    = useState(0);
    const recognitionRef = useRef(null);
    const timerRef       = useRef(null);
    const transcriptRef  = useRef(""); // fix stale closure

    const startChallenge = () => {
        const pool     = objectPools[difficulty];
        const selected = pool[Math.floor(Math.random() * pool.length)];
        setObjects(selected);
        setResult(null);
        setTranscript("");
        transcriptRef.current = "";
        const secs = DISPLAY_TIME[difficulty] / 1000;
        setTimeLeft(secs);
        setPhase("memorize");

        // Countdown
        let remaining = secs;
        timerRef.current = setInterval(() => {
            remaining -= 1;
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current);
                setPhase("recall");
            }
        }, 1000);
    };

    const startRecording = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Speech recognition is not supported in this browser. Please use Chrome."); return; }
        const recog = new SR();
        recognitionRef.current = recog;
        recog.continuous     = true;
        recog.interimResults = true;
        recog.lang           = "en-IN";
        recog.onstart        = () => setIsRecording(true);
        recog.onend          = () => setIsRecording(false);
        recog.onerror        = (e) => console.error("Speech error:", e.error);
        recog.onresult       = (event) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript + " ";
            }
            transcriptRef.current = text;
            setTranscript(text);
        };
        recog.start();
    }, []);

    const stopAndSubmit = useCallback(async () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
        // Use ref — avoids stale closure bug where transcript state is empty
        const finalTranscript = transcriptRef.current;
        try {
            const res = await api.post("/recall/score", {
                objects,
                transcript: finalTranscript,
                email:      localStorage.getItem("userEmail"),
                difficulty,
            });
            setResult(res.data);
            setPhase("result");
        } catch (err) {
            console.error(err);
            alert("Could not save results. Please check your connection.");
        }
    }, [objects, difficulty]);

    const pct = DISPLAY_TIME[difficulty] / 1000 > 0
        ? Math.round((timeLeft / (DISPLAY_TIME[difficulty] / 1000)) * 100)
        : 0;

    return (
        <div className="challenge-page">
            <div className="challenge-header">
                <span className="challenge-zone-badge zone-forest">🌲 Memory Forest</span>
                <h1 className="rpg-title">Recall Challenge</h1>
                <p className="rpg-subtitle" style={{ marginBottom:0 }}>
                    Memorize the ancient artifacts, then speak their names
                </p>
            </div>

            {/* SELECT */}
            {phase === "select" && (
                <div className="challenge-card">
                    <p className="rpg-label" style={{ marginBottom:"12px" }}>Choose Quest Difficulty</p>
                    <div className="difficulty-group">
                        {["Easy","Medium","Hard"].map(d => (
                            <button key={d}
                                className={`difficulty-btn difficulty-${d.toLowerCase()} ${difficulty===d?"selected":""}`}
                                onClick={() => setDifficulty(d)}>
                                {d==="Easy"?"🌿":d==="Medium"?"⚔":"💀"} {d}
                            </button>
                        ))}
                    </div>
                    <div className="rpg-divider">◆</div>
                    <p style={{ textAlign:"center", color:"rgba(245,230,200,0.6)", fontFamily:"var(--font-body)", fontStyle:"italic", fontSize:"0.9rem" }}>
                        {difficulty==="Easy" && "5 artifacts · 10 seconds to study"}
                        {difficulty==="Medium" && "7 artifacts · 8 seconds to study"}
                        {difficulty==="Hard" && "10 artifacts · 6 seconds to study"}
                    </p>
                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-emerald" onClick={startChallenge}>
                            🌲 Enter the Forest
                        </button>
                    </div>
                </div>
            )}

            {/* MEMORIZE */}
            {phase === "memorize" && (
                <div className="challenge-card">
                    <div style={{ display:"flex", alignItems:"center", gap:"20px", padding:"12px 16px", background:"rgba(0,0,0,0.3)", borderRadius:"var(--radius-md)", border:"1px solid rgba(201,162,39,0.2)" }}>
                        <div className={`timer-circle ${timeLeft<=3?"timer-warning":""}`} style={{"--pct": pct}}>
                            <div className="timer-circle-inner">
                                <span className="timer-value">{timeLeft}</span>
                                <span className="timer-unit">sec</span>
                            </div>
                        </div>
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"4px" }}>⏳ Memorize These Artifacts</p>
                            <p style={{ fontFamily:"var(--font-body)", fontStyle:"italic", color:"rgba(245,230,200,0.55)", fontSize:"0.85rem" }}>
                                They will vanish when time runs out
                            </p>
                        </div>
                    </div>
                    <div className="memory-grid">
                        {objects.map((item, i) => (
                            <div className="memory-card" key={i} style={{ animationDelay:`${i*0.05}s` }}>
                                <span className="memory-card-icon">{OBJECT_ICONS[item] || "❓"}</span>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* RECALL */}
            {phase === "recall" && (
                <div className="challenge-card">
                    <div className="memory-hidden-msg">
                        🌑 The artifacts have faded into shadow...<br />
                        <span style={{ fontSize:"0.85rem", opacity:0.7 }}>Speak the names you remember</span>
                    </div>
                    <div>
                        <p className="rpg-label" style={{ marginBottom:"10px" }}>Your Incantation</p>
                        <div className="rpg-transcript">{transcript}</div>
                    </div>
                    <div className="challenge-actions">
                        {!isRecording ? (
                            <button className="rpg-btn rpg-btn-gold" onClick={startRecording}>🎤 Begin Recall</button>
                        ) : (
                            <button className="rpg-btn rpg-btn-red" onClick={stopAndSubmit}>⏹ Seal the Memories</button>
                        )}
                    </div>
                    {isRecording && <div style={{ textAlign:"center" }}><span className="rpg-status rpg-status-recording">🎤 Recording</span></div>}
                </div>
            )}

            {/* RESULT */}
            {phase === "result" && result && (
                <div className="rpg-result-card rpg-animate-in">
                    <h2 className="rpg-heading" style={{ textAlign:"center" }}>✦ Memory Report ✦</h2>
                    <div className="rpg-result-grid">
                        <div className="rpg-stat">
                            <span className="rpg-stat-value">{result.score}</span>
                            <span className="rpg-stat-label">Score</span>
                        </div>
                        <div className="rpg-stat">
                            <span className="rpg-stat-value">+{result.xp}</span>
                            <span className="rpg-stat-label">XP Earned</span>
                        </div>
                    </div>

                    {result.correct_words?.length > 0 && (
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"8px", color:"#6ee7b7" }}>✓ Recalled ({result.correct_words.length})</p>
                            <div className="rpg-word-list">
                                {result.correct_words.map((w,i) => <span key={i} className="rpg-word-chip rpg-word-chip-correct">{w}</span>)}
                            </div>
                        </div>
                    )}

                    {result.missed_words?.length > 0 && (
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"8px", color:"#fca5a5" }}>✗ Forgotten ({result.missed_words.length})</p>
                            <div className="rpg-word-list">
                                {result.missed_words.map((w,i) => <span key={i} className="rpg-word-chip rpg-word-chip-missed">{w}</span>)}
                            </div>
                        </div>
                    )}

                    <div className="xp-earned-banner">
                        <span className="xp-earned-label">XP Earned This Session</span>
                        <span className="xp-earned-val">+{result.xp}</span>
                    </div>

                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-gold" onClick={() => setPhase("select")}>⚔ Quest Again</button>
                        <button className="rpg-btn rpg-btn-ghost" onClick={() => (window.location.href="/dashboard")}>🗺 Return to Map</button>
                    </div>
                </div>
            )}
        </div>
    );
}
