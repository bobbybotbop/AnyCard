import { Suspense, useEffect, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { PackModelMesh } from "./packModel";
import { getDailyPacks, openPack } from "../api/cards";
import type { Set, Card } from "@full-stack/types";
import { useAuth } from "../auth/authProvider";
import CardDrawings from "./CardDrawings";
import { Mesh, MeshStandardMaterial } from "three";
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
  isLocked?: boolean; // When true, component should reset and prevent new selections
  onSelectionStart?: () => void; // Called when a pack starts being selected
  onSelectionEnd?: () => void; // Called when selection is reset/ended
  resetRef?: React.MutableRefObject<(() => void) | null>; // Ref to expose reset function
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
  isLocked = false,
  onSelectionStart,
  onSelectionEnd,
  resetRef,
}: DailyPacksProps) {
  const [sets, setSets] = useState<Set[]>([]);
  const [clickedPackIndex, setClickedPackIndex] = useState<number | null>(null);
  // animatingPackIndex - tracks which pack is currently animating to center
  const [animatingPackIndex, setAnimatingPackIndex] = useState<number | null>(
    null
  );
  // selectedPackIndex - tracks which pack is selected (after animation completes, ready for second click)
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(
    null
  );
  const [openedPackIndex, setOpenedPackIndex] = useState<number | null>(null); // Track which pack was opened
  const [resetTrigger, setResetTrigger] = useState(0);
  const [packToReset, setPackToReset] = useState<number | null>(null);
  const [packClickCounts, setPackClickCounts] = useState<Map<number, number>>(
    new Map()
  );
  // overlayVisible - tracks which pack should show the overlay
  const [overlayVisible, setOverlayVisible] = useState<Map<number, boolean>>(
    new Map()
  );
  // openedCards - stores cards for each opened pack
  const [openedCards, setOpenedCards] = useState<Map<number, Card[]>>(
    new Map()
  );
  const { user } = useAuth();

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

  // Component to handle WebGL context loss and restoration
  function WebGLContextHandler() {
    const { gl, scene } = useThree();

    useEffect(() => {
      const canvas = gl.domElement;

      const handleContextLost = (event: Event) => {
        event.preventDefault();
        console.warn("WebGL context lost in DailyPacks");
        // Dispose of resources to free memory
        scene.traverse((object) => {
          if (object instanceof Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
              materials.forEach((mat) => {
                if (mat instanceof MeshStandardMaterial) {
                  if (mat.map) mat.map.dispose();
                  if (mat.normalMap) mat.normalMap.dispose();
                }
                mat.dispose();
              });
            }
          }
        });
      };

      const handleContextRestored = () => {
        console.log("WebGL context restored in DailyPacks");
        // Force a re-render by invalidating the renderer
        gl.resetState();
        // The scene will be recreated automatically by React Three Fiber
      };

      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      return () => {
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener(
          "webglcontextrestored",
          handleContextRestored
        );
      };
    }, [gl, scene]);

    return null;
  }

  const handleReset = useCallback(() => {
    // Store which pack needs to reset before clearing states
    const packIndexToReset =
      selectedPackIndex ??
      animatingPackIndex ??
      clickedPackIndex ??
      openedPackIndex;
    // Immediately restore all packs (rerender other cards)
    setClickedPackIndex(null);
    setAnimatingPackIndex(null); // Clear animating state
    setSelectedPackIndex(null); // Clear selected state
    setOpenedPackIndex(null); // Clear opened pack state
    // Reset click count for the pack being reset
    if (packIndexToReset !== null) {
      setPackClickCounts((prev) => {
        const newMap = new Map(prev);
        newMap.set(packIndexToReset, 0);
        return newMap;
      });
      // Hide overlay for the pack being reset
      setOverlayVisible((prev) => {
        const newMap = new Map(prev);
        newMap.set(packIndexToReset, false);
        return newMap;
      });
      // Clear cards for the pack being reset
      setOpenedCards((prev) => {
        const newMap = new Map(prev);
        newMap.delete(packIndexToReset);
        return newMap;
      });
    }
    // Set which pack should receive the reset trigger
    setPackToReset(packIndexToReset);
    // Trigger reset animation for the clicked pack
    setResetTrigger((prev) => prev + 1);
    // Notify parent that selection has ended
    if (onSelectionEnd) {
      onSelectionEnd();
    }
  }, [
    selectedPackIndex,
    animatingPackIndex,
    clickedPackIndex,
    openedPackIndex,
    onSelectionEnd,
  ]);

  // Expose reset function via ref
  useEffect(() => {
    if (resetRef) {
      resetRef.current = handleReset;
    }
    return () => {
      if (resetRef) {
        resetRef.current = null;
      }
    };
  }, [resetRef, handleReset]);

  // Reset when locked
  useEffect(() => {
    if (
      isLocked &&
      (selectedPackIndex !== null ||
        clickedPackIndex !== null ||
        openedPackIndex !== null ||
        animatingPackIndex !== null)
    ) {
      handleReset();
    }
  }, [
    isLocked,
    selectedPackIndex,
    clickedPackIndex,
    openedPackIndex,
    animatingPackIndex,
    handleReset,
  ]);

  const handleResetComplete = () => {
    // Reset animation completed - clear the pack to reset
    setPackToReset(null);
  };

  const handleAnimationComplete = (index: number) => {
    // Animation completed - mark pack as selected (ready for second click)
    setAnimatingPackIndex(null);
    setSelectedPackIndex(index);
  };

  const handlePackClick = async (index: number) => {
    // Don't allow clicks when locked
    if (isLocked) return;

    const currentCount = packClickCounts.get(index) || 0;
    const newCount = currentCount + 1;

    setPackClickCounts((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, newCount);
      return newMap;
    });

    if (newCount === 1) {
      // First click: start animation
      setAnimatingPackIndex(index);
      setClickedPackIndex(index);
      // Notify parent that selection has started
      if (onSelectionStart) {
        onSelectionStart();
      }
    } else if (newCount === 2) {
      // Second click: open the pack
      const pack = sets[index];
      if (pack && user?.uid) {
        try {
          const result = await openPack(user.uid, pack.name, "dailyPacks");
          console.log("Pack opened:", result);
          // Store the cards for this pack
          setOpenedCards((prev) => {
            const newMap = new Map(prev);
            newMap.set(index, result.awarded);
            return newMap;
          });
          // Reset click count after opening
          setPackClickCounts((prev) => {
            const newMap = new Map(prev);
            newMap.set(index, 0);
            return newMap;
          });
          // Mark this pack as opened - keep it selected and don't reset clickedPackIndex
          // This keeps other packs hidden and the opened pack stays in its down position
          setOpenedPackIndex(index);
          // Keep clickedPackIndex set so other packs remain hidden
          // Don't reset clickedPackIndex to null - this would make all packs visible again
        } catch (error) {
          console.error("Failed to open pack:", error);
          // Reset click count on error
          setPackClickCounts((prev) => {
            const newMap = new Map(prev);
            newMap.set(index, 0);
            return newMap;
          });
        }
      }
    }
  };

  return (
    <div className={`w-full h-full ${className} relative`}>
      {/* 2D Overlay - shown when pack is opened */}
      {[0, 1, 2].map((index) => {
        const showOverlay = overlayVisible.get(index);
        const cards = openedCards.get(index);
        if (!showOverlay || !cards || cards.length === 0) return null;
        return (
          <div
            key={`overlay-${index}`}
            className="absolute inset-0 pointer-events-auto z-10 flex items-center justify-center"
          >
            <CardDrawings cards={cards} onClose={handleReset} />
          </div>
        );
      })}
      {/* X button overlay - positioned on right side */}
      {(clickedPackIndex !== null || openedPackIndex !== null) &&
        !Array.from(overlayVisible.values()).some((visible) => visible) && (
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
      >
        <ColorEnhancement />
        <WebGLContextHandler />
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
          {clickedPackIndex === null ||
          clickedPackIndex === 0 ||
          openedPackIndex === 0 ? (
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1}
              position={packConfigs[0].position}
              rotation={packConfigs[0].rotation}
              autoRotate={false}
              overlayImageUrl={sets[0]?.coverImage}
              setTitle={sets[0]?.name}
              enableBobbing={
                clickedPackIndex === null &&
                openedPackIndex === null &&
                animatingPackIndex === null &&
                selectedPackIndex === null
              }
              bobbingOffset={0}
              bobbingSpeed={1.2}
              bobbingAmplitude={0.08}
              onClick={() => handlePackClick(0)}
              clickable={!isLocked}
              hoverable={!isLocked}
              originalPosition={packConfigs[0].position}
              originalRotation={packConfigs[0].rotation}
              resetTrigger={
                packToReset === 0 && resetTrigger > 0 ? resetTrigger : undefined
              }
              onResetComplete={
                packToReset === 0 ? handleResetComplete : undefined
              }
              onAnimationComplete={
                animatingPackIndex === 0
                  ? () => handleAnimationComplete(0)
                  : undefined
              }
              isSelected={selectedPackIndex === 0}
              cards={openedCards.get(0)}
              onShowOverlay={(show) => {
                setOverlayVisible((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(0, show);
                  return newMap;
                });
              }}
            />
          ) : null}
          {/* middle card */}
          {clickedPackIndex === null ||
          clickedPackIndex === 1 ||
          openedPackIndex === 1 ? (
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1}
              position={packConfigs[1].position}
              rotation={packConfigs[1].rotation}
              autoRotate={false}
              overlayImageUrl={sets[1]?.coverImage}
              setTitle={sets[1]?.name}
              enableBobbing={
                clickedPackIndex === null &&
                openedPackIndex === null &&
                animatingPackIndex === null &&
                selectedPackIndex === null
              }
              bobbingOffset={Math.PI * 0.33}
              bobbingSpeed={1.2}
              bobbingAmplitude={0.08}
              onClick={() => handlePackClick(1)}
              clickable={!isLocked}
              hoverable={!isLocked}
              originalPosition={packConfigs[1].position}
              originalRotation={packConfigs[1].rotation}
              resetTrigger={
                packToReset === 1 && resetTrigger > 0 ? resetTrigger : undefined
              }
              onResetComplete={
                packToReset === 1 ? handleResetComplete : undefined
              }
              onAnimationComplete={
                animatingPackIndex === 1
                  ? () => handleAnimationComplete(1)
                  : undefined
              }
              isSelected={selectedPackIndex === 1}
              cards={openedCards.get(1)}
              onShowOverlay={(show) => {
                setOverlayVisible((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(1, show);
                  return newMap;
                });
              }}
            />
          ) : null}
          {/* right card */}
          {clickedPackIndex === null ||
          clickedPackIndex === 2 ||
          openedPackIndex === 2 ? (
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              scale={1}
              position={packConfigs[2].position}
              rotation={packConfigs[2].rotation}
              autoRotate={false}
              overlayImageUrl={sets[2]?.coverImage}
              setTitle={sets[2]?.name}
              enableBobbing={
                clickedPackIndex === null &&
                openedPackIndex === null &&
                animatingPackIndex === null &&
                selectedPackIndex === null
              }
              bobbingOffset={Math.PI * 0.66}
              bobbingSpeed={1.2}
              bobbingAmplitude={0.08}
              onClick={() => handlePackClick(2)}
              clickable={!isLocked}
              hoverable={!isLocked}
              originalPosition={packConfigs[2].position}
              originalRotation={packConfigs[2].rotation}
              resetTrigger={
                packToReset === 2 && resetTrigger > 0 ? resetTrigger : undefined
              }
              onResetComplete={
                packToReset === 2 ? handleResetComplete : undefined
              }
              onAnimationComplete={
                animatingPackIndex === 2
                  ? () => handleAnimationComplete(2)
                  : undefined
              }
              isSelected={selectedPackIndex === 2}
              cards={openedCards.get(2)}
              onShowOverlay={(show) => {
                setOverlayVisible((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(2, show);
                  return newMap;
                });
              }}
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
