import React from 'react';
import { motion } from 'framer-motion';

const HennaPatterns = () => {
  // Animation variants for the patterns
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: .5,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  // Rich dark red color for henna
  const hennaColor = "#8B0000";
  
  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-soft-light">
      {/* Top left corner pattern - more intricate */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute top-0 left-0 w-48 h-48 opacity-90"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M 20,20 
             C 30,10 40,30 30,40 
             C 20,50 40,60 50,50 
             Q 60,40 70,50 
             C 80,60 60,70 50,60
             M 25,25
             C 35,15 45,35 35,45
             Q 25,55 35,65"
          stroke={hennaColor}
          strokeWidth="1.5"
          fill="none"
          variants={pathVariants}
        />
        <motion.circle
          cx="35"
          cy="35"
          r="3"
          fill={hennaColor}
          variants={pathVariants}
        />
        <motion.circle
          cx="45"
          cy="55"
          r="2"
          fill={hennaColor}
          variants={pathVariants}
        />
      </motion.svg>

      {/* Bottom right corner pattern - paisley inspired */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute bottom-0 right-0 w-48 h-48 opacity-90"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M 80,80 
             C 70,90 60,70 70,60 
             C 80,50 60,40 50,50 
             Q 40,60 30,50 
             C 20,40 40,30 50,40
             M 75,75
             C 65,85 55,65 65,55
             Q 75,45 65,35"
          stroke={hennaColor}
          strokeWidth="1.5"
          fill="none"
          variants={pathVariants}
        />
        <motion.path
          d="M 70,70
             Q 60,80 50,70
             T 30,60
             Q 40,50 50,60
             T 70,70 Z"
          fill={hennaColor}
          fillOpacity="0.6"
          variants={pathVariants}
        />
      </motion.svg>

      {/* Side decorative elements - more ornate */}
      <motion.div 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-48"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.9, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.div
          className="w-full h-full"
          style={{
            background: `linear-gradient(90deg, ${hennaColor} 0%, transparent 100%)`,
            opacity: 0.7
          }}
          animate={{
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-48"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.9, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.div
          className="w-full h-full"
          style={{
            background: `linear-gradient(-90deg, ${hennaColor} 0%, transparent 100%)`,
            opacity: 0.7
          }}
          animate={{
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Center mandala - more detailed */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-80"
        initial="hidden"
        animate="visible"
      >
        {/* Base mandala layer */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
          <motion.path
            key={`base-${index}`}
            d="M 100,100 
               C 120,80 140,100 120,120 
               S 80,140 100,100
               M 100,100
               C 110,90 120,100 110,110
               S 90,120 100,100"
            stroke={hennaColor}
            strokeWidth="1"
            fill="none"
            transform={`rotate(${rotation}, 100, 100)`}
            variants={pathVariants}
            transition={{
              ...pathVariants.visible.transition,
              delay: index * 0.1
            }}
          />
        ))}
        
        {/* Detailed center elements */}
        {[0, 72, 144, 216, 288].map((rotation, index) => (
          <motion.path
            key={`detail-${index}`}
            d="M 100,100
               Q 110,95 120,100
               T 140,100
               Q 130,110 120,105
               T 100,100 Z"
            fill={hennaColor}
            fillOpacity="0.6"
            transform={`rotate(${rotation}, 100, 100)`}
            variants={pathVariants}
            transition={{
              ...pathVariants.visible.transition,
              delay: 0.8 + index * 0.1
            }}
          />
        ))}

        {/* Center dot */}
        <motion.circle
          cx="100"
          cy="100"
          r="4"
          fill={hennaColor}
          variants={pathVariants}
        />
      </motion.svg>
    </div>
  );
};

export default HennaPatterns;