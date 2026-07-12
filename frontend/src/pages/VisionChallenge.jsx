import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/challenges.css";
import "../styles/vision.css";

const PHASES = {
    SETUP:      "setup",
    LOADING:    "loading",
    MEMORIZE:   "memorize",
    RECALL:     "recall",
    EVALUATING: "evaluating",
    RESULT:     "result",
};

// UI text for both languages
const UI_TEXT = {
    "en-IN": {
        badge:         "🏛️ Wisdom Temple",
        title:         "Vision Challenge",
        subtitle:      "Study the sacred image · Name what you see",
        howTitle:      "✦ How the Trial Works ✦",
        step1Title:    "Study the Scroll",
        step1Desc:     "A sacred image appears for 30 seconds. Observe everything.",
        step2Title:    "Speak the Vision",
        step2Desc:     "Name every object you remember seeing. Partial names count too.",
        step3Title:    "Receive Judgment",
        currentRate:   "⚡ Current Rate",
        nextSession:   "Next session:",
        masterRate:    "✦ Master Rate (minimum reached)",
        beginTrial:    "🏛️ Begin the Trial",
        returnMap:     "🗺 Return to Map",
        studyDetail:   "Study Every Detail",
        studyHint:     "The image will vanish when time runs out. Note everything you can see.",
        sealedMsg:     "The image has been sealed by the temple guardians...",
        sealedHint:    "Speak every object you remember — partial names count!",
        spokenLabel:   "Your Spoken Observations",
        beginSpeak:    "🎤 Begin Speaking",
        stopRec:       "⏹ Stop Recording",
        submit:        "⚖ Submit to the Temple",
        recording:     "🎤 Recording",
        judging:       "The Temple Sages are Judging...",
        verdict:       "Temple Verdict",
        session:       "Session",
        itemsFound:    "Items Found",
        xpEarned:      "XP Earned",
        correctLabel:  "✓ Correctly Identified",
        wrongLabel:    "ℹ Not found in image — no penalty",
        revealBtn:     "👁 Reveal All Objects in Image",
        hideBtn:       "🙈 Hide All Objects",
        xpBanner:      "XP Earned This Session",
        newTrial:      "🏛️ New Trial",
        decreases:     "Rate decreases as you gain experience",
        masterMsg:     "✦ You've reached Master Rate",
        loadingImg:    "Summoning the Sacred Image...",
    },
    "hi-IN": {
        badge:         "🏛️ ज्ञान मंदिर",
        title:         "दृष्टि चुनौती",
        subtitle:      "पवित्र छवि का अध्ययन करें · जो दिखे वह बताएं",
        howTitle:      "✦ परीक्षा कैसे काम करती है ✦",
        step1Title:    "छवि देखें",
        step1Desc:     "30 सेकंड के लिए एक पवित्र छवि दिखाई जाएगी। सब कुछ ध्यान से देखें।",
        step2Title:    "दृष्टि बोलें",
        step2Desc:     "जो भी याद हो वो बोलें — आधे नाम भी मान्य हैं।",
        step3Title:    "निर्णय पाएं",
        currentRate:   "⚡ वर्तमान दर",
        nextSession:   "अगला सत्र:",
        masterRate:    "✦ मास्टर दर (न्यूनतम पहुंच गई)",
        beginTrial:    "🏛️ परीक्षा शुरू करें",
        returnMap:     "🗺 नक्शे पर वापस जाएं",
        studyDetail:   "हर विवरण देखें",
        studyHint:     "समय समाप्त होने पर छवि गायब हो जाएगी। सब कुछ नोट करें।",
        sealedMsg:     "छवि मंदिर के रक्षकों द्वारा बंद कर दी गई है...",
        sealedHint:    "जो भी याद हो वो बोलें — आधे नाम भी मान्य हैं!",
        spokenLabel:   "आपके बोले गए शब्द",
        beginSpeak:    "🎤 बोलना शुरू करें",
        stopRec:       "⏹ रिकॉर्डिंग बंद करें",
        submit:        "⚖ मंदिर में जमा करें",
        recording:     "🎤 रिकॉर्डिंग हो रही है",
        judging:       "मंदिर के ऋषि निर्णय कर रहे हैं...",
        verdict:       "मंदिर का निर्णय",
        session:       "सत्र",
        itemsFound:    "वस्तुएं मिलीं",
        xpEarned:      "XP अर्जित",
        correctLabel:  "✓ सही पहचाना गया",
        wrongLabel:    "ℹ छवि में नहीं मिला — कोई दंड नहीं",
        revealBtn:     "👁 सभी वस्तुएं दिखाएं",
        hideBtn:       "🙈 सभी वस्तुएं छुपाएं",
        xpBanner:      "इस सत्र में अर्जित XP",
        newTrial:      "🏛️ नई परीक्षा",
        decreases:     "अनुभव बढ़ने पर दर घटती है",
        masterMsg:     "✦ आप मास्टर दर पर पहुंच गए",
        loadingImg:    "पवित्र छवि बुलाई जा रही है...",
    },
};

export default function VisionChallenge() {
    const [phase, setPhase]             = useState(PHASES.SETUP);
    const [language, setLanguage]       = useState("en-IN");
    const [imageData, setImageData]     = useState(null);
    const [timeLeft, setTimeLeft]       = useState(30);
    const [transcript, setTranscript]   = useState("");
    const [result, setResult]           = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [revealAll, setRevealAll]     = useState(false);
    const [xpRate, setXpRate]           = useState(null);
    const recognitionRef = useRef(null);
    const timerRef       = useRef(null);

    const t = UI_TEXT[language]; // shorthand for current language text

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) return;
        api.get(`/vision/xp-rate/${email}`)
            .then(res => setXpRate(res.data))
            .catch(() => {});
    }, []);

    // Countdown timer
    useEffect(() => {
        if (phase !== PHASES.MEMORIZE) return;
        if (timeLeft <= 0) { setPhase(PHASES.RECALL); return; }
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [phase, timeLeft]);

    const fetchImage = async () => {
        setPhase(PHASES.LOADING);
        try {
            const res = await api.get("/vision/image");
            setImageData(res.data);
            setTimeLeft(30);
            setTranscript("");
            setResult(null);
            setRevealAll(false);
            setPhase(PHASES.MEMORIZE);
        } catch {
            alert("Could not load image. Make sure images are in backend/app/static/vision_images/");
            setPhase(PHASES.SETUP);
        }
    };

    const startRecording = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Speech Recognition not supported in this browser."); return; }
        const recog = new SR();
        recognitionRef.current = recog;
        recog.continuous     = true;
        recog.interimResults = true;
        recog.lang           = language;           // ← uses selected language
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

    const submitRecall = async () => {
        stopRecording();
        setPhase(PHASES.EVALUATING);
        try {
            const res = await api.post("/vision/score", {
                image_name: imageData.image_name,
                transcript,
                email:    localStorage.getItem("userEmail"),
                language,                           // ← send language to backend
            });
            setResult(res.data);
            const email = localStorage.getItem("userEmail");
            api.get(`/vision/xp-rate/${email}`).then(r => setXpRate(r.data)).catch(() => {});
            setPhase(PHASES.RESULT);
        } catch (err) {
            console.error(err);
            alert("Evaluation failed. Check your backend.");
            setPhase(PHASES.RECALL);
        }
    };

    const pct = Math.round((timeLeft / 30) * 100);

    return (
        <div className="challenge-page">

            {/* ── Header ── */}
            <div className="challenge-header">
                <span className="challenge-zone-badge zone-temple">{t.badge}</span>
                <h1 className="rpg-title">{t.title}</h1>
                <p className="rpg-subtitle" style={{ marginBottom: 0 }}>{t.subtitle}</p>
            </div>

            {/* ── SETUP ── */}
            {phase === PHASES.SETUP && (
                <div className="challenge-card vision-setup-card">

                    {/* Language Toggle */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <p className="rpg-label">Language / भाषा</p>
                        <div className="lang-toggle">
                            <button
                                className={`lang-toggle-btn ${language === "en-IN" ? "active" : ""}`}
                                onClick={() => setLanguage("en-IN")}
                            >
                                🇬🇧 English
                            </button>
                            <button
                                className={`lang-toggle-btn ${language === "hi-IN" ? "active" : ""}`}
                                onClick={() => setLanguage("hi-IN")}
                            >
                                🇮🇳 हिंदी
                            </button>
                        </div>
                    </div>

                    <div className="rpg-divider">◆</div>

                    {/* How it works */}
                    <div className="vision-how-it-works">
                        <h3 className="rpg-heading" style={{ textAlign: "center" }}>{t.howTitle}</h3>
                        <div className="vision-steps">
                            <div className="vision-step">
                                <span className="vision-step-num">01</span>
                                <div>
                                    <strong>{t.step1Title}</strong>
                                    <p>{t.step1Desc}</p>
                                </div>
                            </div>
                            <div className="vision-step">
                                <span className="vision-step-num">02</span>
                                <div>
                                    <strong>{t.step2Title}</strong>
                                    <p>{t.step2Desc}</p>
                                </div>
                            </div>
                            <div className="vision-step">
                                <span className="vision-step-num">03</span>
                                <div>
                                    <strong>{t.step3Title}</strong>
                                    <p>
                                        +{xpRate?.xp_per_word ?? 10} XP {language === "hi-IN" ? "प्रति सही शब्द" : "per correct item"}
                                        {xpRate && xpRate.sessions_completed > 0 && (
                                            <span style={{ color: "#d8b4fe", marginLeft: "6px", fontSize: "0.85em" }}>
                                                ({language === "hi-IN" ? `सत्र ${xpRate.sessions_completed + 1}` : `Session ${xpRate.sessions_completed + 1}`})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Adaptive XP strip */}
                    {xpRate && (
                        <div className="vision-xp-info">
                            <span>{t.currentRate}</span>
                            <span className="vision-xp-rate">+{xpRate.xp_per_word} XP / {language === "hi-IN" ? "शब्द" : "word"}</span>
                            {xpRate.xp_per_word > 2 ? (
                                <span className="vision-xp-next">{t.nextSession} +{xpRate.next_rate}</span>
                            ) : (
                                <span className="vision-xp-next" style={{ color: "#6ee7b7" }}>{t.masterRate}</span>
                            )}
                        </div>
                    )}

                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-gold" onClick={fetchImage}>{t.beginTrial}</button>
                        <button className="rpg-btn rpg-btn-ghost" onClick={() => (window.location.href = "/dashboard")}>{t.returnMap}</button>
                    </div>
                </div>
            )}

            {/* ── LOADING ── */}
            {phase === PHASES.LOADING && (
                <div className="rpg-loading">
                    <span className="rpg-loading-rune">🏛️</span>
                    <span className="rpg-loading-text">{t.loadingImg}</span>
                </div>
            )}

            {/* ── MEMORIZE ── */}
            {phase === PHASES.MEMORIZE && imageData && (
                <div className="challenge-card vision-memorize-card">
                    <div className="vision-timer-row">
                        <div className={`timer-circle ${timeLeft <= 8 ? "timer-warning" : ""}`} style={{ "--pct": pct }}>
                            <div className="timer-circle-inner">
                                <span className="timer-value">{timeLeft}</span>
                                <span className="timer-unit">sec</span>
                            </div>
                        </div>
                        <div>
                            <p className="rpg-label" style={{ marginBottom: "6px" }}>{t.studyDetail}</p>
                            <p style={{ fontFamily:"var(--font-body)", fontStyle:"italic", color:"rgba(245,230,200,0.55)", fontSize:"0.88rem", maxWidth:"280px" }}>
                                {t.studyHint}
                            </p>
                        </div>
                    </div>
                    <div className="vision-image-frame">
                        <img src={`http://localhost:8000${imageData.image_url}`} alt="Vision challenge" className="vision-image" />
                        <div className="vision-image-vignette" />
                    </div>
                </div>
            )}

            {/* ── RECALL ── */}
            {phase === PHASES.RECALL && (
                <div className="challenge-card">
                    <div className="vision-hidden-msg">
                        <span className="vision-hidden-icon">🌑</span>
                        <p>{t.sealedMsg}</p>
                        <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>{t.sealedHint}</p>
                    </div>
                    <div>
                        <p className="rpg-label" style={{ marginBottom: "10px" }}>{t.spokenLabel}</p>
                        <div className="rpg-transcript">{transcript}</div>
                    </div>
                    <div className="challenge-actions">
                        {!isRecording ? (
                            <button className="rpg-btn rpg-btn-gold" onClick={startRecording}>{t.beginSpeak}</button>
                        ) : (
                            <button className="rpg-btn rpg-btn-red" onClick={stopRecording}>{t.stopRec}</button>
                        )}
                        <button className="rpg-btn rpg-btn-emerald" onClick={submitRecall} disabled={!transcript.trim()}>
                            {t.submit}
                        </button>
                    </div>
                    {isRecording && (
                        <div style={{ textAlign: "center" }}>
                            <span className="rpg-status rpg-status-recording">{t.recording}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ── EVALUATING ── */}
            {phase === PHASES.EVALUATING && (
                <div className="rpg-loading">
                    <span className="rpg-loading-rune">🔮</span>
                    <span className="rpg-loading-text">{t.judging}</span>
                </div>
            )}

            {/* ── RESULT ── */}
            {phase === PHASES.RESULT && result && (
                <div className="vision-result rpg-animate-in">
                    <div className="vision-result-header">
                        <span className="vision-result-icon">🏛️</span>
                        <h2 className="rpg-title" style={{ fontSize: "1.8rem" }}>{t.verdict}</h2>
                        <div className="vision-score-ring">
                            <span className="vision-score-val">{result.score}</span>
                            <span className="vision-score-label">/ 100</span>
                        </div>
                    </div>

                    <div className="vision-adaptive-badge">
                        <span>{t.session} {result.session_number}</span>
                        <span className="vision-adaptive-rate">+{result.xp_per_word} XP / {language === "hi-IN" ? "शब्द" : "word"}</span>
                        <span className="vision-adaptive-hint">
                            {result.xp_per_word > 2 ? t.decreases : t.masterMsg}
                        </span>
                    </div>

                    <div className="rpg-result-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
                        <div className="rpg-stat">
                            <span className="rpg-stat-value" style={{ color: "#6ee7b7" }}>{result.correct_count}</span>
                            <span className="rpg-stat-label">{t.itemsFound}</span>
                        </div>
                        <div className="rpg-stat">
                            <span className="rpg-stat-value">{result.xp}</span>
                            <span className="rpg-stat-label">{t.xpEarned}</span>
                        </div>
                    </div>

                    {result.feedback && (
                        <div className="vision-feedback">
                            <span className="vision-feedback-icon">📜</span>
                            <p>{result.feedback}</p>
                        </div>
                    )}

                    {result.correct_words?.length > 0 && (
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"8px", color:"#6ee7b7" }}>
                                {t.correctLabel} ({result.correct_count})
                            </p>
                            <div className="rpg-word-list">
                                {result.correct_words.map((w, i) => (
                                    <span key={i} className="rpg-word-chip rpg-word-chip-correct">{w}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.wrong_words?.length > 0 && (
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"8px", color:"rgba(245,230,200,0.5)" }}>
                                {t.wrongLabel} ({result.wrong_count})
                            </p>
                            <div className="rpg-word-list">
                                {result.wrong_words.map((w, i) => (
                                    <span key={i} className="rpg-word-chip" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(245,230,200,0.15)", color:"rgba(245,230,200,0.4)" }}>{w}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.all_objects?.length > 0 && (
                        <div>
                            <button className="rpg-btn rpg-btn-ghost" style={{ width:"100%", marginBottom:"10px" }} onClick={() => setRevealAll(v => !v)}>
                                {revealAll ? t.hideBtn : t.revealBtn}
                            </button>
                            {revealAll && (
                                <div className="rpg-word-list rpg-animate-in">
                                    {result.all_objects.map((w, i) => {
                                        const found = result.correct_words?.map(c => c.toLowerCase()).includes(w.toLowerCase());
                                        return (
                                            <span key={i} className={`rpg-word-chip ${found ? "rpg-word-chip-correct" : ""}`}
                                                style={!found ? { background:"rgba(201,162,39,0.08)", border:"1px solid rgba(201,162,39,0.2)", color:"rgba(245,230,200,0.5)" } : {}}>
                                                {w}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="xp-earned-banner">
                        <span className="xp-earned-label">{t.xpBanner}</span>
                        <span className="xp-earned-val">+{result.xp}</span>
                    </div>

                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-gold" onClick={fetchImage}>{t.newTrial}</button>
                        <button className="rpg-btn rpg-btn-ghost" onClick={() => (window.location.href = "/dashboard")}>{t.returnMap}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
