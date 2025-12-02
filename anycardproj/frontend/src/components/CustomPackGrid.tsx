import { Suspense, useEffect, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { PackModelMesh } from "./packModel";
import { getAllCustomSets, openPack } from "../api/api";
import type { Set, Card } from "@full-stack/types";
import { useAuth } from "../auth/authProvider";
import CardDrawings from "./CardDrawings";
import { Mesh, MeshStandardMaterial } from "three";
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
import cardpackModelUrl from "../assets/cardpack2.glb?url";

// Pack grid layout constants
const PACK_SCALE = 1;
const PACK_SPACING = 2.5;
const PACK_START_X = -(3 - 1) * PACK_SPACING * 0.54;
const ROW_HEIGHT = "70vh";

interface CustomPackGridProps {
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

const CustomPackGrid = ({
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
}: CustomPackGridProps) => {
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // clickedPackIndex - tracks which pack is clicked (for first click animation)
  const [clickedPackIndex, setClickedPackIndex] = useState<number | null>(null);
  // animatingPackIndex - tracks which pack is currently animating to center
  const [animatingPackIndex, setAnimatingPackIndex] = useState<number | null>(
    null
  );
  // selectedPackIndex - tracks which pack is selected (after animation completes, ready for second click)
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(
    null
  );
  // resetTrigger - triggers reset animation
  const [resetTrigger, setResetTrigger] = useState(0);
  // packToReset - tracks which pack should be reset
  const [packToReset, setPackToReset] = useState<number | null>(null);
  // packClickCounts - tracks click counts for each pack
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

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setIsLoading(true);
        const allSets = await getAllCustomSets();
        // Filter out sets with invalid coverImage values
        const validSets = allSets.filter(
          (set: Set) =>
            set.coverImage &&
            typeof set.coverImage === "string" &&
            set.coverImage.trim() !== ""
        );
        setSets(validSets);
      } catch (error) {
        console.error("Failed to fetch custom sets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
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
        console.warn("WebGL context lost in CustomPackGrid");
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
        console.log("WebGL context restored in CustomPackGrid");
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
    // Use selectedPackIndex if available, otherwise use animatingPackIndex or clickedPackIndex
    const packIndexToReset =
      selectedPackIndex ?? animatingPackIndex ?? clickedPackIndex;
    // Immediately restore all packs (rerender other cards)
    setClickedPackIndex(null);
    setAnimatingPackIndex(null); // Clear animating state
    setSelectedPackIndex(null); // Clear selected state
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
  }, [selectedPackIndex, animatingPackIndex, clickedPackIndex, onSelectionEnd]);

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
        animatingPackIndex !== null)
    ) {
      handleReset();
    }
  }, [
    isLocked,
    selectedPackIndex,
    clickedPackIndex,
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
      // First click: start animation (don't switch to detail view yet)
      setAnimatingPackIndex(index);
      // Notify parent that selection has started
      if (onSelectionStart) {
        onSelectionStart();
      }
    } else if (newCount === 2) {
      // Second click: open the pack
      const pack = sets[index];
      if (pack && user?.uid) {
        try {
          const result = await openPack(user.uid, pack.name, "customSets");
          console.log("Custom pack opened:", result);
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
          // Optionally reset the clicked pack index to show grid view
          setClickedPackIndex(null);
        } catch (error) {
          console.error("Failed to open custom pack:", error);
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

  // Group sets into rows of 3
  const rows: Set[][] = [];
  for (let i = 0; i < sets.length; i += 3) {
    rows.push(sets.slice(i, i + 3));
  }

  // Calculate position for a pack within a row (3 packs left to right)
  const getRowPosition = (colIndex: number): [number, number, number] => {
    return [PACK_START_X + colIndex * PACK_SPACING, 0, 1.5];
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-lg">Loading custom packs...</div>
      </div>
    );
  }

  // Grid view - separate canvas for each row
  return (
    <div className={`w-[90vw] mx-auto ${className} relative`}>
      {/* X button overlay - positioned on right side, shown when pack is selected */}
      {selectedPackIndex !== null &&
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
      <div className="flex flex-col gap-8 h-auto">
        {rows.map((rowSets, rowIndex) => {
          const startIndex = rowIndex * 3;
          return (
            <div
              key={`row-${rowIndex}`}
              className="w-full relative"
              style={{ height: ROW_HEIGHT }}
            >
              {/* 2D Overlay - shown when pack in this row is opened */}
              {rowSets.map((set, colIndex) => {
                const globalIndex = startIndex + colIndex;
                const showOverlay = overlayVisible.get(globalIndex);
                const cards = openedCards.get(globalIndex);
                if (!showOverlay || !cards || cards.length === 0) return null;
                return (
                  <div
                    key={`overlay-${globalIndex}`}
                    className="absolute inset-0 pointer-events-auto z-10 flex items-center justify-center"
                  >
                    <CardDrawings cards={cards} onClose={handleReset} />
                  </div>
                );
              })}
              <Canvas
                camera={{ position: cameraPosition, fov: cameraFov }}
                gl={{ antialias: true }}
                style={{ cursor: "pointer" }}
              >
                <ColorEnhancement />
                <WebGLContextHandler />
                <ambientLight intensity={ambientLightIntensity} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={directionalLightIntensity}
                />
                <pointLight position={[-10, -10, -5]} intensity={0.4} />
                <Environment preset="warehouse" />
                <Suspense fallback={null}>
                  {rowSets.map((set, colIndex) => {
                    const globalIndex = startIndex + colIndex;
                    const originalPosition = getRowPosition(colIndex);
                    const originalRotation: [number, number, number] = [
                      0, 0, 90,
                    ];

                    // Determine pack states
                    const isAnimating = animatingPackIndex === globalIndex;
                    const isSelected = selectedPackIndex === globalIndex;
                    // Hide other packs in the same row when one is animating or selected
                    const shouldHide =
                      (animatingPackIndex !== null &&
                        animatingPackIndex !== globalIndex) ||
                      (selectedPackIndex !== null &&
                        selectedPackIndex !== globalIndex);

                    // Don't render other packs in the same row when one is animating or selected
                    if (shouldHide) {
                      return null;
                    }

                    return (
                      <PackModelMesh
                        key={`${set.coverImage}-${set.name}-${globalIndex}`}
                        modelPath={cardpackModelUrl}
                        diffuseTexture={diffuseTextureUrl}
                        normalTexture={normalTextureUrl}
                        scale={PACK_SCALE}
                        position={originalPosition}
                        rotation={originalRotation}
                        autoRotate={false}
                        overlayImageUrl={set.coverImage}
                        setTitle={set.name}
                        enableBobbing={
                          !isAnimating &&
                          !isSelected &&
                          animatingPackIndex === null &&
                          selectedPackIndex === null
                        }
                        bobbingOffset={globalIndex * (Math.PI / sets.length)}
                        bobbingSpeed={1.2}
                        bobbingAmplitude={0.08}
                        onClick={() => handlePackClick(globalIndex)}
                        originalPosition={originalPosition}
                        originalRotation={originalRotation}
                        resetTrigger={
                          packToReset === globalIndex && resetTrigger > 0
                            ? resetTrigger
                            : undefined
                        }
                        onResetComplete={
                          packToReset === globalIndex
                            ? handleResetComplete
                            : undefined
                        }
                        onAnimationComplete={
                          isAnimating
                            ? () => handleAnimationComplete(globalIndex)
                            : undefined
                        }
                        isSelected={isSelected}
                        hoverable={!isLocked}
                        clickable={!isLocked}
                        cards={openedCards.get(globalIndex)}
                        onShowOverlay={(show) => {
                          setOverlayVisible((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(globalIndex, show);
                            return newMap;
                          });
                        }}
                      />
                    );
                  })}
                </Suspense>
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
        })}
      </div>
    </div>
  );
};

export default CustomPackGrid;




