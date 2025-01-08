// Thali.tsx
import * as THREE from "three";
import React from "react";
import { useGLTF, Environment } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    pCylinder1_blinn5_0: THREE.Mesh;
    pCylinder3_blinn10_0: THREE.Mesh;
    pPlane4_blinn9_0: THREE.Mesh;
    pSphere8_phongE14_0: THREE.Mesh;
    pSphere9_blinn6_0: THREE.Mesh;
    pSphere10_blinn7_0: THREE.Mesh;
    pPlane8_blinn8_0: THREE.Mesh;
    pPlane11_blinn4_0: THREE.Mesh;
    pPlane12_blinn2_0: THREE.Mesh;
    pDisc1_blinn3_0: THREE.Mesh;
    pCylinder4_blinn13_0: THREE.Mesh;
    pCylinder5_blinn12_0: THREE.Mesh;
    pCylinder6_blinn11_0: THREE.Mesh;
    pCylinder13_blinn1_0: THREE.Mesh;
  };
  materials: {
    blinn5: THREE.MeshStandardMaterial;
    blinn10: THREE.MeshStandardMaterial;
    blinn9: THREE.MeshStandardMaterial;
    phongE14: THREE.MeshStandardMaterial;
    blinn6: THREE.MeshStandardMaterial;
    blinn7: THREE.MeshStandardMaterial;
    blinn8: THREE.MeshStandardMaterial;
    blinn4: THREE.MeshStandardMaterial;
    blinn2: THREE.MeshStandardMaterial;
    blinn3: THREE.MeshStandardMaterial;
    blinn13: THREE.MeshStandardMaterial;
    blinn12: THREE.MeshStandardMaterial;
    blinn11: THREE.MeshStandardMaterial;

    // CUCUMBER
    blinn1: THREE.MeshStandardMaterial;
  };
};

export default function Thali(material, props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/models/thali/thali.gltf"
  ) as GLTFResult;

  const textureLoader = new THREE.TextureLoader();
  const plateTexture = textureLoader.load("/textures/plate.jpeg");
  const cupTexture = textureLoader.load("/textures/cup.avif");
  const lassiTexture = textureLoader.load("textures/lassi.png");

  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfff27d, // Brighter gold color
    metalness: 1.0,
    roughness: 0.05, // Decreased for more shine
    envMapIntensity: 2.5, // Increased reflections
    reflectivity: 1.5,
    clearcoat: 0.8, // Increased for more shine
    clearcoatRoughness: 0.05,
  });

  const cupMaterial = new THREE.MeshPhysicalMaterial({
    map: cupTexture,
    color: 0xa80101, // Brighter red
    metalness: 1.0, // Increased
    roughness: 0.1, // Decreased for more shine
    envMapIntensity: 1.5, // Increased
    reflectivity: 1.2,
    clearcoat: 0.5, // Increased
    emissive: 0xa80101, // Added emissive for extra glow
    emissiveIntensity: 0.2,
  });

  const lassiMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffd400, // Brighter gold
    metalness: 1.0, // Increased
    roughness: 0.1, // Decreased for more shine
    envMapIntensity: 1.5, // Increased
    reflectivity: 15, // Increased
    clearcoat: 1.0, // Maximum clearcoat
    emissive: 0xffeb3b, // Added emissive for extra glow
    emissiveIntensity: 0.1,
  });

  return (
    <>
      <Environment preset="studio" />
      <group {...props} dispose={null}>
        <group scale={0.01}>
          {/* CUCUMBER */}
          <mesh
            geometry={nodes.pCylinder13_blinn1_0.geometry}
            material={materials.blinn1}
            position={[-0.202, 0.009, 1.932]}
          />

          {/* SILVER CUP */}
          <mesh
            geometry={nodes.pCylinder1_blinn5_0.geometry}
            material={cupMaterial}
            position={[-0.19, 0.394, 4.978]}
            rotation={[0, -0.235, 0]}
            scale={0.203}
          />

          {/* SILVER PLATE*/}
          <mesh
            geometry={nodes.pCylinder3_blinn10_0.geometry}
            material={goldMaterial}
            position={[0.769, 0.197, 3.386]}
            scale={0.203}
          />

          {/* DAAL SPOON */}
          <mesh
            geometry={nodes.pPlane4_blinn9_0.geometry}
            material={materials.blinn9}
            position={[-0.888, 0.222, 2.893]}
            rotation={[0.607, -1.491, 1.13]}
            scale={0.127}
          />

          {/* DAAL BOWL 1 */}
          <mesh
            geometry={nodes.pSphere8_phongE14_0.geometry}
            material={materials.phongE14}
            position={[-0.928, 0.869, 2.815]}
            rotation={[0.003, 0.293, 0.003]}
            scale={0.203}
          />

          {/* DAAL BOWL 2 */}
          <mesh
            geometry={nodes.pSphere9_blinn6_0.geometry}
            material={materials.blinn6}
            position={[-0.928, 0.869, 2.815]}
            rotation={[0.003, 0.293, 0.003]}
            scale={0.203}
          />

          {/* CHICKPEA BOWL */}
          <mesh
            geometry={nodes.pSphere10_blinn7_0.geometry}
            material={materials.blinn7}
            position={[0.479, 0.869, 1.602]}
            rotation={[0.003, 0.293, 0.003]}
            scale={0.203}
          />

          {/* CHICKPEA SPOON */}
          <mesh
            geometry={nodes.pPlane8_blinn8_0.geometry}
            material={materials.blinn8}
            position={[0.302, 0.274, 1.543]}
            rotation={[3.095, 0.177, -2.609]}
            scale={0.127}
          />

          {/* TOP ROTI BOTTOM SIDE */}
          <mesh
            geometry={nodes.pPlane11_blinn4_0.geometry}
            material={materials.blinn4}
            position={[-4.934, -0.132, 3.857]}
            rotation={[0, 0.857, 0]}
            scale={[0.679, 0.867, 0.896]}
          />

          {/* TOP ROTI TOP SIDE */}
          <mesh
            geometry={nodes.pPlane12_blinn2_0.geometry}
            material={materials.blinn2}
            position={[-4.782, -0.21, 3.432]}
            rotation={[-0.034, 0.793, 0.026]}
            scale={[0.679, 0.867, 0.896]}
          />

          {/* BOTTOM ROTI */}
          <mesh
            geometry={nodes.pDisc1_blinn3_0.geometry}
            material={materials.blinn3}
            position={[1.846, 0.048, 4.032]}
            scale={1.389}
          />

          {/* CUP LIQUID */}
          <mesh
            geometry={nodes.pCylinder4_blinn13_0.geometry}
            material={lassiMaterial}
            position={[-0.19, 1.223, 4.978]}
            scale={0.539}
          />

          {/* DAAL TEXTURE */}
          <mesh
            geometry={nodes.pCylinder5_blinn12_0.geometry}
            material={materials.blinn12}
            position={[-0.932, 0.382, 2.816]}
            scale={0.682}
          />

          {/* CHICKPEA TEXTURE */}
          <mesh
            geometry={nodes.pCylinder6_blinn11_0.geometry}
            material={materials.blinn11}
            position={[0.477, 0.382, 1.605]}
            scale={0.682}
          />
        </group>
      </group>
    </>
  );
}

useGLTF.preload("/models/thali/thali.gltf");
