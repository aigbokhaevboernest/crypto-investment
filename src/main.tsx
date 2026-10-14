import "./lib/google-translate-dom-patch";
import "./google-translate.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
