import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home               from "../pages/Home";
import Login              from "../pages/Login";
import Register           from "../pages/Register";
import Dashboard          from "../pages/Dashboard";
import RecallChallenge    from "../pages/RecallChallenge";
import FluencyChallenge   from "../pages/FluencyChallenge";
import DetectiveChallenge from "../pages/DetectiveChallenge";
import VisionChallenge    from "../pages/VisionChallenge";
import History            from "../pages/History";
import NotFound           from "../pages/NotFound";

// Auth guard — redirect to login if not logged in
function Protected({ children }) {
    const email = localStorage.getItem("userEmail");
    const loc   = useLocation();
    if (!email) return <Navigate to="/login" state={{ from: loc }} replace />;
    return children;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/recall"    element={<Protected><RecallChallenge /></Protected>} />
            <Route path="/fluency"   element={<Protected><FluencyChallenge /></Protected>} />
            <Route path="/detective" element={<Protected><DetectiveChallenge /></Protected>} />
            <Route path="/vision"    element={<Protected><VisionChallenge /></Protected>} />
            <Route path="/history"   element={<Protected><History /></Protected>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
