import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../model/Thali";
import { motion } from "framer-motion";
import { ErrorBoundary } from "../../ErrorBoundary";
import { useIsVisible } from "../../../hooks/useIsVisible";

// Module-level memoized WebGL capability probe. Runs at most once per page
// load; if the device/browser can't create a context we never mount <Canvas>.
let webglSupported: boolean | null = null;
function isWebGLSupported(): boolean {
  if (webglSupported !== null) return webglSupported;
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ||
      (probe.getContext("webgl") as WebGLRenderingContext | null);
    webglSupported = Boolean(gl);
    if (gl) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webglSupported = false;
  }
  return webglSupported;
}

// Static stand-in for the 3D thali: same footprint as the Canvas, so the
// bento grid still looks complete when WebGL is unavailable or crashes.
function ThaliFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src="/textures/plate.jpeg"
        alt="A traditional Bengali thali plate"
        loading="lazy"
        className="w-[130px] h-[130px] rounded-full object-cover shadow-lg ring-2 ring-gold/60"
      />
    </div>
  );
}

const vec = new THREE.Vector3();

function Scene() {
  const thaliRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(() =>
    getScaleFactor(window.innerWidth),
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setScaleFactor(getScaleFactor(window.innerWidth));
      }, 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    });
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // Single consolidated useFrame for all per-frame work
  useFrame(({ camera }) => {
    // Camera rig
    vec.set(
      mouseRef.current.x * 0.005,
      mouseRef.current.y * 0.005,
      camera.position.z,
    );
    camera.position.lerp(vec, 0.25);
    camera.lookAt(0, 0, 0);

    // Thali rotation
    if (thaliRef.current) {
      thaliRef.current.rotation.y += 0.01;
    }

    // Material hover lerp
    material.roughness = THREE.MathUtils.lerp(
      material.roughness,
      hovered ? 0.1 : 0.5,
      0.1,
    );
    material.metalness = THREE.MathUtils.lerp(
      material.metalness,
      hovered ? 1.0 : 0.8,
      0.1,
    );
    material.clearcoat = THREE.MathUtils.lerp(
      material.clearcoat,
      hovered ? 1.0 : 0.5,
      0.1,
    );
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={hovered ? 2.0 : 1.5}
      />
      <pointLight position={[-10, -10, -10]} intensity={hovered ? 0.8 : 0.5} />
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
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Model rotation={[0, 0, 0]} material={material} />
        </group>
      </Suspense>
      {/* No <Environment> here: Thali.tsx already mounts a "studio"
          environment (which always won the old studio/sunset race anyway).
          A second preset meant a redundant HDR download that suspended the
          whole canvas until it resolved. */}
    </>
  );
}

function getScaleFactor(width: number) {
  if (width < 480) return 0.7;
  if (width < 768) return 0.75;
  if (width < 1024) return 0.8;
  if (width < 1200) return 0.85;
  return 1;
}

export default function AnimatedFood() {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  // Tight margin drives the frameloop (render only when actually near view).
  const isNearViewport = useIsVisible(canvasHostRef, "250px");
  // Wide margin drives Canvas mount: start fetching the ~5.3MB GLTF a couple
  // of viewports early so the model is usually ready by the time it's seen.
  const isApproaching = useIsVisible(canvasHostRef, "900px");
  const [webglOk] = useState(() => isWebGLSupported());
  const [hasMounted, setHasMounted] = useState(false);

  // Latch: mount the Canvas the first time it approaches the viewport, then
  // keep it mounted (frameloop pauses off-screen instead of unmount thrash).
  useEffect(() => {
    if (isApproaching && !hasMounted) {
      setHasMounted(true);
    }
  }, [isApproaching, hasMounted]);

  return (
    <div className="h-full w-full relative">
      {/* Large background gradient */}
      <motion.div
        className="absolute top-[-50%] left-[-50%] right-[-50%] bottom-[-50%] bg-gradient-to-r from-gold/10 via-spanish/20 to-gold/10 rounded-xl blur-lg"
        animate={
          isNearViewport
            ? {
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.03, 1],
              }
            : undefined
        }
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
            <div className="motion-safe:animate-marquee whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >
                Delicious • Delicious • Delicious • Delicious •
              </span>
            </div>
            <div className="absolute top-0 motion-safe:animate-marquee2 motion-reduce:hidden whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >
                Delicious • Delicious • Delicious • Delicious •
              </span>
            </div>
          </div>

          <div className="relative flex overflow-hidden">
            <div className="motion-safe:animate-marqueeReverse whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >
                South Asian • South Asian • South Asian • South Asian •
              </span>
            </div>
            <div className="absolute top-0 motion-safe:animate-marqueeReverse2 motion-reduce:hidden whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >
                South Asian • South Asian • South Asian • South Asian •
              </span>
            </div>
          </div>
          {/* Row 3: Food */}
          <div className="relative flex overflow-hidden">
            <div className="motion-safe:animate-marquee whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >
                Food • Food • Food • Food •
              </span>
            </div>
            <div className="absolute top-0 motion-safe:animate-marquee2 motion-reduce:hidden whitespace-nowrap py-2">
              <span
                className="text-4xl md:text-5xl font-marker text-[#ecc078] tracking-wider mx-4"
                style={{
                  WebkitTextStroke: "1px #992b0d",
                  textShadow: "2px 2px 0 #992b0d",
                }}
              >
                Food • Food • Food • Food •
              </span>
            </div>
          </div>
        </div>

        {/* ThreeJS Model — fixed-height host, so swapping placeholder /
            fallback / Canvas never shifts layout */}
        <div
          ref={canvasHostRef}
          className="absolute w-full h-[150px] z-20  flex items-center justify-center"
        >
          {!webglOk ? (
            <ThaliFallback />
          ) : hasMounted ? (
            <ErrorBoundary label="thali-3d" fallback={<ThaliFallback />}>
              <Canvas
                frameloop={isNearViewport ? "always" : "never"}
                camera={{
                  position: [0, 0, 2.5],
                  fov: 35,
                  near: 0.1,
                  far: 100,
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
                  zIndex: 20,
                }}
              >
                <Scene />
              </Canvas>
            </ErrorBoundary>
          ) : (
            // Subtle pulse skeleton (thali-sized) until the Canvas mounts —
            // signals "something is coming" instead of dead space.
            <div
              className="w-[130px] h-[130px] rounded-full bg-white/5 motion-safe:animate-pulse"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  );
}
