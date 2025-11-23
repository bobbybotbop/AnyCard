import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import type { Texture, Material } from "three";
import {
  Mesh,
  TextureLoader,
  MeshStandardMaterial as StandardMaterial,
  MathUtils as mu,
  SRGBColorSpace,
  CanvasTexture,
  Euler,
  Quaternion,
  Vector3,
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
const TRANSLATE_OVERLAY_Y = -70;
const textPadding = -10;

// Color analysis utilities
/**
 * Analyzes image pixels to find the most common RGB color
 * Samples pixels efficiently by downsampling large images
 */
function getDominantColor(imageData: ImageData): [number, number, number] {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Sample every Nth pixel for efficiency (sample every 4th pixel)
  const sampleRate = 4;
  const colorMap = new Map<string, number>();

  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // Skip transparent pixels - only count fully opaque pixels
      if (a < 255) continue;

      // Quantize colors to reduce noise (group similar colors)
      const quantizedR = Math.floor(r / 16) * 16;
      const quantizedG = Math.floor(g / 16) * 16;
      const quantizedB = Math.floor(b / 16) * 16;
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
  }

  // Find the most common color
  let maxCount = 0;
  let dominantColor: [number, number, number] = [0, 0, 0];

  colorMap.forEach((count, colorKey) => {
    if (count > maxCount) {
      maxCount = count;
      const [r, g, b] = colorKey.split(",").map(Number);
      dominantColor = [r, g, b];
    }
  });

  return dominantColor;
}

/**
 * Calculates which color (white or black) provides better contrast against the overlay image
 * Uses relative luminance formula from WCAG guidelines
 */
function calculateContrast(overlayImageData: ImageData): "white" | "black" {
  const data = overlayImageData.data;
  const width = overlayImageData.width;
  const height = overlayImageData.height;

  // Sample pixels to calculate average luminance
  const sampleRate = 8;
  let totalLuminance = 0;
  let sampleCount = 0;

  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // Skip transparent pixels - only count fully opaque pixels
      if (a < 255) continue;

      // Calculate relative luminance (WCAG formula)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      totalLuminance += luminance;
      sampleCount++;
    }
  }

  if (sampleCount === 0) return "black"; // Default to black if no valid pixels

  const averageLuminance = totalLuminance / sampleCount;

  // If average luminance is above 0.5, use black outline; otherwise use white
  return averageLuminance > 0.5 ? "black" : "white";
}

/**
 * Generates gradient colors from a base color
 * Creates a visually appealing gradient by creating lighter and darker variations
 */
function generateGradientColors(baseColor: [number, number, number]): {
  start: string;
  end: string;
} {
  const [r, g, b] = baseColor;

  // Create a lighter version for the start of the gradient
  const lightenFactor = 0.3;
  const startR = Math.min(255, r + (255 - r) * lightenFactor);
  const startG = Math.min(255, g + (255 - g) * lightenFactor);
  const startB = Math.min(255, b + (255 - b) * lightenFactor);

  // Create a darker, more saturated version for the end
  const darkenFactor = 0.4;
  const endR = Math.max(0, r * (1 - darkenFactor));
  const endG = Math.max(0, g * (1 - darkenFactor));
  const endB = Math.max(0, b * (1 - darkenFactor));

  // Increase saturation for the end color
  const saturationBoost = 1.2;
  const finalEndR = Math.min(255, endR * saturationBoost);
  const finalEndG = Math.min(255, endG * saturationBoost);
  const finalEndB = Math.min(255, endB * saturationBoost);

  return {
    start: `rgb(${Math.round(startR)}, ${Math.round(startG)}, ${Math.round(
      startB
    )})`,
    end: `rgb(${Math.round(finalEndR)}, ${Math.round(finalEndG)}, ${Math.round(
      finalEndB
    )})`,
  };
}

/**
 * Parses text into words and identifies major words (skips minor words like "&", "and", "the", "of", etc.)
 * Returns an array of character objects with metadata about whether they should be larger
 */
function parseTextForStyling(text: string): Array<{
  char: string;
  fontSize: number;
  isFirstLetterOfMajorWord: boolean;
}> {
  const minorWords = new Set([
    "&",
    "AND",
    "THE",
    "OF",
    "A",
    "AN",
    "TO",
    "FOR",
    "IN",
    "ON",
    "AT",
    "BY",
    "WITH",
  ]);

  // Split text into words (preserving spaces and special characters)
  const words = text.split(/(\s+)/);
  const result: Array<{
    char: string;
    fontSize: number;
    isFirstLetterOfMajorWord: boolean;
  }> = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // If it's whitespace, add it as-is with normal size
    if (/^\s+$/.test(word)) {
      for (const char of word) {
        result.push({
          char,
          fontSize: 1.0,
          isFirstLetterOfMajorWord: false,
        });
      }
      continue;
    }

    // Check if this is a major word
    const isMajorWord = !minorWords.has(word.toUpperCase());

    // Process each character in the word
    for (let j = 0; j < word.length; j++) {
      const char = word[j];
      const isFirstLetter = j === 0;

      result.push({
        char,
        fontSize: isFirstLetter && isMajorWord ? 1.2 : 1.0,
        isFirstLetterOfMajorWord: isFirstLetter && isMajorWord,
      });
    }
  }

  return result;
}

// Utility function to composite overlay image over diffuse texture using Canvas
async function compositeTextures(
  diffuseTextureUrl: string,
  overlayImageUrl: string,
  overlayX: number,
  overlayY: number,
  overlayWidth: number,
  overlayHeight: number,
  setTitle?: string
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

        // Analyze overlay image colors before drawing (if setTitle is provided)
        let dominantColor: [number, number, number] | null = null;
        let outlineColor: "white" | "black" = "black";
        if (setTitle) {
          // Create a temporary canvas to analyze just the overlay image
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = overlayImage.width;
          tempCanvas.height = overlayImage.height;
          const tempCtx = tempCanvas.getContext("2d");

          if (tempCtx) {
            // Draw only the overlay image to the temp canvas
            tempCtx.drawImage(overlayImage, 0, 0);

            // Extract image data from the overlay image only
            const overlayImageData = tempCtx.getImageData(
              0,
              0,
              overlayImage.width,
              overlayImage.height
            );

            // Get dominant color from overlay
            dominantColor = getDominantColor(overlayImageData);

            // Calculate contrast color for outline
            outlineColor = calculateContrast(overlayImageData);
          }
        }

        // Draw overlay image at the top-left of the specified area
        ctx.drawImage(overlayImage, drawX, drawY, drawWidth, drawHeight);

        // Render set title logo below overlay if provided
        if (setTitle && dominantColor) {
          // Generate gradient colors
          const gradientColors = generateGradientColors(dominantColor);

          // Calculate text position (below overlay with padding)
          const textY = drawY + drawHeight + textPadding;

          // Transform text to uppercase
          const titleText = setTitle.toUpperCase();

          // Parse text into characters with styling metadata
          const parsedChars = parseTextForStyling(titleText);

          // Calculate base font size based on overlay image width
          let baseFontSize = Math.max(24, Math.min(drawWidth * 0.15, 72));

          // Set up font temporarily to measure text width
          ctx.font = `bold ${baseFontSize}px "Impact", "Arial Black", "Arial", sans-serif`;
          ctx.textBaseline = "top";

          // Calculate total text width accounting for mixed font sizes
          let totalTextWidth = 0;
          for (const charInfo of parsedChars) {
            const charFontSize = baseFontSize * charInfo.fontSize;
            ctx.font = `bold ${charFontSize}px "Impact", "Arial Black", "Arial", sans-serif`;
            const metrics = ctx.measureText(charInfo.char);
            totalTextWidth += metrics.width;
          }

          // Scale font size to fit overlay width (with padding)
          const targetWidth = drawWidth * 0.95; // 95% of overlay width for padding
          if (totalTextWidth !== targetWidth && totalTextWidth > 0) {
            const scaleFactor = targetWidth / totalTextWidth;
            baseFontSize = baseFontSize * scaleFactor;

            // Ensure font size stays within reasonable bounds
            baseFontSize = Math.max(16, Math.min(baseFontSize, 100));

            // Recalculate total width with scaled font size
            totalTextWidth = 0;
            for (const charInfo of parsedChars) {
              const charFontSize = baseFontSize * charInfo.fontSize;
              ctx.font = `bold ${charFontSize}px "Impact", "Arial Black", "Arial", sans-serif`;
              const metrics = ctx.measureText(charInfo.char);
              totalTextWidth += metrics.width;
            }
          }

          const textX = canvas.width / 2;

          // Calculate the skew offset at the textY position
          // The transform [1, 0, -0.15, 1] shifts x by -0.15 * y
          // After transformation: x' = x - 0.15 * y
          // To center the text properly after skew, we need to compensate for this offset
          const skewOffset = 0.15 * textY;

          // Adjust starting position to account for skew transform
          // The center before transform: textStartX + totalTextWidth/2
          // The center after transform: (textStartX + totalTextWidth/2) - 0.15*textY
          // We want this to equal textX, so: textStartX = textX - totalTextWidth/2 + 0.15*textY
          const textStartX = textX - totalTextWidth / 2 + skewOffset;

          // Create gradient for text fill - diagonal gradient for more dynamic look
          // Account for skew in gradient coordinates as well
          const gradientStartX = textStartX;
          const gradientEndX = textStartX + totalTextWidth;
          const gradient = ctx.createLinearGradient(
            gradientStartX,
            textY,
            gradientEndX,
            textY + baseFontSize * 1.2
          );
          gradient.addColorStop(0, gradientColors.start);
          gradient.addColorStop(0.5, gradientColors.end);
          gradient.addColorStop(1, gradientColors.start);

          // Save context for transform
          ctx.save();

          // Apply angular skew transform for stylized effect
          ctx.transform(1, 0, -0.15, 1, 0, 0);

          // Set common text properties
          ctx.textAlign = "left";
          ctx.lineJoin = "miter";
          ctx.miterLimit = 10;

          // Render text character by character with appropriate font sizes
          let currentX = textStartX;

          // Function to render a single character with all outline layers and fill
          const renderCharacter = (
            char: string,
            fontSize: number,
            x: number,
            y: number
          ) => {
            ctx.font = `bold ${fontSize}px "Impact", "Arial Black", "Arial", sans-serif`;

            // Outer thick outline
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = Math.max(1, fontSize * 0.035);
            ctx.strokeText(char, x, y);

            // Middle outline layer
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = Math.max(2, fontSize * 0.08);
            ctx.strokeText(char, x, y);

            // Draw text fill with gradient
            ctx.fillStyle = gradient;
            ctx.fillText(char, x, y);

            // Inner thin outline for extra sharpness
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = Math.max(1, fontSize * 0.03);
            ctx.strokeText(char, x, y);
          };

          // Render each character with its appropriate font size
          for (const charInfo of parsedChars) {
            const charFontSize = baseFontSize * charInfo.fontSize;
            renderCharacter(charInfo.char, charFontSize, currentX, textY);

            // Measure character width to advance position
            ctx.font = `bold ${charFontSize}px "Impact", "Arial Black", "Arial", sans-serif`;
            const metrics = ctx.measureText(charInfo.char);
            currentX += metrics.width;
          }

          // Restore context
          ctx.restore();
        }

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
  setTitle,
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
  setTitle?: string; // Optional set title to render as logo below overlay
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
  const accumulatedRotationRef = useRef(0); // Track accumulated rotation for autoRotate

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

  // Calculate base rotation quaternion (only changes when rotation prop changes)
  const baseQuat = useMemo(() => {
    const baseEuler = new Euler(
      mu.degToRad(0),
      mu.degToRad(90),
      mu.degToRad(0),
      "XYZ"
    );
    return new Quaternion().setFromEuler(baseEuler);
  }, []);

  const userQuat = useMemo(() => {
    const userEuler = new Euler(
      mu.degToRad(rotation[0]),
      mu.degToRad(rotation[1]),
      mu.degToRad(rotation[2]),
      "XYZ"
    );
    return new Quaternion().setFromEuler(userEuler);
  }, [rotation]);

  // Calculate final rotation using quaternions
  // This is the initial rotation; when autoRotate is enabled, useFrame will update it
  const finalRotation = useMemo(() => {
    // Combine base and user rotations using quaternions
    const combinedQuat = baseQuat.clone().multiply(userQuat);
    const finalEuler = new Euler().setFromQuaternion(combinedQuat, "XYZ");
    return [finalEuler.x, finalEuler.y, finalEuler.z] as [
      number,
      number,
      number,
    ];
  }, [baseQuat, userQuat]);

  // Reset accumulated rotation when rotation prop changes or autoRotate is toggled
  useEffect(() => {
    accumulatedRotationRef.current = 0;
  }, [rotation, autoRotate]);

  // Set initial rotation when autoRotate is enabled or rotation changes
  useEffect(() => {
    if (!autoRotate) {
      const targetRef = rotationCenter ? groupRef : meshRef;
      if (targetRef.current) {
        targetRef.current.rotation.set(
          finalRotation[0],
          finalRotation[1],
          finalRotation[2]
        );
      }
    }
  }, [finalRotation, autoRotate, rotationCenter]);

  // Rotate the model automatically using quaternions
  useFrame((state, delta) => {
    const targetRef = rotationCenter ? groupRef : meshRef;
    if (targetRef.current && autoRotate) {
      // Accumulate rotation angle
      accumulatedRotationRef.current += delta * rotationSpeed;

      // Create incremental rotation quaternion around the specified axis (in original coordinate system)
      let incrementalQuat: Quaternion;
      if (rotationAxis === "x") {
        incrementalQuat = new Quaternion().setFromAxisAngle(
          new Vector3(1, 0, 0),
          accumulatedRotationRef.current
        );
      } else if (rotationAxis === "y") {
        incrementalQuat = new Quaternion().setFromAxisAngle(
          new Vector3(0, 1, 0),
          accumulatedRotationRef.current
        );
      } else {
        // rotationAxis === "z"
        incrementalQuat = new Quaternion().setFromAxisAngle(
          new Vector3(0, 0, 1),
          accumulatedRotationRef.current
        );
      }

      // Combine quaternions: baseQuat * (userQuat * incrementalQuat)
      // This applies incremental rotation in original coordinate system, then user rotation, then base rotation
      const combinedQuat = baseQuat
        .clone()
        .multiply(userQuat.clone().multiply(incrementalQuat));

      // Convert back to Euler and apply
      const finalEuler = new Euler().setFromQuaternion(combinedQuat, "XYZ");
      targetRef.current.rotation.set(finalEuler.x, finalEuler.y, finalEuler.z);
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
              overlayHeight,
              setTitle
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
    setTitle,
  ]);

  // Handle scale - can be a number or array
  const scaleValue = Array.isArray(scale) ? scale : [scale, scale, scale];

  // Set rotation order for Euler conversion (quaternions handle the combination without gimbal lock)
  // Using XYZ order since quaternions already handle the rotation combination correctly
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.order = "XYZ";
    }
    if (groupRef.current) {
      groupRef.current.rotation.order = "XYZ";
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
  setTitle?: string; // Optional set title to render as logo below overlay
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
  rotationAxis = "z",
  autoRotate = false,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rotationCenter,
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  ambientLightIntensity = 0.5,
  directionalLightIntensity = 10,
  enableZoom = false,
  enableRotate = false,
  enablePan = false,
  minDistance = 3,
  maxDistance = 10,
  interactive = true,
  overlayImageUrl,
  overlayX = 0,
  overlayY = 0,
  overlayWidth = 1,
  overlayHeight = 1,
  setTitle,
  onCanvasReady,
}: PackModelProps) {
  // Default model path - using cardpack2.glb from assets folder
  // You can override this by passing a custom modelPath prop
  // If no custom path is provided, use the imported model URL
  const defaultModelPath = modelPath || cardpackModelUrl;

  // Component to enhance color vibrancy via tone mapping
  function ColorEnhancement() {
    const { gl } = useThree();
    useEffect(() => {
      gl.toneMappingExposure = 1.2; // Increase exposure for brighter, more vibrant colors
    }, [gl]);
    return null;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true }}
      >
        <ColorEnhancement />
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={directionalLightIntensity}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />

        {/* Environment for better lighting */}
        <Environment preset="studio" />

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
            setTitle={setTitle}
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
            autoRotate={autoRotate}
          />
        )}
      </Canvas>
    </div>
  );
}
