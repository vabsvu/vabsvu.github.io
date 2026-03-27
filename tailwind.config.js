/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
        marqueeReverse: "marqueeReverse 25s linear infinite", // New reverse marquee animation
        marqueeReverse2: "marqueeReverse2 25s linear infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "pulse-line": "pulse-line 2s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        marqueeReverse: {
          // Keyframes for reverse marquee
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        marqueeReverse2: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
        },
        "pulse-line": {
          "0%, 100%": { transform: "scaleX(1)", opacity: "0.5" },
          "50%": { transform: "scaleX(1.2)", opacity: "1" },
        },
      },
      colors: {
        tyrian: "#460b2f",
        carmine: "#9a031e",
        spanish: "#e36414",
        gold: "#bf9b30",
        almond: "#eae0d5",
      },
      fontFamily: {
        quattrocento: ["Quattrocento", "serif"],
        anonymous: ["Anonymous Pro", "monospace"],
        marker: ["Permanent Marker", "cursive"],
        playfair: ["Playfair Display", "serif"],
        instrumentSerif: ["Instrument Serif", "serif"],
      },
    },
  },
  plugins: [],
};
