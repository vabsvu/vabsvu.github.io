import React from "react";
import { motion } from "framer-motion";
import HennaPatterns from "./HennaPatterns";

export const AnimatedHolud = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="relative overflow-hidden w-full h-full">
      <div className="relative h-full rounded-lg">
        {/* Rich animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#8B2B0D] via-[#D4AF37] to-[#8B2B0D]"
          animate={{
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Animated Henna Patterns */}
        <HennaPatterns />

        {/* Animated noise overlay */}
        <motion.div
          className="absolute inset-0 mix-blend-overlay opacity-50"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="relative z-10 h-full p-4"
        >
          {/* Main content container */}
          <div className="flex flex-col">
            {/* Top row: Title and Free Henna */}
            <div className="flex justify-between items-start mb-1 w-full">
              {/* Holud Night - Positioned left */}
              <motion.div variants={item} className="flex flex-col -space-y-2">
                <span
                  className="text-5xl sm:text-6xl md:text-7xl font-quattrocento font-bold"
                  style={{
                    color: "#FFD700",
                    textShadow:
                      "2px 2px 0px rgba(0,0,0,0.5), -1px -1px 0px rgba(139,43,13,0.8)",
                  }}
                >
                  Holud
                </span>
                <span
                  className="text-5xl sm:text-6xl md:text-7xl font-quattrocento font-bold"
                  style={{
                    color: "#FFD700",
                    textShadow:
                      "2px 2px 0px rgba(0,0,0,0.5), -1px -1px 0px rgba(139,43,13,0.8)",
                  }}
                >
                  Night
                </span>
              </motion.div>

              {/* Right column: Free Henna and Time */}
              <div className="flex flex-col items-end space-y-4 ml-4 pr-2">
                <motion.div
                  variants={item}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-instrumentSerif italic"
                  style={{
                    color: "#760000",
                    textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
                  }}
                >
                  (Get Your Henna!)
                </motion.div>
                <motion.div
                  variants={item}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-quattrocento font-bold"
                  style={{
                    color: "#000",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  7:30-9:30 PM
                </motion.div>
              </div>
            </div>

            {/* Venue and Date */}
            <motion.div variants={item} className="mt-auto text-center">
              <span
                className="text-xl sm:text-2xl font-instrumentSerif font-bold"
                style={{
                  color: "#FFFFFF",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                Multicultural Community Space (1/9)
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedHolud;