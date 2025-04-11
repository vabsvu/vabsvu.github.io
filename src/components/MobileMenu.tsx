import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, ArrowUpRightSquare } from "lucide-react";

interface OrgItemProps {
  src: string;
  alt: string;
  instagramLink: string;
  scale?: number;
}

const organizations = [
  {
    name: "VABS",
    imageSrc: "src/components/orgs/OrgPhotos/vabs.png",
    instagramUrl: "https://www.instagram.com/vandy.bengalis/",
    scale: 1.5,
  },
  {
    name: "PSA",
    imageSrc: "src/components/orgs/OrgPhotos/psa.png",
    instagramUrl: "https://www.instagram.com/vandypsa/",
    scale: 1.3,
  },
  {
    name: "SACE",
    imageSrc: "src/components/orgs/OrgPhotos/sace.jpeg",
    instagramUrl: "https://www.instagram.com/vanderbiltsace/",
    scale: 1.1,
  },
  {
    name: "Spevents",
    imageSrc: "src/components/orgs/OrgPhotos/spevents.svg",
    instagramUrl: "https://spevents.github.io",
    scale: 1.1,
  },
];

const OrgItem = ({ src, alt, instagramLink, scale = 1 }: OrgItemProps) => (
  <motion.a
    href={instagramLink}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#992b0d]/20 to-[#d8b148]/20 rounded-2xl hover:from-[#992b0d]/30 hover:to-[#d8b148]/30 backdrop-blur-sm"
    whileHover={{
      y: -2,
      transition: { duration: 0.2 },
    }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#992b0d]/10">
      <motion.img
        src={src}
        alt={alt}
        style={{ scale }}
        className="w-full h-full object-contain p-2"
        whileHover={{ scale: scale * 1.1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {alt === "Spevents" ? (
          <ArrowUpRightSquare className="w-6 h-6 text-white" />
        ) : (
          <Instagram className="w-6 h-6 text-white" />
        )}
      </motion.div>
    </div>
    <div className="flex flex-col">
      <span className="font-quattrocento text-[#e2d57e] text-lg font-bold">
        {alt}
      </span>
      <span className="text-[#e2d57e]/70 text-sm">View Profile</span>
    </div>
    {alt === "Spevents" ? (
      <ArrowUpRightSquare className="w-5 h-5 text-[#e2d57e] ml-auto" />
    ) : (
      <Instagram className="w-5 h-5 text-[#e2d57e] ml-auto" />
    )}
  </motion.a>
);

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
    },
    open: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-r from-[#992b0d] to-[#d8b148] shadow-lg backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#e2d57e]" />
          ) : (
            <Menu className="w-6 h-6 text-[#e2d57e]" />
          )}
        </motion.div>
      </motion.button>

      {/* Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className={`fixed top-0 right-0 w-full max-w-sm h-screen bg-gradient-to-b from-[#992b0d] via-[#761f0a] to-[#4d1405] p-6 pt-20 z-40 shadow-xl ${
              isOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Decorative background elements */}
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(227,100,20,0.15),_transparent_70%)]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="space-y-6">
              <div className="relative">
                <h3 className="text-[#e2d57e] font-quattrocento text-2xl font-bold mb-2">
                  Organizations
                </h3>
                <div className="h-1 w-20 bg-gradient-to-r from-[#e2d57e] to-transparent rounded-full" />
              </div>

              <div className="space-y-4">
                {organizations.map((org) => (
                  <OrgItem
                    key={org.name}
                    src={org.imageSrc}
                    alt={org.name}
                    instagramLink={org.instagramUrl}
                    scale={org.scale}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
