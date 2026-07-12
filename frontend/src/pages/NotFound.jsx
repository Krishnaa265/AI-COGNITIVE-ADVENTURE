import { useNavigate } from "react-router-dom";
import "../styles/rpg-global.css";
import "../styles/auth.css";

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight:"calc(100vh - 70px)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"24px", textAlign:"center", padding:"40px 24px" }}>
            <span style={{ fontSize:"5rem", filter:"drop-shadow(0 0 20px rgba(201,162,39,0.5))" }}>🗺️</span>
            <h1 className="rpg-title">Lost in the Realm</h1>
            <p style={{ fontFamily:"var(--font-body)", fontStyle:"italic", color:"rgba(245,230,200,0.55)", maxWidth:"360px", lineHeight:1.8 }}>
                The path you seek does not exist in these lands. Perhaps the ancient maps were wrong.
            </p>
            <button className="rpg-btn rpg-btn-gold" onClick={() => navigate("/")}>
                🏠 Return to the Realm
            </button>
        </div>
    );
}
