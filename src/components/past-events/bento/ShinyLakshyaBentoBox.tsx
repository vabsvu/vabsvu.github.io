import React, { useRef } from "react";
import { BentoBox } from "./AnimatedNoise";
import { motion } from "framer-motion";
import { Lakshya } from "./Lakshya";
import { useIsVisible } from "../../../hooks/useIsVisible";

const ShinyLakshyaBentoBox = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref);

  return (
    <div ref={ref} className="col-span-2 md:col-span-3 lg:col-span-2">
      <BentoBox
        className="p-6 h-[150px] md:h-[200px] relative overflow-hidden"
        colorFrom="from-[#992b0d]"
        colorTo="to-[#e2d57e]"
        withNoise={true}
      >
        {/* Base glow layer */}
        <motion.div
          className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2"
          animate={
            isVisible
              ? {
                  background: [
                    "radial-gradient(circle at 30% 50%, rgba(233,213,255,0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 70% 50%, rgba(233,213,255,0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 30% 50%, rgba(233,213,255,0.3) 0%, transparent 50%)",
                  ],
                }
              : undefined
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent"
          animate={
            isVisible
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }
              : undefined
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10">
          <Lakshya />
        </div>
      </BentoBox>
    </div>
  );
};

export default ShinyLakshyaBentoBox;
