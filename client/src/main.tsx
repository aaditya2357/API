import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Set default Chart.js options
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = "#64748b";
Chart.defaults.plugins.tooltip.backgroundColor = "rgba(17, 24, 39, 0.8)";
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 14 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
