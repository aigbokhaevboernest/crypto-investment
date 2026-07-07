window.onerror = function (message, source, lineno, colno, error) {
  alert(`Error: ${message}\nAt: ${source}:${lineno}:${colno}`);
};
window.addEventListener("unhandledrejection", (event) => {
  alert(`Unhandled rejection: ${event.reason}`);
});

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
