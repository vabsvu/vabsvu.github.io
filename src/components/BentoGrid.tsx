import React from "react";
import { VideoPlayer } from "./VideoPlayer";
import { BentoBox } from "./AnimatedNoise";
import { motion } from "framer-motion";
import { AnimatedSLC } from "./AnimatedSLC";
import AnimatedFood from "./AnimatedFood";
import ShiningLakshyaBentoBox from "./lakshya/ShinyLakshyaBentoBox";
import AnimatedHolud from "./AnimatedHolud";

export function BentoGrid() {
  return (
    <div className="relative  content-start w-full max-w-7xl mx-auto space-y-8 p-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 auto-rows-[150px] md:auto-rows-[200px] ">
        {/* SLC Ballroom - Now with AnimatedVenue */}
        <BentoBox
          className="col-span-2 md:col-span-3"
          colorFrom="from-[#992b0d]"
          colorTo="to-[#bf9b30]"
        >
          <AnimatedSLC />
        </BentoBox>

        <BentoBox
          className="col-span-2 md:col-span-3 row-span-1"
          colorFrom="from-[#992b0d]"
          colorTo="to-[#bf9b30]"
          withNoise={true}
        >
          <div className="h-full overflow-visible">
            <AnimatedFood />
          </div>
        </BentoBox>

        {/* Enhanced Video Section */}
        <BentoBox
          className="col-span-2 md:col-span-3 lg:col-span-4 row-span-2 md:row-span-2 p-6 relative overflow-hidden"
          colorFrom="from-[#992b0d]"
          colorTo="to-[#971a34]"
          withNoise={true}
        >
          {/* Animated background decorations */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <motion.div
              className="absolute top-0 left-0 w-40 h-40 bg-[#ecc078] rounded-full blur-3xl"
              animate={{ x: [-50, 50, -50], y: [-50, 50, -50] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            <motion.div
              className="absolute bottom-0 right-0 w-40 h-40 bg-[#e2d57e] rounded-full blur-3xl"
              animate={{ x: [50, -50, 50], y: [50, -50, 50] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
          </div>

          {/* Video section */}
          <div className="relative z-10 text-center mb-4">
            <h2 className="font-quattrocento text-3xl md:text-4xl font-bold text-white mb-2">
              🎥 Mock Shaadi Exclusive Trailer
            </h2>
            <div className="w-24 h-1 bg-[#ecc078] mx-auto rounded-full mt-2"></div>
          </div>

          {/* Video container with enhanced positioning */}
          <div className=" relative z-20 h-[calc(100%-5rem)] w-full rounded-lg bg-black/10 backdrop-blur-sm p-2 transform transition-transform duration-500  group-hover:scale-[0.9]">
            <VideoPlayer />
          </div>
        </BentoBox>

        {/* Traditional Dances */}
        <ShiningLakshyaBentoBox />

        <BentoBox
          className="col-span-2 md:col-span-3 lg:col-span-2"
          colorFrom="from-[#992b0d]"
          colorTo="to-[#d8b148]"
        >
          <AnimatedHolud />
        </BentoBox>
      </div>
    </div>
  );
}
