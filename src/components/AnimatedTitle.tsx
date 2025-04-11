import React from "react";
import { motion } from "framer-motion";

export function AnimatedTitle() {
  return (
    <div className="relative w-full overflow-hidden pb-4">
      {/* Fluid background effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-gold/30 via-gold/20 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(227,100,20,0.25),_transparent_60%)]"
          animate={{
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Presentation text */}
      <motion.div
        className="relative z-10 text-center mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p className="text-sm md:text-lg font-quattrocento text-[#e2d57e] tracking-wider">
          Presented by Vanderbilt University South Asian Organizations
        </p>
      </motion.div>

      {/* Main title with optimized responsive layout */}
      <motion.div
        className="relative z-10 text-center md:pt-6 pb-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative">
          {/* Mobile stacked title */}
          <div className="md:hidden">
            <motion.h1
              className="text-6xl sm:text-7xl font-quattrocento font-bold flex flex-col items-center gap-1"
              style={{
                background: "linear-gradient(90deg, #bf9b30, #e36414, #bf9b30)",
                backgroundSize: "200% auto",
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                textShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
              animate={{
                backgroundPosition: ["0% center", "200% center"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <span>Mock</span>
              <span>Shaadi</span>
            </motion.h1>
          </div>

          {/* Desktop title */}
          <motion.h1
            className="hidden md:block text-8xl font-quattrocento font-bold"
            style={{
              background: "linear-gradient(90deg, #bf9b30, #e36414, #bf9b30)",
              backgroundSize: "200% auto",
              color: "transparent",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              textShadow: "0px 2px 4px rgba(0,0,0,0.2)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
            animate={{
              backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            Mock Shaadi
          </motion.h1>

          {/* Year with enhanced visibility */}
          <motion.div
            className="mt-2 md:mt-4"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <h2
              className="text-4xl sm:text-5xl md:text-4xl text-almond font-quattrocento font-bold"
              style={{
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              2025
            </h2>
          </motion.div>

          {/* Responsive decorative elements */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mt-4 md:mt-6">
            <motion.div
              className="h-px w-12 sm:w-16 md:w-32"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #bf9b30, transparent)",
                boxShadow: "0 0 8px rgba(191,155,48,0.3)",
              }}
              animate={{
                scaleX: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-spanish"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-px w-12 sm:w-16 md:w-32"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #bf9b30, transparent)",
                boxShadow: "0 0 8px rgba(191,155,48,0.3)",
              }}
              animate={{
                scaleX: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
