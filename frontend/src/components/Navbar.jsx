import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
    const loc      = useLocation();
    const navigate = useNavigate();
    const email    = localStorage.getItem("userEmail");
    const active   = (path) => loc.pathname === path ? "active" : "";

    const logout = () => {
        localStorage.removeItem("userEmail");
        navigate("/");
    };

    return (
        <nav className="rpg-navbar">
            <Link to="/" className="rpg-navbar-brand">
                <span className="rpg-navbar-rune">🔮</span>
                <span className="rpg-navbar-title">AI Cognitive<br />Adventure</span>
            </Link>

            <ul className="rpg-navbar-links">
                <li><Link to="/" className={active("/")}>🏠 Realm</Link></li>
                <span className="rpg-navbar-sep">◆</span>
                {email ? (
                    <>
                        <li><Link to="/dashboard" className={active("/dashboard")}>🗺 Map</Link></li>
                        <span className="rpg-navbar-sep">◆</span>
                        <li><Link to="/history" className={active("/history")}>📜 History</Link></li>
                        <span className="rpg-navbar-sep">◆</span>
                        <li><button onClick={logout} className="rpg-navbar-logout">🚪 Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login"    className={active("/login")}>⚔ Login</Link></li>
                        <span className="rpg-navbar-sep">◆</span>
                        <li><Link to="/register" className={active("/register")}>📜 Enroll</Link></li>
                    </>
                )}
            </ul>

            <div className="rpg-navbar-right">
                {email && <span className="rpg-navbar-crown" title="Logged in">👑</span>}
            </div>
        </nav>
    );
}
