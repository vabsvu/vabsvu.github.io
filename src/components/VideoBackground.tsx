// src/components/VideoBackground.tsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const COLORS = {
  maroon: "#992b0d",
  peachGold: "#d8b148",
  lightGold: "#e2d57e",
  peach: "#ecc078",
} as const;

interface BadgeLayerProps {
  offset: number;
  scale?: number;
  color: string;
  isBackground?: boolean;
}

// Separate component for the stacked badge layers
function BadgeLayer({
  offset,
  scale = 1,
  color,
  isBackground = false,
}: BadgeLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Add interactive rotation for the badge layers
      const delay = isBackground ? 0.05 : 0;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        state.mouse.y * 0.15,
        0.1,
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        state.mouse.x * 0.15,
        0.1 - delay,
      );

      // Subtle floating animation for depth
      const floatOffset = isBackground ? 0.02 : 0;
      meshRef.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1 + floatOffset;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[16 * scale, 9 * scale, 0.5]} // Adjust dimensions for individual layers
      radius={0.8}
      smoothness={8}
      position={[0, 0, offset]}
    >
      <meshPhysicalMaterial
        color={color}
        metalness={0.7}
        roughness={0.2}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        reflectivity={1}
        transparent
        opacity={isBackground ? 0.9 : 1}
        side={THREE.DoubleSide}
      />
    </RoundedBox>
  );
}

function AnimatedBadge() {
  return (
    <group>
      {/* Background layer - slightly larger for a thick edge effect */}
      <BadgeLayer
        offset={-1.5}
        scale={1.05}
        color={COLORS.maroon}
        isBackground={true}
      />

      {/* Main front layer */}
      <BadgeLayer
        offset={0}
        scale={1}
        color={COLORS.maroon}
        isBackground={false}
      />

      {/* Inner decorative layer */}
      <BadgeLayer
        offset={-0.75}
        scale={1.02}
        color={COLORS.peachGold}
        isBackground={false}
      />

      {/* Distorted metallic inner accent */}
      <RoundedBox
        args={[15.6, 8.6, 0.3]}
        radius={0.7}
        smoothness={8}
        position={[0, 0, 0.1]}
      >
        <MeshDistortMaterial
          color={COLORS.lightGold}
          speed={2}
          distort={0.2}
          metalness={0.8}
          roughness={0.2}
          clearcoat={1.0}
        />
      </RoundedBox>

      {/* Edge highlight with contrasting color */}
      <BadgeLayer
        offset={-1.2}
        scale={1.03}
        color={COLORS.peach}
        isBackground={false}
      />
    </group>
  );
}

export function VideoBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          color={COLORS.peach}
        />
        <pointLight
          position={[-5, -5, -5]}
          intensity={0.8}
          color={COLORS.lightGold}
        />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1.2}
          castShadow
          color={COLORS.peachGold}
        />
        <pointLight
          position={[15, 0, 5]}
          intensity={0.5}
          color={COLORS.lightGold}
        />
        <pointLight
          position={[-15, 0, 5]}
          intensity={0.5}
          color={COLORS.lightGold}
        />

        {/* Fog for a soft, glowing effect */}
        <fog attach="fog" args={["#000000", 15, 25]} />

        <AnimatedBadge />
      </Canvas>
    </div>
  );
}
