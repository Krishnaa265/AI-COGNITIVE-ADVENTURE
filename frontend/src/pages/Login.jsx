import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/rpg-global.css";
import "../styles/auth.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("userEmail", email);
            // Small delay so the loading state is visible
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 400);
        } catch (err) {
            setError("The guild records do not match. Check your scroll and try again.");
            setLoading(false);
        }
    };

    const handleKey = (e) => { if (e.key === "Enter") submit(); };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Corner ornaments */}
                <div className="auth-card-corner auth-card-corner-tl" />
                <div className="auth-card-corner auth-card-corner-tr" />
                <div className="auth-card-corner auth-card-corner-bl" />
                <div className="auth-card-corner auth-card-corner-br" />

                <span className="auth-icon">⚔️</span>

                <h1 className="rpg-title" style={{ fontSize: "1.7rem" }}>
                    Enter the Realm
                </h1>
                <p className="rpg-subtitle" style={{ marginBottom: "24px" }}>
                    Present your guild credentials
                </p>

                {error && <div className="auth-error">{error}</div>}

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
                        placeholder="••••••••"
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
                    {loading ? "⏳ Entering..." : "⚔ Enter Realm"}
                </button>

                <div className="auth-footer-link">
                    New adventurer?{" "}
                    <Link to="/register">Enroll in the Guild</Link>
                </div>
            </div>
        </div>
    );
}
