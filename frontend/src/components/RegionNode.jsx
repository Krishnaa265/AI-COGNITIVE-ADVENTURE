import "../styles/dashboard.css";

export default function RegionNode({ icon, title, description, locked, onClick, variant }) {
    const extraClass = variant === "camp" ? " region-card-camp" : "";

    return (
        <div
            className={`region-card${extraClass}${locked ? " locked" : ""}`}
            onClick={locked ? undefined : onClick}
        >
            <span className="region-icon">{icon}</span>
            <div className="region-title">{title}</div>
            <div className="region-desc">{description}</div>
            {locked && (
                <div className="region-lock">🔒 Requires 300 XP</div>
            )}
        </div>
    );
}
