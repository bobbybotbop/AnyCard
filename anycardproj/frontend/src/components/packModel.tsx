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
} from "three";

// Import textures using Vite's asset handling with ?url suffix to get the URL string
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
// Import the 3D model - useGLTF can handle both imported URLs and string paths
import cardpackModelUrl from "../assets/cardpack2.glb?url";

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
}) {
  const { scene: originalScene } = useGLTF(modelPath);
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);

  // Clone the scene for each instance so multiple models can be rendered independently
  // Without cloning, all instances would share the same Three.js object and appear at the same position
  const scene = useMemo(() => originalScene.clone(), [originalScene]);

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

    const loader = new TextureLoader();

    scene.traverse((child) => {
      if (child instanceof Mesh) {
        const mesh = child as Mesh;
        if (mesh.material) {
          // Load diffuse texture
          loader.load(diffuseTexture, (diffuseTex: Texture) => {
            diffuseTex.flipY = false;
            // Set color space to sRGB for more vibrant colors
            diffuseTex.colorSpace = SRGBColorSpace;

            // Load normal texture
            loader.load(normalTexture, (normalTex: Texture) => {
              normalTex.flipY = false;

              // Apply textures to material
              if (mesh.material instanceof StandardMaterial) {
                mesh.material.map = diffuseTex;
                mesh.material.normalMap = normalTex;
                // Enhance color saturation by adjusting material properties
                mesh.material.color.setRGB(1.1, 1.1, 1.1); // Slight color boost
                mesh.material.needsUpdate = true;
              } else if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat: Material) => {
                  if (mat instanceof StandardMaterial) {
                    mat.map = diffuseTex;
                    mat.normalMap = normalTex;
                    // Enhance color saturation by adjusting material properties
                    mat.color.setRGB(1.1, 1.1, 1.1); // Slight color boost
                    mat.needsUpdate = true;
                  }
                });
              }
            });
          });
        }
      }
    });
  }, [scene, diffuseTexture, normalTexture]);

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
