import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { PackModelMesh } from "./packModel";
import { getDailyPacks } from "../api/cards";
import { Set } from "@full-stack/types";
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
import cardpackModelUrl from "../assets/cardpack2.glb?url";

interface DailyPacksProps {
  className?: string;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
}

export default function DailyPacks({
  className = "",
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  ambientLightIntensity = 0.5,
  directionalLightIntensity = 10,
  enableZoom = false,
  enablePan = false,
  enableRotate = false,
  minDistance = 3,
  maxDistance = 10,
}: DailyPacksProps) {
  const [sets, setSets] = useState<Set[]>([]);

  useEffect(() => {
    const fetchDailyPacks = async () => {
      try {
        const dailyPacks = await getDailyPacks();
        setSets(dailyPacks);
      } catch (error) {
        console.error("Failed to fetch daily packs:", error);
      }
    };

    fetchDailyPacks();
  }, []);

  // Component to enhance color vibrancy via tone mapping
  function ColorEnhancement() {
    const { gl } = useThree();
    useEffect(() => {
      gl.toneMappingExposure = 1.2; // Increase exposure for brighter, more vibrant colors
    }, [gl]);
    return null;
  }

  // Component to add bobbing animation to pack models
  function BobbingPack({
    children,
    offset = 0,
    speed = 1,
    amplitude = 0.1,
  }: {
    children: React.ReactNode;
    offset?: number;
    speed?: number;
    amplitude?: number;
  }) {
    const groupRef = useRef<any>(null);

    useFrame((state) => {
      if (groupRef.current) {
        // Create smooth up and down bobbing motion
        const time = state.clock.elapsedTime;
        groupRef.current.position.y =
          Math.sin(time * speed + offset) * amplitude;
      }
    });

    return <group ref={groupRef}>{children}</group>;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true }}
      >
        <ColorEnhancement />
        {/* Shared lighting for all objects */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={directionalLightIntensity}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        <Environment preset="studio" />

        {/* Multiple pack models in the same scene */}
        <Suspense fallback={null}>
          {/* left card */}
          <BobbingPack offset={0} speed={1.2} amplitude={0.08}>
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1.4}
              position={[-2, 0.5, 0.5]}
              rotation={[190, 170, -90]}
              autoRotate={false}
              overlayImageUrl={sets[0]?.coverImage}
              setTitle={sets[0]?.theme}
            />
          </BobbingPack>
          {/* middle card */}
          <BobbingPack offset={Math.PI * 0.33} speed={1.2} amplitude={0.08}>
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1.4}
              position={[0, 0, 0.2]}
              rotation={[165, 180, -75]}
              autoRotate={false}
              overlayImageUrl={sets[1]?.coverImage}
              setTitle={sets[1]?.theme}
            />
          </BobbingPack>
          {/* right card */}
          <BobbingPack offset={Math.PI * 0.66} speed={1.2} amplitude={0.08}>
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1.4}
              position={[2, 0.7, 0]}
              rotation={[190, 190, -90]}
              autoRotate={false}
              overlayImageUrl={sets[2]?.coverImage}
              setTitle={sets[2]?.theme}
            />
          </BobbingPack>
        </Suspense>

        {/* Shared controls for the entire scene */}
        <OrbitControls
          enableZoom={enableZoom}
          enablePan={enablePan}
          enableRotate={enableRotate}
          minDistance={minDistance}
          maxDistance={maxDistance}
        />
      </Canvas>
    </div>
  );
}
