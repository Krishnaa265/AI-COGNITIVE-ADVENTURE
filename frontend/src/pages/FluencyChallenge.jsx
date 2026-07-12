import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/challenges.css";

const CATEGORIES_EN = ["Animals","Fruits","Vehicles","Colors","Professions","Sports","Countries"];
const CATEGORIES_HI = ["जानवर","फल","वाहन","रंग","पेशे","खेल","देश"];
const CAT_MAP_HI_TO_EN = {
    "जानवर":"Animals","फल":"Fruits","वाहन":"Vehicles",
    "रंग":"Colors","पेशे":"Professions","खेल":"Sports","देश":"Countries"
};

const CATEGORY_ICONS = {
    Animals:"🦁", Fruits:"🍎", Vehicles:"🚗", Colors:"🎨",
    Professions:"👨‍⚕️", Sports:"⚽", Countries:"🌍",
};

// All UI text in both languages
const T = {
    "en-IN": {
        badge:        "🌊 Language Lake",
        title:        "Verbal Fluency Challenge",
        subtitle:     "Speak freely — your words cast the spell",
        langLabel:    "Tongue of the Realm",
        hint:         "A category will be revealed by the oracle. Speak as many words as you can in 60 seconds.",
        startBtn:     "🌊 Receive the Oracle's Call",
        summoned:     "Summoned Category",
        words:        "Words",
        unique:       "Unique",
        spokenLabel:  "Spoken Words",
        startRec:     "🎤 Begin Casting",
        stopRec:      "⏹ Seal the Spell",
        recording:    "🎤 Casting Spell",
        resultTitle:  "✦ Fluency Scroll ✦",
        wordCount:    "Words Spoken",
        uniqueWords:  "Unique Words",
        catMatches:   "Category Matches",
        repetitions:  "Repetitions",
        flScore:      "Fluency Score",
        xpLabel:      "XP Earned",
        invalidLabel: "Not in category",
        validLabel:   "Valid Words",
        castAgain:    "🌊 Cast Again",
        returnMap:    "🗺 Return to Map",
    },
    "hi-IN": {
        badge:        "🌊 भाषा झील",
        title:        "मौखिक प्रवाह चुनौती",
        subtitle:     "स्वतंत्र रूप से बोलें — आपके शब्द जादू करते हैं",
        langLabel:    "राज्य की भाषा",
        hint:         "ओरेकल एक श्रेणी बताएगा। 60 सेकंड में जितने शब्द बोल सकते हैं बोलें।",
        startBtn:     "🌊 ओरेकल का संदेश पाएं",
        summoned:     "बुलाई गई श्रेणी",
        words:        "शब्द",
        unique:       "अद्वितीय",
        spokenLabel:  "बोले गए शब्द",
        startRec:     "🎤 बोलना शुरू करें",
        stopRec:      "⏹ जादू बंद करें",
        recording:    "🎤 जादू हो रहा है",
        resultTitle:  "✦ प्रवाह पत्र ✦",
        wordCount:    "बोले गए शब्द",
        uniqueWords:  "अद्वितीय शब्द",
        catMatches:   "श्रेणी मिलान",
        repetitions:  "दोहराव",
        flScore:      "प्रवाह स्कोर",
        xpLabel:      "अर्जित XP",
        invalidLabel: "श्रेणी में नहीं",
        validLabel:   "सही शब्द",
        castAgain:    "🌊 फिर से बोलें",
        returnMap:    "🗺 नक्शे पर वापस जाएं",
    }
};

// Speak the category prompt in the right language
const categoryPrompts = {
    Animals:     { "en-IN": "Name as many animals as possible",     "hi-IN": "जितने जानवरों के नाम बता सकते हैं बताइए" },
    Fruits:      { "en-IN": "Name as many fruits as possible",      "hi-IN": "जितने फलों के नाम बता सकते हैं बताइए" },
    Vehicles:    { "en-IN": "Name as many vehicles as possible",    "hi-IN": "जितने वाहनों के नाम बता सकते हैं बताइए" },
    Colors:      { "en-IN": "Name as many colors as possible",      "hi-IN": "जितने रंगों के नाम बता सकते हैं बताइए" },
    Professions: { "en-IN": "Name as many professions as possible", "hi-IN": "जितने पेशों के नाम बता सकते हैं बताइए" },
    Sports:      { "en-IN": "Name as many sports as possible",      "hi-IN": "जितने खेलों के नाम बता सकते हैं बताइए" },
    Countries:   { "en-IN": "Name as many countries as possible",   "hi-IN": "जितने देशों के नाम बता सकते हैं बताइए" },
};

export default function FluencyChallenge() {
    const [language, setLanguage]         = useState("en-IN");
    const [transcript, setTranscript]     = useState("");
    const [isRecording, setIsRecording]   = useState(false);
    const [timeLeft, setTimeLeft]         = useState(60);
    const [challengeStarted, setChallengeStarted] = useState(false);
    const [category, setCategory]         = useState("");   // always English key
    const [result, setResult]             = useState(null);
    const [phase, setPhase]               = useState("setup");
    const recognitionRef = useRef(null);

    const t    = T[language];
    const isHi = language === "hi-IN";

    const words       = transcript.split(/\s+/).filter(w => w.trim() !== "");
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const pct         = Math.round((timeLeft / 60) * 100);

    useEffect(() => {
        if (!challengeStarted || !isRecording) return;
        if (timeLeft <= 0) { stopRecording(); return; }
        const timer = setTimeout(() => setTimeLeft(p => p - 1), 1000);
        return () => clearTimeout(timer);
    }, [challengeStarted, isRecording, timeLeft]);

    const speak = (text) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = language;
        speechSynthesis.speak(u);
    };

    const handleStartChallenge = () => {
        // Pick random English category key
        const cats = CATEGORIES_EN;
        const selected = cats[Math.floor(Math.random() * cats.length)];
        setCategory(selected);
        speak(categoryPrompts[selected][language]);
        setPhase("active");
    };

    const startRecording = () => {
        setTranscript("");
        setResult(null);
        setTimeLeft(60);
        setChallengeStarted(true);
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Speech Recognition not supported"); return; }
        const recog = new SR();
        recognitionRef.current = recog;
        recog.lang           = language;
        recog.continuous     = true;
        recog.interimResults = true;
        recog.onstart        = () => setIsRecording(true);
        recog.onend          = () => setIsRecording(false);
        recog.onerror        = (e) => console.log(e.error);
        recog.onresult       = (event) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript + " ";
            }
            setTranscript(text);
        };
        recog.start();
    };

    const stopRecording = async () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
        try {
            const res = await api.post("/fluency/score", {
                transcript,
                email:    localStorage.getItem("userEmail"),
                language,
                category, // always English key — backend maps to correct set
            });
            setResult(res.data);
            setPhase("result");
        } catch (err) {
            console.log(err);
        }
    };

    const reset = () => {
        setPhase("setup");
        setCategory("");
        setTranscript("");
        setResult(null);
        setTimeLeft(60);
        setChallengeStarted(false);
        setIsRecording(false);
    };

    // Display category name in correct language
    const categoryDisplay = isHi && category
        ? CATEGORIES_HI[CATEGORIES_EN.indexOf(category)]
        : category;

    return (
        <div className="challenge-page">
            <div className="challenge-header">
                <span className="challenge-zone-badge zone-lake">{t.badge}</span>
                <h1 className="rpg-title">{t.title}</h1>
                <p className="rpg-subtitle" style={{ marginBottom: 0 }}>{t.subtitle}</p>
            </div>

            {/* ── Setup ── */}
            {phase === "setup" && (
                <div className="challenge-card">
                    <div>
                        <p className="rpg-label" style={{ marginBottom: "12px" }}>{t.langLabel}</p>
                        <div className="lang-toggle">
                            <button className={`lang-toggle-btn ${language === "en-IN" ? "active" : ""}`} onClick={() => setLanguage("en-IN")}>
                                🇬🇧 English
                            </button>
                            <button className={`lang-toggle-btn ${language === "hi-IN" ? "active" : ""}`} onClick={() => setLanguage("hi-IN")}>
                                🇮🇳 हिंदी
                            </button>
                        </div>
                    </div>
                    <div className="rpg-divider">◆</div>
                    <div style={{ textAlign:"center", color:"rgba(245,230,200,0.6)", fontFamily:"var(--font-body)", fontStyle:"italic", fontSize:"0.9rem" }}>
                        {t.hint}
                    </div>
                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-gold" onClick={handleStartChallenge}>
                            {t.startBtn}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Active ── */}
            {phase === "active" && (
                <div className="challenge-card">
                    {category && (
                        <div className="category-banner">
                            <div className="category-banner-label">{t.summoned}</div>
                            <div className="category-banner-name">
                                {CATEGORY_ICONS[category]} {categoryDisplay}
                            </div>
                        </div>
                    )}
                    <div className="timer-display">
                        <div className={`timer-circle ${timeLeft <= 10 ? "timer-warning" : ""}`} style={{ "--pct": pct }}>
                            <div className="timer-circle-inner">
                                <span className="timer-value">{timeLeft}</span>
                                <span className="timer-unit">sec</span>
                            </div>
                        </div>
                        <div className="timer-stats">
                            <div className="rpg-stat">
                                <span className="rpg-stat-value">{words.length}</span>
                                <span className="rpg-stat-label">{t.words}</span>
                            </div>
                            <div className="rpg-stat">
                                <span className="rpg-stat-value">{uniqueWords.size}</span>
                                <span className="rpg-stat-label">{t.unique}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="rpg-label" style={{ marginBottom:"10px" }}>{t.spokenLabel}</p>
                        <div className="rpg-transcript">{transcript}</div>
                    </div>
                    <div className="challenge-actions">
                        {!isRecording ? (
                            <button className="rpg-btn rpg-btn-gold" onClick={startRecording}>{t.startRec}</button>
                        ) : (
                            <button className="rpg-btn rpg-btn-red" onClick={stopRecording}>{t.stopRec}</button>
                        )}
                    </div>
                    {isRecording && (
                        <div style={{ textAlign:"center" }}>
                            <span className="rpg-status rpg-status-recording">{t.recording}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Result ── */}
            {phase === "result" && result && (
                <div className="cognitive-report rpg-animate-in">
                    <h2 className="rpg-heading" style={{ textAlign:"center" }}>{t.resultTitle}</h2>

                    <div className="cognitive-score-grid">
                        {[
                            { label: t.wordCount,   val: result.word_count },
                            { label: t.uniqueWords, val: result.unique_words },
                            { label: t.catMatches,  val: result.category_matches },
                            { label: t.repetitions, val: result.repetitions },
                        ].map(item => (
                            <div className="cognitive-score-item" key={item.label}>
                                <span className="cognitive-score-label">{item.label}</span>
                                <span className="cognitive-score-val">{item.val}</span>
                            </div>
                        ))}
                    </div>

                    <div className="rpg-result-row">
                        <span className="rpg-result-key">{t.flScore}</span>
                        <span className="rpg-result-val">{result.fluency_score}</span>
                    </div>

                    {/* valid words */}
                    {result.valid_words?.length > 0 && (
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"8px", color:"#6ee7b7" }}>{t.validLabel} ({result.valid_words.length})</p>
                            <div className="rpg-word-list">
                                {result.valid_words.map((w, i) => (
                                    <span key={i} className="rpg-word-chip rpg-word-chip-correct">{w}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* invalid words */}
                    {result.invalid_words?.length > 0 && (
                        <div>
                            <p className="rpg-label" style={{ marginBottom:"8px", color:"rgba(245,230,200,0.5)" }}>{t.invalidLabel} ({result.invalid_words.length})</p>
                            <div className="rpg-word-list">
                                {result.invalid_words.map((w, i) => (
                                    <span key={i} className="rpg-word-chip" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(245,230,200,0.15)", color:"rgba(245,230,200,0.4)" }}>{w}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* XP banner — uses result.xp (alias added in backend) */}
                    <div className="xp-earned-banner">
                        <span className="xp-earned-label">{t.xpLabel}</span>
                        <span className="xp-earned-val">+{result.xp ?? result.xp_earned ?? 0}</span>
                    </div>

                    <div className="challenge-actions">
                        <button className="rpg-btn rpg-btn-gold" onClick={reset}>{t.castAgain}</button>
                        <button className="rpg-btn rpg-btn-ghost" onClick={() => (window.location.href = "/dashboard")}>{t.returnMap}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
