import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../../model_components/Thali";
import { Environment, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

const vec = new THREE.Vector3();
function Rig() {
  return useFrame(({ camera, mouse }) => {
    vec.set(mouse.x * 0.005, mouse.y * 0.005, camera.position.z);
    camera.position.lerp(vec, 0.25);
    camera.lookAt(0, 0, 0);
  });
}

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePosition;
}

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

function Scene() {
  const thaliRef = useRef<THREE.Group>(null);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { width } = useWindowSize();
  const mousePosition = useMousePosition();

  const getScaleFactor = (width: number) => {
    if (width < 480) {
      // Mobile phones
      return 0.7;
    } else if (width < 768) {
      // Tablets
      return 0.75;
    } else if (width < 1024) {
      // Small laptops
      return 0.8;
    } else if (width < 1200) {
      // Regular laptops
      return 0.85;
    }
    return 1; // Large screens
  };

  const scaleFactor = getScaleFactor(width);
  useFrame((state) => {
    if (thaliRef.current) {
      // Constant rotation
      thaliRef.current.rotation.y += 0.01 ; // Adjust speed as needed
    }
  });

  // Create a custom material with dynamic properties
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    });
  }, []);

  useFrame(() => {
    if (thaliRef.current) {
      // Update material properties based on hover state
      if (material) {
        material.roughness = THREE.MathUtils.lerp(
          material.roughness,
          hovered ? 0.1 : 0.5,
          0.1
        );
        material.metalness = THREE.MathUtils.lerp(
          material.metalness,
          hovered ? 1.0 : 0.8,
          0.1
        );
        material.clearcoat = THREE.MathUtils.lerp(
          material.clearcoat,
          hovered ? 1.0 : 0.5,
          0.1
        );
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={hovered ? 2.0 : 1.5}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={hovered ? 0.8 : 0.5} />

      {/* Add a subtle environmental lighting for better reflections */}
      <hemisphereLight
        intensity={0.3}
        groundColor={new THREE.Color(0x080820)}
      />

      <Suspense fallback={null}>
        <group
          ref={thaliRef}
          scale={scaleFactor}
          rotation={[0, 0, -1]}
          position={[0.0015, 0.0085, 2.35]}
          onClick={() => setFlipped(!flipped)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Model rotation={[0, 0, 0]} material={material} />
        </group>
      </Suspense>
      <Environment preset="sunset" />
      <Rig />
    </>
  );
}

export default function AnimatedFood() {
  return (
    <div className="h-full w-full relative">
      {/* Large background gradient */}
      <motion.div
        className="absolute top-[-50%] left-[-50%] right-[-50%] bottom-[-50%] bg-gradient-to-r from-gold/10 via-spanish/20 to-gold/10 rounded-xl blur-lg"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative w-full grid  overflow-clip">
        {/* Text section with scrolling marquee */}
        <div className="relative flex flex-col grid-cols-2 justify-center p-4 md:p-6 -translate-y-7 -translate-x-7 overflow-visible">
          {/* Row 1: Delicious */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >Delicious • Delicious • Delicious • Delicious •</span>
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >Delicious • Delicious • Delicious • Delicious •</span>
            </div>
          </div>

          <div className="relative flex overflow-hidden">
            <div className="animate-marqueeReverse whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >South Asian • South Asian • South Asian • South Asian •</span>
            </div>
            <div className="absolute top-0 animate-marqueeReverse2 whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >South Asian • South Asian • South Asian • South Asian •</span>
            </div>
          </div>
          {/* Row 3: Food */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >Food • Food • Food • Food •</span>
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >Food • Food • Food • Food •</span>
            </div>
          </div>
        </div>

        {/* ThreeJS Model */}
        <div className="absolute w-full h-[150px] z-20  flex items-center justify-center">
          <Canvas
            shadows
            camera={{
              position: [0, 0, 2.5],
              fov: 35,
              near: 0.0001,
              far: 10000,
            }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.5,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 20, // Ensure the canvas appears above the scrolling text
            }}
          >
            <Scene />

          </Canvas>
        </div>
      </div>
    </div>
  );
}
