/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
        marqueeReverse: "marqueeReverse 25s linear infinite", // New reverse marquee animation
        marqueeReverse2: "marqueeReverse2 25s linear infinite", // New reverse marquee animation
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
          // Keyframes for reverse marquee
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
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
