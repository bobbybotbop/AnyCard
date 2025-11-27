import { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { PackModelMesh } from "./packModel";
import { getAllSets } from "../api/cards";
import type { Set } from "@full-stack/types";
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
import cardpackModelUrl from "../assets/cardpack2.glb?url";

interface PackData {
  overlayImageUrl: string;
  setTitle: string;
}

interface PackGridProps {
  className?: string;
}

const PackGrid = ({ className = "" }: PackGridProps) => {
  const [packData, setPackData] = useState<PackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sets from API - same logic as Carousel
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

  // Component to enhance color vibrancy via tone mapping
  function ColorEnhancement() {
    const { gl } = useThree();
    useEffect(() => {
      gl.toneMappingExposure = 1.2;
    }, [gl]);
    return null;
  }

  // Don't render anything until data is loaded
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 ${className}`}
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (packData.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No packs available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 ${className}`}
    >
      {packData.map((pack, index) => (
        <div
          key={`${pack.overlayImageUrl}-${pack.setTitle}-${index}`}
          className="w-full aspect-square relative rounded-lg overflow-hidden"
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true }}
            onCreated={({ gl }) => {
              // Handle WebGL context loss
              const canvas = gl.domElement;
              const handleContextLost = (event: Event) => {
                event.preventDefault();
                console.warn("WebGL context lost in PackGrid");
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
            <PackModelMesh
              modelPath={cardpackModelUrl}
              diffuseTexture={diffuseTextureUrl}
              normalTexture={normalTextureUrl}
              rotation={[0, 0, 90]}
              position={[0, 0, 1.5]}
              autoRotate={false}
              rotationAxis="x"
              setTitle={pack.setTitle}
              overlayImageUrl={pack.overlayImageUrl}
              hoverable={true}
              clickable={false}
            />
          </Canvas>
        </div>
      ))}
    </div>
  );
};

export default PackGrid;
