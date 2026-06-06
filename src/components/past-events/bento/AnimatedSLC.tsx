import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useIsVisible } from "../../../hooks/useIsVisible";

export const AnimatedSLC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref);

  // Fast entrance (~0.4s settle) — the loose 0.15s stagger + slow spring
  // were leftovers from the splash-screen era and made the card feel laggy.
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 24,
      },
    },
  };

  return (
    <div ref={ref} className="relative overflow-hidden -translate-y-5">
      {/* Main content container */}
      <div className="relative h-full">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="h-full w-full relative group rounded-lg"
        >
          {/* Enhanced layered background effects */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#992b0d] via-[#d8b148] to-[#992b0d] opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg"
            animate={
              isVisible
                ? {
                    background: [
                      "radial-gradient(circle at 0% 0%, #992b0d44, #d8b14844, #992b0d44)",
                      "radial-gradient(circle at 100% 100%, #992b0d44, #d8b14844, #992b0d44)",
                      "radial-gradient(circle at 0% 0%, #992b0d44, #d8b14844, #992b0d44)",
                    ],
                  }
                : undefined
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg"
            animate={isVisible ? { x: ["-200%", "200%"] } : undefined}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Content container with enhanced padding and layout */}
          <div className="relative z-10 flex flex-col justify-center items-center p-6 md:p-8">
            {/* Venue name with enhanced styling */}
            <motion.div
              variants={item}
              className="text-4xl sm:text-5xl md:text-6xl font-quattrocento font-black mb-4 md:mb-6 tracking-wide"
              style={{
                WebkitTextStroke: "1px #992b0d",
                textShadow:
                  "3px 3px 0 #992b0d, -1px -1px 0 #992b0d, 1px -1px 0 #992b0d, -1px 1px 0 #992b0d, 1px 1px 0 #992b0d",
              }}
            >
              <span className="text-[#ecc078] hover:text-white transition-colors duration-300">
                SLC Ballroom
              </span>
            </motion.div>

            {/* Date with enhanced styling */}
            <motion.div
              variants={item}
              className="text-3xl font-black sm:text-4xl md:text-5xl font-playfair  mb-3 md:mb-4"
              style={{
                WebkitTextStroke: "1px #d8b148",
              }}
            >
              <span className="text-white hover:text-[#e2d57e] transition-colors duration-300">
                January 10th, 2025
              </span>
            </motion.div>

            {/* Time with decorative elements */}
            <motion.div
              variants={item}
              className="flex font-black stroke-black items-center gap-3 text-2xl md:text-3xl text-carmine font-quattrocento"
            >
              <span className="text-carmine">&#10023;</span>
              7:00 PM
              <span className="text-carmine">&#10023;</span>
            </motion.div>
          </div>

          {/* Reduced floating decorative elements (4 instead of 10) */}
          {isVisible &&
            [...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#ecc078" : "#e2d57e",
                  filter: "blur(2px)",
                  boxShadow: "0 0 12px rgba(236,192,120,0.5)",
                }}
                animate={{
                  y: [-20, -40, -20],
                  x: [-10, 10, -10],
                  opacity: [0, 1, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                initial={{
                  left: `${15 + i * 20}%`,
                  bottom: "15%",
                }}
              />
            ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedSLC;
