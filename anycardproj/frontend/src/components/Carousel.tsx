import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { PackModelMesh } from "./packModel";
import { getAllSets } from "../api/api";
import type { Set } from "@full-stack/types";
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
import cardpackModelUrl from "../assets/cardpack2.glb?url";

interface PackData {
  overlayImageUrl: string;
  setTitle: string;
}

interface CarouselProps {
  duplicate?: number;
  Duration?: number;
  delayBetweenPacks?: number;
  className?: string;
  scrollSpeed?: number; // Time in ms to scroll one item
  pauseDuration?: number; // Time in ms to pause between scrolls
}

const Carousel = ({
  duplicate = 10,
  Duration = 18,
  delayBetweenPacks = 2,
  className = "",
  scrollSpeed = 2000, // Default: 2 seconds to scroll one item
  pauseDuration = 1500, // Default: 1.5 seconds pause between scrolls
}: CarouselProps) => {
  const [packData, setPackData] = useState<PackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedPacks, setDisplayedPacks] = useState<PackData[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemWidth = 300; // Width of each pack item
  // Track which Canvas indices should stay mounted (expanding window, never shrinking immediately)
  const mountedIndicesRef = useRef(new Set<number>());

  // Fetch sets from API
  useEffect(() => {
    const fetchSets = async () => {
      try {
        setIsLoading(true);
        const sets = await getAllSets();
        // Filter out sets with invalid coverImage values and transform to PackData
        const transformedData: PackData[] = sets
          .filter(
            (set: Set) =>
              set.coverImage &&
              typeof set.coverImage === "string" &&
              set.coverImage.trim() !== ""
          )
          .map((set: Set) => ({
            overlayImageUrl: set.coverImage!,
            setTitle: set.name,
          }));
        setPackData(transformedData);
      } catch (error) {
        console.error("Failed to fetch sets:", error);
        setPackData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
  }, []);

  // Create infinite loop of packs
  useEffect(() => {
    // Don't process if still loading or if packData is empty
    if (isLoading || packData.length === 0) {
      setDisplayedPacks([]);
      return;
    }

    // Generate enough packs to create seamless infinite loop
    // Duplicate the array multiple times to ensure smooth scrolling
    const packsToShow: PackData[] = [];

    for (let i = 0; i < duplicate; i++) {
      packsToShow.push(...packData);
    }

    setDisplayedPacks(packsToShow);
  }, [packData, duplicate, isLoading]);

  // Initialize scroll position when displayedPacks changes
  useEffect(() => {
    if (displayedPacks.length > 0) {
      const totalWidth = displayedPacks.length * itemWidth;
      const initialPos = Math.max(0, totalWidth - itemWidth * duplicate);
      setScrollPosition(initialPos);
    }
  }, [displayedPacks.length, duplicate, itemWidth]);

  // Auto-scroll with pauses
  useEffect(() => {
    if (displayedPacks.length === 0) return;

    let scrollTimeout: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;

    const startScrolling = () => {
      setIsScrolling(true);

      // Scroll to next position (decrementing for left-to-right scroll)
      scrollTimeout = setTimeout(() => {
        setScrollPosition((prev) => {
          const totalWidth = displayedPacks.length * itemWidth;
          const nextPosition = prev - itemWidth;

          // Reset to end when we've scrolled past the beginning
          // This creates the infinite loop effect
          if (nextPosition <= 0) {
            return Math.max(0, totalWidth - itemWidth * duplicate);
          }

          return nextPosition;
        });

        // After scrolling, pause
        setIsScrolling(false);

        // After pause duration, start scrolling again
        pauseTimeout = setTimeout(() => {
          startScrolling();
        }, pauseDuration);
      }, scrollSpeed);
    };

    // Start the scrolling cycle
    startScrolling();

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(pauseTimeout);
    };
  }, [displayedPacks.length, scrollSpeed, pauseDuration, duplicate, itemWidth]);

  // Calculate visible range to optimize rendering (only render visible + buffer)
  // Limit to max 5 concurrent Canvas instances to prevent WebGL context loss
  const maxConcurrentCanvases = 5;
  const visibleStart = Math.max(0, Math.floor(scrollPosition / itemWidth) - 1);
  const visibleEnd = Math.min(
    displayedPacks.length,
    visibleStart + maxConcurrentCanvases
  );

  // Update mounted indices: expand window to include visible range, but keep old ones mounted
  // Only remove indices that are far outside the visible range
  useEffect(() => {
    if (displayedPacks.length === 0) return;

    const currentMounted = mountedIndicesRef.current;

    // Add all indices in the visible range
    for (let i = visibleStart; i < visibleEnd; i++) {
      currentMounted.add(i);
    }

    // Remove indices that are far outside the visible range (more than maxConcurrentCanvases away)
    const removalThreshold = maxConcurrentCanvases * 2;
    for (const index of currentMounted) {
      if (
        index < visibleStart - removalThreshold ||
        index >= visibleEnd + removalThreshold
      ) {
        currentMounted.delete(index);
      }
    }
  }, [visibleStart, visibleEnd, displayedPacks.length, maxConcurrentCanvases]);

  // Memoize rotation prop to prevent PackModelMesh from resetting rotation on re-renders
  const rotationProp = useMemo(
    () => [0, 0, 90] as [number, number, number],
    []
  );

  // Component to enhance color vibrancy via tone mapping
  function ColorEnhancement() {
    const { gl } = useThree();
    useEffect(() => {
      gl.toneMappingExposure = 1.2;
    }, [gl]);
    return null;
  }

  // Don't render anything until data is loaded and available
  if (isLoading || displayedPacks.length === 0) {
    return null;
  }

  // Track which Canvas instances should be active (mounted)
  // Use the ref-based set to determine if a canvas should stay mounted
  const shouldMountCanvas = (index: number) => {
    return mountedIndicesRef.current.has(index);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-[40vh] overflow-hidden w-full ${className}`}
    >
      <div
        className="flex absolute top-0 left-0 h-full transition-transform ease-in-out"
        style={{
          transform: `translateX(-${scrollPosition}px)`,
          transitionDuration: `${scrollSpeed}ms`,
          transitionTimingFunction: isScrolling ? "linear" : "ease-out",
        }}
      >
        {displayedPacks.map((pack, index) => {
          const isVisible = index >= visibleStart && index < visibleEnd;
          const shouldMount = shouldMountCanvas(index);

          // Create a stable key based on pack content and index to help React preserve component state
          const stableKey = `${pack.overlayImageUrl}-${pack.setTitle}-${index}`;

          return (
            <div
              key={stableKey}
              className="flex-shrink-0 w-[300px] h-full relative"
            >
              {shouldMount ? (
                <div
                  className="w-full h-full"
                  style={{
                    visibility: isVisible ? "visible" : "hidden",
                    pointerEvents: isVisible ? "auto" : "none",
                  }}
                >
                  <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    gl={{ antialias: true }}
                    onCreated={({ gl }) => {
                      // Handle WebGL context loss
                      const canvas = gl.domElement;
                      const handleContextLost = (event: Event) => {
                        event.preventDefault();
                        console.warn("WebGL context lost in Carousel");
                      };
                      const handleContextRestored = () => {
                        // WebGL context restored
                      };
                      canvas.addEventListener(
                        "webglcontextlost",
                        handleContextLost
                      );
                      canvas.addEventListener(
                        "webglcontextrestored",
                        handleContextRestored
                      );
                      return () => {
                        canvas.removeEventListener(
                          "webglcontextlost",
                          handleContextLost
                        );
                        canvas.removeEventListener(
                          "webglcontextrestored",
                          handleContextRestored
                        );
                      };
                    }}
                  >
                    <ColorEnhancement />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={10} />
                    <pointLight position={[-10, -10, -5]} intensity={0.4} />
                    <Environment preset="studio" />
                    <Suspense fallback={null}>
                      <PackModelMesh
                        modelPath={cardpackModelUrl}
                        diffuseTexture={diffuseTextureUrl}
                        normalTexture={normalTextureUrl}
                        rotation={rotationProp}
                        autoRotate={true}
                        rotationAxis="x"
                        setTitle={pack.setTitle}
                        overlayImageUrl={pack.overlayImageUrl}
                        hoverable={false}
                        clickable={false}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
