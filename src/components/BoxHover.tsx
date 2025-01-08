// src/components/BoxHover.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

interface BoxHoverProps {
  children: React.ReactNode;
  className?: string;
}

const ROTATION_RANGE = 25;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

export function BoxHover({ children, className = "" }: BoxHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Framer Motion values for smooth rotation
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });
  const transform = useMotionTemplate`perspective(1000px) rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || isMobile) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);

    // Update shine effect
    const shine = ref.current.querySelector(".shine") as HTMLDivElement;
    if (shine) {
      const percentX = ((e.clientX - rect.left) / rect.width) * 1000;
      const percentY = ((e.clientY - rect.top) / rect.height) * 100;
      shine.style.background = `
    radial-gradient(
      circle at ${percentX}% ${percentY}%, 
      rgba(255, 255, 255, 1) 0%,
      rgba(236, 192, 120, 1) 25%,
      rgba(216, 177, 72, 1) 50%, 
      rgba(226, 213, 126, 1) 75%,  
      rgba(153, 43, 13, 1) 100%  
    )
      `;
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    x.set(0);
    y.set(0);

    const shine = ref.current?.querySelector(".shine") as HTMLDivElement;
    if (shine) {
      shine.style.background = "none";
    }
  };

  const handleTouchStart = () => {
    if (!isMobile) return;
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsPressed(false);
  };

  const mobileAnimation = isMobile
    ? {
        animate: {
          y: [-5, 5, -5],
          rotate: [-1, 1, -1],
          transition: {
            duration: 6,
            repeat: Infinity,
            easings: ["easeInOut"],
          },
        },
        whileTap: { scale: 0.95, y: 5 },
      }
    : {};

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        transformStyle: "preserve-3d",
        transform: isMobile ? undefined : transform,
      }}
      {...mobileAnimation}
    >
      <div
        className={`
          shine absolute inset-0 pointer-events-none rounded-lg
          ${
            isMobile
              ? "bg-gradient-to-br from-transparent via-white/10 to-transparent"
              : ""
          }
        `}
      />
      {children}
    </motion.div>
  );
}
