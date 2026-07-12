import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/auth.css";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/register", { username, email, password });
            setTimeout(() => {
                window.location.href = "/login";
            }, 400);
        } catch (err) {
            setError("The guild scribes could not complete your enrollment. Try again.");
            setLoading(false);
        }
    };

    const handleKey = (e) => { if (e.key === "Enter") submit(); };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card-corner auth-card-corner-tl" />
                <div className="auth-card-corner auth-card-corner-tr" />
                <div className="auth-card-corner auth-card-corner-bl" />
                <div className="auth-card-corner auth-card-corner-br" />

                <span className="auth-icon">📜</span>

                <h1 className="rpg-title" style={{ fontSize: "1.7rem" }}>
                    Guild Enrollment
                </h1>
                <p className="rpg-subtitle" style={{ marginBottom: "24px" }}>
                    Forge your adventurer identity
                </p>

                {error && <div className="auth-error">{error}</div>}

                <div className="rpg-input-group">
                    <label className="rpg-label">Adventurer Name</label>
                    <input
                        className="rpg-input"
                        placeholder="Choose your hero name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKey}
                    />
                </div>

                <div className="rpg-input-group">
                    <label className="rpg-label">Scroll of Identity (Email)</label>
                    <input
                        className="rpg-input"
                        placeholder="your@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKey}
                    />
                </div>

                <div className="rpg-input-group">
                    <label className="rpg-label">Secret Incantation (Password)</label>
                    <input
                        className="rpg-input"
                        type="password"
                        placeholder="Create a strong spell"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKey}
                    />
                </div>

                <button
                    className="rpg-btn rpg-btn-gold"
                    style={{ width: "100%", marginTop: "8px" }}
                    onClick={submit}
                    disabled={loading}
                >
                    {loading ? "⏳ Enrolling..." : "📜 Join the Guild"}
                </button>

                <div className="auth-footer-link">
                    Already an adventurer?{" "}
                    <Link to="/login">Enter the Realm</Link>
                </div>
            </div>
        </div>
    );
}
