import Navbar from "../components/Navbar";
import "../styles/rpg-global.css";
import "../styles/navbar.css";

export default function MainLayout({ children }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
