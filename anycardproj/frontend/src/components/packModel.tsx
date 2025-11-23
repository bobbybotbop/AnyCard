import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import type { Texture, Material } from "three";
import {
  Mesh,
  TextureLoader,
  MeshStandardMaterial as StandardMaterial,
  MathUtils as mu,
  SRGBColorSpace,
  CanvasTexture,
} from "three";

// Import textures using Vite's asset handling with ?url suffix to get the URL string
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
// Import the 3D model - useGLTF can handle both imported URLs and string paths
import cardpackModelUrl from "../assets/cardpack2.glb?url";

// Background overlay constants (position and dimensions in pixels)
// These values are relative to the canvas size
// const BACKGROUND_X = 665; // X position in pixels
// const BACKGROUND_Y = 124; // Y position in pixels
// const BACKGROUND_WIDTH = 580; // Width in pixels
// const BACKGROUND_HEIGHT = 850; // Height in pixels

// Overlay size constants
const MAX_WIDTH = 500; // Maximum width in pixels for overlay image
const MAX_HEIGHT = 300; // Maximum height in pixels for overlay image
const TRANSLATE_OVERLAY_Y = -100;
// Utility function to composite overlay image over diffuse texture using Canvas
async function compositeTextures(
  diffuseTextureUrl: string,
  overlayImageUrl: string,
  overlayX: number,
  overlayY: number,
  overlayWidth: number,
  overlayHeight: number
): Promise<{
  texture: Texture;
  canvasDataUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  canvas: HTMLCanvasElement;
}> {
  return new Promise((resolve, reject) => {
    // Load both images
    const baseImage = new Image();
    const overlayImage = new Image();

    // Set crossOrigin to handle CORS issues
    baseImage.crossOrigin = "anonymous";
    overlayImage.crossOrigin = "anonymous";

    let baseLoaded = false;
    let overlayLoaded = false;

    const checkAndComposite = () => {
      if (baseLoaded && overlayLoaded) {
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw base diffuse texture
        ctx.drawImage(baseImage, 0, 0);

        // Draw background behind overlay image
        // ctx.fillStyle = "#000000"; // Black color
        // ctx.fillRect(
        //   BACKGROUND_X,
        //   BACKGROUND_Y,
        //   BACKGROUND_WIDTH,
        //   BACKGROUND_HEIGHT
        // );

        // Calculate overlay size based on MAX_WIDTH and MAX_HEIGHT limits while maintaining aspect ratio
        const overlayImageAspect = overlayImage.width / overlayImage.height;

        // Calculate scale factor to fit within both MAX_WIDTH and MAX_HEIGHT
        // Use the smaller scale factor to ensure both dimensions fit within their limits
        const scaleFactor = Math.min(
          MAX_WIDTH / overlayImage.width,
          MAX_HEIGHT / overlayImage.height
        );

        // Calculate target dimensions maintaining aspect ratio
        let targetWidth = overlayImage.width * scaleFactor;
        let targetHeight = overlayImage.height * scaleFactor;

        // Ensure we don't exceed MAX_WIDTH or MAX_HEIGHT
        if (targetWidth > MAX_WIDTH) {
          targetWidth = MAX_WIDTH;
          targetHeight = MAX_WIDTH / overlayImageAspect;
        }
        if (targetHeight > MAX_HEIGHT) {
          targetHeight = MAX_HEIGHT;
          targetWidth = MAX_HEIGHT * overlayImageAspect;
        }

        // Calculate centered position on the canvas
        const drawX = (baseImage.width - targetWidth) / 2;
        const drawY =
          (baseImage.height - targetHeight) / 2 + -TRANSLATE_OVERLAY_Y;

        // Use the calculated dimensions
        const drawWidth = targetWidth;
        const drawHeight = targetHeight;

        // Debug logging
        console.log("Drawing overlay:", {
          drawX,
          drawY,
          drawWidth,
          drawHeight,
          overlayImageWidth: overlayImage.width,
          overlayImageHeight: overlayImage.height,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
        });

        // Draw overlay image at the top-left of the specified area
        ctx.drawImage(overlayImage, drawX, drawY, drawWidth, drawHeight);

        // Get canvas as data URL for visualization
        const canvasDataUrl = canvas.toDataURL("image/png");

        // Create texture from canvas
        // Ensure canvas has valid dimensions
        if (canvas.width === 0 || canvas.height === 0) {
          reject(new Error("Canvas has invalid dimensions"));
          return;
        }

        // Use CanvasTexture directly - it needs the canvas to remain in memory
        // Store a reference to the canvas to prevent garbage collection
        const texture = new CanvasTexture(canvas);
        texture.flipY = false;
        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;

        // Store reference to canvas so it's not garbage collected
        // CanvasTexture stores the canvas in its image property, but we keep an extra reference
        (texture as any)._canvas = canvas;

        console.log("Canvas texture created successfully", {
          textureType: texture.constructor.name,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          hasImage: !!(texture as any).image,
        });

        resolve({
          texture,
          canvasDataUrl,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          canvas: canvas, // Return canvas to keep it alive
        });
      }
    };

    baseImage.onload = () => {
      baseLoaded = true;
      console.log("Base image loaded:", {
        width: baseImage.width,
        height: baseImage.height,
      });
      checkAndComposite();
    };
    baseImage.onerror = (error) => {
      console.error("Failed to load base diffuse texture:", error);
      reject(new Error("Failed to load base diffuse texture"));
    };

    overlayImage.onload = () => {
      overlayLoaded = true;
      console.log("Overlay image loaded:", {
        width: overlayImage.width,
        height: overlayImage.height,
        src: overlayImage.src,
      });
      checkAndComposite();
    };
    overlayImage.onerror = (error) => {
      console.error("Failed to load overlay image:", error, overlayImageUrl);
      reject(new Error("Failed to load overlay image"));
    };

    // Start loading images
    baseImage.src = diffuseTextureUrl;
    overlayImage.src = overlayImageUrl;
  });
}

// Component to load and render the pack model
// Can be used standalone inside a Canvas or via PackModel wrapper
export function PackModelMesh({
  modelPath,
  diffuseTexture,
  normalTexture,
  rotationSpeed = 0.5,
  rotationAxis = "y",
  autoRotate = false,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rotationCenter,
  overlayImageUrl,
  overlayX = 0,
  overlayY = 0,
  overlayWidth = 1,
  overlayHeight = 1,
  onCanvasReady,
}: {
  modelPath: string;
  diffuseTexture: string;
  normalTexture: string;
  rotationSpeed?: number;
  rotationAxis?: "x" | "y" | "z";
  autoRotate?: boolean;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  rotationCenter?: [number, number, number]; // Center point for rotation (pivot)
  overlayImageUrl?: string; // Optional overlay image URL
  overlayX?: number; // Overlay X position (normalized 0-1)
  overlayY?: number; // Overlay Y position (normalized 0-1)
  overlayWidth?: number; // Overlay width (normalized 0-1)
  overlayHeight?: number; // Overlay height (normalized 0-1)
  onCanvasReady?: (
    canvasDataUrl: string,
    canvasWidth: number,
    canvasHeight: number
  ) => void; // Callback to expose canvas data URL and dimensions
}) {
  const { scene: originalScene } = useGLTF(modelPath);
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);
  const texturesRef = useRef<Texture[]>([]);
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const isMountedRef = useRef(true);

  // Clone the scene for each instance so multiple models can be rendered independently
  // Without cloning, all instances would share the same Three.js object and appear at the same position
  // Also clone materials to prevent texture sharing between instances
  const scene = useMemo(() => {
    const clonedScene = originalScene.clone();
    // Clone materials to ensure each instance has its own material and textures
    clonedScene.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });
    return clonedScene;
  }, [originalScene]);

  // Rotate the model automatically
  useFrame((state, delta) => {
    const targetRef = rotationCenter ? groupRef : meshRef;
    if (targetRef.current && autoRotate) {
      if (rotationAxis === "x") {
        targetRef.current.rotation.x += delta * rotationSpeed;
      } else if (rotationAxis === "y") {
        targetRef.current.rotation.y += delta * rotationSpeed;
      } else if (rotationAxis === "z") {
        targetRef.current.rotation.z += delta * rotationSpeed;
      }
    }
  });

  // Apply textures to materials
  useEffect(() => {
    //faces card fowards to the user, add to this initial value later

    isMountedRef.current = true;
    const loader = new TextureLoader();

    // Dispose of old textures before loading new ones
    texturesRef.current.forEach((texture) => {
      texture.dispose();
    });
    texturesRef.current = [];

    // Clear old canvas references (canvases are kept alive by CanvasTexture)
    canvasRef.current = [];

    scene.traverse((child) => {
      if (child instanceof Mesh) {
        const mesh = child as Mesh;
        if (mesh.material) {
          // Store reference to old texture for cleanup
          const applyTexture = (newTex: Texture, normalTex: Texture) => {
            if (!isMountedRef.current) {
              newTex.dispose();
              normalTex.dispose();
              return;
            }

            // Validate textures before applying
            if (!newTex) {
              console.error("Cannot apply undefined texture");
              return;
            }
            if (!normalTex) {
              console.error("Cannot apply undefined normal texture");
              return;
            }

            texturesRef.current.push(newTex);

            // Apply textures to material
            if (mesh.material instanceof StandardMaterial) {
              // Dispose old texture if it exists
              if (mesh.material.map && mesh.material.map !== newTex) {
                const oldTex = mesh.material.map;
                if (!texturesRef.current.includes(oldTex)) {
                  oldTex.dispose();
                }
              }
              mesh.material.map = newTex;
              mesh.material.normalMap = normalTex;
              // Enhance color saturation by adjusting material properties
              mesh.material.color.setRGB(1.1, 1.1, 1.1); // Slight color boost
              mesh.material.needsUpdate = true;
              // Ensure texture is updated
              if (newTex instanceof CanvasTexture) {
                newTex.needsUpdate = true;
              }
            } else if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat: Material) => {
                if (mat instanceof StandardMaterial) {
                  // Dispose old texture if it exists
                  if (mat.map && mat.map !== newTex) {
                    const oldTex = mat.map;
                    if (!texturesRef.current.includes(oldTex)) {
                      oldTex.dispose();
                    }
                  }
                  mat.map = newTex;
                  mat.normalMap = normalTex;
                  // Enhance color saturation by adjusting material properties
                  mat.color.setRGB(1.1, 1.1, 1.1); // Slight color boost
                  mat.needsUpdate = true;
                  // Ensure texture is updated
                  if (newTex instanceof CanvasTexture) {
                    newTex.needsUpdate = true;
                  }
                }
              });
            }
          };

          // Check if overlay image is provided
          if (overlayImageUrl) {
            // Composite overlay with diffuse texture
            compositeTextures(
              diffuseTexture,
              overlayImageUrl,
              overlayX,
              overlayY,
              overlayWidth,
              overlayHeight
            )
              .then(
                ({
                  texture: compositedTex,
                  canvasDataUrl,
                  canvasWidth,
                  canvasHeight,
                  canvas,
                }) => {
                  if (!isMountedRef.current) {
                    compositedTex.dispose();
                    return;
                  }

                  // Store canvas reference to prevent garbage collection
                  canvasRef.current.push(canvas);

                  // Call callback with canvas data URL and dimensions if provided
                  if (onCanvasReady) {
                    onCanvasReady(canvasDataUrl, canvasWidth, canvasHeight);
                  }

                  // Load normal texture
                  loader.load(normalTexture, (normalTex: Texture) => {
                    if (!isMountedRef.current) {
                      compositedTex.dispose();
                      normalTex.dispose();
                      return;
                    }

                    normalTex.flipY = false;
                    console.log("Applying composited texture to material");
                    applyTexture(compositedTex, normalTex);
                    console.log("Texture applied successfully");
                  });
                }
              )
              .catch((error) => {
                console.error("Failed to composite textures:", error);
                if (!isMountedRef.current) return;

                // Fallback to regular diffuse texture loading
                loader.load(diffuseTexture, (diffuseTex: Texture) => {
                  if (!isMountedRef.current) {
                    diffuseTex.dispose();
                    return;
                  }

                  diffuseTex.flipY = false;
                  diffuseTex.colorSpace = SRGBColorSpace;

                  loader.load(normalTexture, (normalTex: Texture) => {
                    if (!isMountedRef.current) {
                      diffuseTex.dispose();
                      normalTex.dispose();
                      return;
                    }

                    normalTex.flipY = false;
                    applyTexture(diffuseTex, normalTex);
                  });
                });
              });
          } else {
            // No overlay - use existing logic to load diffuse texture directly
            loader.load(diffuseTexture, (diffuseTex: Texture) => {
              if (!isMountedRef.current) {
                diffuseTex.dispose();
                return;
              }

              diffuseTex.flipY = false;
              // Set color space to sRGB for more vibrant colors
              diffuseTex.colorSpace = SRGBColorSpace;

              // Load normal texture
              loader.load(normalTexture, (normalTex: Texture) => {
                if (!isMountedRef.current) {
                  diffuseTex.dispose();
                  normalTex.dispose();
                  return;
                }

                normalTex.flipY = false;
                applyTexture(diffuseTex, normalTex);
              });
            });
          }
        }
      }
    });

    // Cleanup function to dispose textures
    return () => {
      isMountedRef.current = false;
      texturesRef.current.forEach((texture) => {
        texture.dispose();
      });
      texturesRef.current = [];
    };
  }, [
    scene,
    diffuseTexture,
    normalTexture,
    overlayImageUrl,
    overlayX,
    overlayY,
    overlayWidth,
    overlayHeight,
  ]);

  // Handle scale - can be a number or array
  const scaleValue = Array.isArray(scale) ? scale : [scale, scale, scale];

  // Base rotation: Y=90° to orient the model correctly
  const baseRotation = [mu.degToRad(0), mu.degToRad(90), mu.degToRad(0)];
  const finalRotation = rotation.map(
    (deg, i) => mu.degToRad(deg) + baseRotation[i]
  ) as [number, number, number];

  // Set rotation order to ZXY to fix X/Z axis conflation issue
  //
  // DETAILED EXPLANATION OF EULER ANGLES AND ROTATION ORDER:
  //
  // Euler angles represent rotations as three separate rotations around X, Y, and Z axes.
  // However, the ORDER in which these rotations are applied matters critically!
  //
  // PROBLEM WITH DEFAULT 'XYZ' ORDER:
  // With XYZ order and baseRotation = [0°, 90°, 0°] (Y=90°), here's what happens:
  //   1. Rotate around X-axis by user's X value (e.g., 30°)
  //   2. Rotate around Y-axis by 90° (this rotates the ENTIRE coordinate system!)
  //   3. Rotate around Z-axis by user's Z value (e.g., 30°)
  //
  // After step 2, the coordinate system has been rotated 90° around Y. This means:
  //   - What was originally the +X axis is now pointing in the +Z direction
  //   - What was originally the +Z axis is now pointing in the -X direction
  //
  // So when you rotate around X in step 1, then rotate 90° around Y, then rotate around Z:
  //   - The Z rotation in step 3 happens in a coordinate system where X and Z have swapped!
  //   - Result: X and Z rotations appear to control the same visual axis
  //
  // SOLUTION WITH 'ZXY' ORDER:
  // By changing the order to ZXY, rotations are applied as:
  //   1. Rotate around Z-axis by user's Z value (e.g., 30°)
  //   2. Rotate around X-axis by user's X value (e.g., 30°)
  //   3. Rotate around Y-axis by 90° (base rotation, applied last)
  //
  // Why this works:
  //   - Z and X rotations happen FIRST, in the original coordinate system
  //   - They are independent because they operate on perpendicular axes
  //   - The Y=90° rotation happens LAST, so it doesn't affect the relative independence
  //     of X and Z rotations that were already applied
  //
  // VISUAL ANALOGY:
  // Think of it like rotating a book:
  //   - XYZ order: Flip pages (X), then rotate book 90° (Y), then tilt cover (Z)
  //     → After rotating 90°, "flip pages" and "tilt cover" affect the same edge!
  //   - ZXY order: Tilt cover (Z), flip pages (X), then rotate book 90° (Y)
  //     → Tilt and flip happen before the big rotation, so they stay independent
  //
  // MATHEMATICAL PERSPECTIVE:
  // Rotation matrices are multiplied: R_final = R_Y * R_X * R_Z (for ZXY order)
  // When Y=90°, R_Y causes a coordinate system swap. By applying it last (rightmost),
  // the X and Z rotations (R_X and R_Z) are applied in the original coordinate system
  // where they are truly independent.
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.order = "ZXY";
    }
    if (groupRef.current) {
      groupRef.current.rotation.order = "ZXY";
    }
  }, []);

  // If rotationCenter is specified, wrap in a Group to handle pivot point
  if (rotationCenter) {
    // Calculate relative position: object position - rotation center
    const relativePosition: [number, number, number] = [
      position[0] - rotationCenter[0],
      position[1] - rotationCenter[1],
      position[2] - rotationCenter[2],
    ];

    return (
      <group ref={groupRef} position={rotationCenter} rotation={finalRotation}>
        <primitive
          ref={meshRef}
          object={scene}
          scale={scaleValue}
          position={relativePosition}
        />
      </group>
    );
  }

  // Default behavior: rotate around object's origin
  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={scaleValue}
      position={position}
      rotation={finalRotation}
    />
  );
}

interface PackModelProps {
  className?: string;
  modelPath?: string;
  // Rotation settings
  rotationSpeed?: number; // Speed of rotation (default: 0.5)
  rotationAxis?: "x" | "y" | "z"; // Axis to rotate around (default: "y")
  autoRotate?: boolean; // Enable/disable auto rotation (default: true)
  rotation?: [number, number, number]; // Rotation offset in degrees [x, y, z] (default: [0, 0, 0])
  rotationCenter?: [number, number, number]; // Center point for rotation (pivot) in world space (default: undefined, rotates around object origin)
  // Size and position
  scale?: number | [number, number, number]; // Scale factor or [x, y, z] scale (default: 1)
  position?: [number, number, number]; // Position [x, y, z] (default: [0, 0, 0])
  // Camera settings
  cameraPosition?: [number, number, number]; // Camera position [x, y, z] (default: [0, 0, 5])
  cameraFov?: number; // Camera field of view (default: 50)
  // Lighting settings
  ambientLightIntensity?: number; // Ambient light intensity (default: 0.5)
  directionalLightIntensity?: number; // Directional light intensity (default: 1)
  // Controls settings
  enableZoom?: boolean; // Enable zoom controls (default: true)
  enableRotate?: boolean; // Enable rotate controls (default: true)
  enablePan?: boolean; // Enable pan controls (default: false)
  minDistance?: number; // Minimum zoom distance (default: 3)
  maxDistance?: number; // Maximum zoom distance (default: 10)
  interactive?: boolean; // Enable/disable all user input (default: true)
  // Overlay settings
  overlayImageUrl?: string; // Optional overlay image URL to composite over diffuse texture
  overlayX?: number; // Overlay X position (normalized 0-1, default: 0)
  overlayY?: number; // Overlay Y position (normalized 0-1, default: 0)
  overlayWidth?: number; // Overlay width (normalized 0-1, default: 1)
  overlayHeight?: number; // Overlay height (normalized 0-1, default: 1)
  // Canvas callback
  onCanvasReady?: (
    canvasDataUrl: string,
    canvasWidth: number,
    canvasHeight: number
  ) => void; // Callback to expose canvas data URL and dimensions
}

export default function PackModel({
  className = "",
  modelPath,
  rotationSpeed = 0.5,
  rotationAxis = "y",
  autoRotate = false,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rotationCenter,
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  ambientLightIntensity = 0.5,
  directionalLightIntensity = 1,
  enableZoom = true,
  enableRotate = true,
  enablePan = false,
  minDistance = 3,
  maxDistance = 10,
  interactive = true,
  overlayImageUrl,
  overlayX = 0,
  overlayY = 0,
  overlayWidth = 1,
  overlayHeight = 1,
  onCanvasReady,
}: PackModelProps) {
  // Default model path - using cardpack2.glb from assets folder
  // You can override this by passing a custom modelPath prop
  // If no custom path is provided, use the imported model URL
  const defaultModelPath = modelPath || cardpackModelUrl;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={directionalLightIntensity}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Environment for better lighting */}
        <Environment preset="sunset" />

        {/* Model */}
        <Suspense fallback={null}>
          <PackModelMesh
            modelPath={defaultModelPath}
            diffuseTexture={diffuseTextureUrl}
            normalTexture={normalTextureUrl}
            rotationSpeed={rotationSpeed}
            rotationAxis={rotationAxis}
            autoRotate={autoRotate}
            scale={scale}
            position={position}
            rotation={rotation}
            rotationCenter={rotationCenter}
            overlayImageUrl={overlayImageUrl}
            overlayX={overlayX}
            overlayY={overlayY}
            overlayWidth={overlayWidth}
            overlayHeight={overlayHeight}
            onCanvasReady={onCanvasReady}
          />
        </Suspense>

        {/* Controls for user interaction */}
        {interactive && (
          <OrbitControls
            enableZoom={enableZoom}
            enablePan={enablePan}
            enableRotate={enableRotate}
            minDistance={minDistance}
            maxDistance={maxDistance}
            autoRotate={false}
          />
        )}
      </Canvas>
    </div>
  );
}
