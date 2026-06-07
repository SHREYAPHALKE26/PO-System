// src/theme.js
const theme = {
  colors: {
    primary: "#000000ff",
    primaryDark: "#7c3aed",
    secondary: "#a855f7",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    backgroundGradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #7c3aed 50%, #6366f1 100%)",
    cardBackground: "rgba(255, 255, 255, 0.95)",
    inputBackground: "#ffffffff",
    textPrimary: "#374151",
    textSecondary: "#6b7280",

   
    success: "#16a34a",
    successBg: "#dcfce7",
    successBorder: "#86efac",

    error: "#dc2626",
    errorBg: "#fee2e2",
    errorBorder: "#fca5a5",

    warning: "#ca8a04",
    warningBg: "#fef9c3",
    warningBorder: "#fde047",
  },


  
  fonts: {
    primary: "'Inter', sans-serif",
    secondary: "'Roboto', sans-serif",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.75rem",
    lg: "1.5rem",
    full: "9999px",
  },
  shadows: {
    card: "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2)",
    button: "0 10px 20px rgba(139, 92, 246, 0.3)",
  },
  animations: {
    pulse: "pulse 3s ease-in-out infinite",
    spin: "spin 1s linear infinite",
  },
};

export default theme;
