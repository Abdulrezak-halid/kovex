import { createRoot } from "react-dom/client";
import CApp from "./CApp";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(<CApp />);
