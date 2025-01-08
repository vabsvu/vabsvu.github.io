import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const AnimatedNoise = ({ className = '', intensity = 70 }) => {
  const [pattern, setPattern] = useState('');

  useEffect(() => {
    // Create SVG noise pattern
    const svg = `
      <svg viewBox="0 0 200 200" xmlns='http://www.w3.org/2000/svg'>
        <filter id='noiseFilter'>
          <feTurbulence 
            type='fractalNoise' 
            baseFrequency='0.50' 
            numOctaves='1' 
            stitchTiles='stitch'/>
          <feColorMatrix type="saturate" values="0.2"/>
        </filter>
        <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
      </svg>
    `;
    
    const encodedSVG = encodeURIComponent(svg);
    setPattern(`url("data:image/svg+xml,${encodedSVG}")`);
  }, []);

  return (
    <motion.div
      className={`absolute inset-0 mix-blend-overlay opacity-50 ${className}`}
      style={{
        backgroundImage: pattern,
      }}
      animate={{
        filter: [
          `contrast(${intensity}%) brightness(800%)`,
          `contrast(${intensity + 30}%) brightness(1000%)`,
          `contrast(${intensity}%) brightness(800%)`
        ]
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity
      }}
    />
  );
};

interface BentoBoxProps {
  children: React.ReactNode;
  className?: string;
  withNoise?: boolean;
  colorFrom?: string;
  colorTo?: string;
}

export const BentoBox: React.FC<BentoBoxProps> = ({ 
  children, 
  className = '', 
  withNoise = true, 
  colorFrom = 'from-[#992b0d]', 
  colorTo = 'to-[#d8b148]' 
}) => {
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo} ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {withNoise && <AnimatedNoise />}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};