import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";
import { BentoGrid } from "./BentoGrid";
import { OrgHeader } from "./orgs/OrgHeader";
import AnimatedBorder from "./AnimatedBorder";
import OrgShowcase from "./OrgShowcase";

const OpeningSequence = () => {
  const [showOpening, setShowOpening] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Lock scroll initially
    document.body.style.overflow = "hidden";

    const openingTimer = setTimeout(() => {
      setShowOpening(false);

      // Add delay before showing main content
      const contentTimer = setTimeout(() => {
        setShowContent(true);
        // Unlock scroll after content appears
        document.body.style.overflow = "auto";
      }, 1500); // Increased delay for better transition

      return () => clearTimeout(contentTimer);
    }, 4000); // Increased initial delay to see opening animation

    return () => {
      clearTimeout(openingTimer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatedBorder
      className="min-h-screen bg-gradient-to-br from-[#992b0d] via-[#761f0a] to-[#4d1405] relative overflow-hidden"
      isMainContentVisible={showContent}
    >
      <AnimatePresence>
        {showOpening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)",
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            className="fixed inset-0 flex flex-col items-center justify-center z-40"
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(227,100,20,0.15),_transparent_70%)]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
            />

            {/* Main title with enhanced animation */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center z-10"
            >
              <h1 className="text-6xl md:text-8xl font-quattrocento font-bold bg-gradient-to-r from-gold via-spanish to-gold text-transparent bg-clip-text">
                Mock Shaadi
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-4"
              >
                <span className="text-3xl md:text-4xl text-almond font-quattrocento">
                  2025
                </span>
              </motion.div>
            </motion.div>

            {/* Main tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-lg md:text-xl text-almond/80 mt-6 font-quattrocento italic"
            >
              Where Tradition Meets Tomorrow
            </motion.p>

            {/* Presentation text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="text-sm md:text-base text-almond/60 mt-4 font-quattrocento text-center"
            >
              Presented by Vanderbilt University South Asian Organizations
            </motion.p>

            {/* Decorative line */}
            <motion.div
              className="mt-8 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 2 }}
            >
              <motion.div
                className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-gold to-transparent"
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-spanish"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-gold to-transparent"
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="min-h-screen"
          >
            <OrgHeader />

            {/* Main content */}
            <div className="max-w-7xl bg-transparent mx-auto space-y-8 relative z-10">
              <div className="p-6">
                <BentoGrid />
              </div>
            </div>

            {/* Organization showcase section */}
            <OrgShowcase isVisible={showContent} />
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedBorder>
  );
};

export default OpeningSequence;
