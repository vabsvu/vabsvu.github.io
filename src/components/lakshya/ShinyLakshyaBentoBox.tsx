import React from "react";
import { BentoBox } from "../AnimatedNoise";
import { motion } from "framer-motion";
import { Lakshya } from "./Lakshya";

const ShinyLakshyaBentoBox = () => {
  return (
    <BentoBox
      className="col-span-2 md:col-span-3 lg:col-span-2 p-6 h-[150px] md:h-[200px] relative overflow-hidden"
      colorFrom="from-[#992b0d]"
      colorTo="to-[#e2d57e]"
      withNoise={true}
    >
      {/* Base glow layer */}
      <motion.div
        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(233,213,255,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, rgba(233,213,255,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 50%, rgba(233,213,255,0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Moving glow spots */}
      <motion.div
        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(233,213,255,0.4) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(233,213,255,0.4) 0%, transparent 30%)",
            "radial-gradient(circle at 80% 30%, rgba(233,213,255,0.4) 0%, transparent 30%), radial-gradient(circle at 20% 70%, rgba(233,213,255,0.4) 0%, transparent 30%)",
            "radial-gradient(circle at 20% 30%, rgba(233,213,255,0.4) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(233,213,255,0.4) 0%, transparent 30%)",
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Pulsing overlay */}
      <motion.div
        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at center, rgba(233,213,255,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Ambient light waves */}
      <motion.div
        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
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
  );
};

export default ShinyLakshyaBentoBox;
