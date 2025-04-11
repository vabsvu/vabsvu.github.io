import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Instagram, ArrowUpRightSquare } from "lucide-react";
import { AnimatedTitle } from "../AnimatedTitle";
import { MobileMenu } from "../MobileMenu";

interface OrgLinkProps {
  href: string;
  children: ReactNode;
}

interface OrgImageProps {
  src: string;
  alt: string;
  scale?: number;
}

interface OrganizationProps {
  name: string;
  imageSrc: string;
  instagramUrl: string;
  scale?: number;
}

const organizations: OrganizationProps[] = [
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
    scale: 1.2,
  },
  {
    name: "SACE",
    imageSrc: "src/components/orgs/OrgPhotos/sace.jpeg",
    instagramUrl: "https://www.instagram.com/vanderbiltsace/",
    scale: 1.3,
  },
  {
    name: "Spevents",
    imageSrc: "src/components/orgs/OrgPhotos/spevents.svg",
    instagramUrl: "https://spevents.github.io",
    scale: 0.9,
  },
];

const OrgLink: React.FC<OrgLinkProps> = ({ href, children }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-col items-center gap-3 transition-transform duration-300"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.a>
);

const OrgImage: React.FC<OrgImageProps> = ({ src, alt, scale = 1 }) => (
  <div className="relative group w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-[#992b0d]/10 backdrop-blur-sm">
    <motion.img
      src={src}
      alt={alt}
      className="w-full h-full object-contain p-2"
      style={{ scale }}
      whileHover={{ scale: scale * 1.15 }}
      transition={{ duration: 0.2 }}
    />
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {alt === "Spevents" ? (
        <ArrowUpRightSquare className="w-6 h-6 text-white" />
      ) : (
        <Instagram className="w-6 h-6 text-white" />
      )}
    </div>
  </div>
);

const OrganizationComponent: React.FC<OrganizationProps> = ({
  name,
  imageSrc,
  instagramUrl,
  scale = 1,
}) => (
  <OrgLink href={instagramUrl}>
    <OrgImage src={imageSrc} alt={name} scale={scale} />
    <motion.span
      className="text-base md:text-lg font-quattrocento font-bold text-[#e2d57e] opacity-80 group-hover:opacity-100"
      whileHover={{ y: -2 }}
    >
      {name}
    </motion.span>
  </OrgLink>
);

export function OrgHeader(): JSX.Element {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-8 md:pt-12">
      {/* Mobile View */}
      <div className="md:hidden relative flex justify-center items-center">
        <div className="w-full">
          <AnimatedTitle />
        </div>
        <MobileMenu />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex justify-between items-start">
        {/* Left side organizations */}
        <div className="flex gap-8 items-center">
          {organizations.slice(0, 2).map((org) => (
            <OrganizationComponent key={org.name} {...org} />
          ))}
        </div>

        {/* Center Title */}
        <div className="flex-1 px-4">
          <AnimatedTitle />
        </div>

        {/* Right side organizations */}
        <div className="flex gap-8 items-center">
          {organizations.slice(2).map((org) => (
            <OrganizationComponent key={org.name} {...org} />
          ))}
        </div>
      </div>
    </div>
  );
}
