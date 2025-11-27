import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { PackModelMesh } from "./packModel";
import { getDailyPacks } from "../api/cards";
import type { Set } from "@full-stack/types";
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
  const [clickedPackIndex, setClickedPackIndex] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [packToReset, setPackToReset] = useState<number | null>(null);

  // Store original positions and rotations for each pack
  const packConfigs = [
    {
      position: [-1.286, 0.643, 0.357] as [number, number, number],
      rotation: [190, 170, -90] as [number, number, number],
    },
    {
      position: [0, 0.286, 0.143] as [number, number, number],
      rotation: [170, 180, -75] as [number, number, number],
    },
    {
      position: [1.429, 0.643, 0] as [number, number, number],
      rotation: [190, 190, -90] as [number, number, number],
    },
  ];

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

  const handleReset = () => {
    // Store which pack needs to reset before clearing clickedPackIndex
    const packIndexToReset = clickedPackIndex;
    // Immediately restore all packs (rerender other cards)
    setClickedPackIndex(null);
    // Set which pack should receive the reset trigger
    setPackToReset(packIndexToReset);
    // Trigger reset animation for the clicked pack
    setResetTrigger((prev) => prev + 1);
  };

  const handleResetComplete = () => {
    // Reset animation completed - clear the pack to reset
    setPackToReset(null);
  };

  return (
    <div className={`w-full h-full ${className} relative`}>
      {/* X button overlay - positioned on right side */}
      {clickedPackIndex !== null && (
        <button
          onClick={handleReset}
          className="absolute right-5/16 mt-[10vh] z-10 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true }}
        style={{ cursor: "pointer" }}
        onCreated={({ gl }) => {
          // Handle WebGL context loss
          const canvas = gl.domElement;
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn("WebGL context lost");
          };
          const handleContextRestored = () => {
            // WebGL context restored
          };
          canvas.addEventListener("webglcontextlost", handleContextLost);
          canvas.addEventListener(
            "webglcontextrestored",
            handleContextRestored
          );
          return () => {
            canvas.removeEventListener("webglcontextlost", handleContextLost);
            canvas.removeEventListener(
              "webglcontextrestored",
              handleContextRestored
            );
          };
        }}
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
          {clickedPackIndex === null || clickedPackIndex === 0 ? (
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1}
              position={packConfigs[0].position}
              rotation={packConfigs[0].rotation}
              autoRotate={false}
              overlayImageUrl={sets[0]?.coverImage}
              setTitle={sets[0]?.theme}
              enableBobbing={clickedPackIndex === null}
              bobbingOffset={0}
              bobbingSpeed={1.2}
              bobbingAmplitude={0.08}
              onClick={() => setClickedPackIndex(0)}
              originalPosition={packConfigs[0].position}
              originalRotation={packConfigs[0].rotation}
              resetTrigger={
                packToReset === 0 && resetTrigger > 0 ? resetTrigger : undefined
              }
              onResetComplete={
                packToReset === 0 ? handleResetComplete : undefined
              }
            />
          ) : null}
          {/* middle card */}
          {clickedPackIndex === null || clickedPackIndex === 1 ? (
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1}
              position={packConfigs[1].position}
              rotation={packConfigs[1].rotation}
              autoRotate={false}
              overlayImageUrl={sets[1]?.coverImage}
              setTitle={sets[1]?.theme}
              enableBobbing={clickedPackIndex === null}
              bobbingOffset={Math.PI * 0.33}
              bobbingSpeed={1.2}
              bobbingAmplitude={0.08}
              onClick={() => setClickedPackIndex(1)}
              originalPosition={packConfigs[1].position}
              originalRotation={packConfigs[1].rotation}
              resetTrigger={
                packToReset === 1 && resetTrigger > 0 ? resetTrigger : undefined
              }
              onResetComplete={
                packToReset === 1 ? handleResetComplete : undefined
              }
            />
          ) : null}
          {/* right card */}
          {clickedPackIndex === null || clickedPackIndex === 2 ? (
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1}
              position={packConfigs[2].position}
              rotation={packConfigs[2].rotation}
              autoRotate={false}
              overlayImageUrl={sets[2]?.coverImage}
              setTitle={sets[2]?.theme}
              enableBobbing={clickedPackIndex === null}
              bobbingOffset={Math.PI * 0.66}
              bobbingSpeed={1.2}
              bobbingAmplitude={0.08}
              onClick={() => setClickedPackIndex(2)}
              originalPosition={packConfigs[2].position}
              originalRotation={packConfigs[2].rotation}
              resetTrigger={
                packToReset === 2 && resetTrigger > 0 ? resetTrigger : undefined
              }
              onResetComplete={
                packToReset === 2 ? handleResetComplete : undefined
              }
            />
          ) : null}
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
