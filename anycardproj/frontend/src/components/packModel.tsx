import { Suspense, useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import type { Texture, Material } from "three";
import CardDrawings from "./CardDrawings";
import { Card as CardType } from "@full-stack/types";
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
  Raycaster,
} from "three";

// Import textures using Vite's asset handling with ?url suffix to get the URL string
import diffuseTextureUrl from "../assets/trading-card-pack/textures/DIFFUSE.png?url";
import normalTextureUrl from "../assets/trading-card-pack/textures/optional_NORMAL.png?url";
// Import the 3D model - useGLTF can handle both imported URLs and string paths
import cardpackModelUrl from "../assets/cardpack2.glb?url";

// Overlay size constants
const MAX_WIDTH = 350; // Maximum width in pixels for overlay image
const MAX_HEIGHT = 300; // Maximum height in pixels for overlay image
const TRANSLATE_OVERLAY_Y = -70;
const textPadding = -10;
const TEXT_MAX_WIDTH = 350; // Maximum width in pixels for text (independent of overlay)

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

          // Scale font size to fit fixed width (independent of overlay)
          const targetWidth = TEXT_MAX_WIDTH; // Fixed width independent of overlay
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

            // Set outline properties once
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = Math.max(1, fontSize * 0.01);

            // Outer thick outline
            ctx.strokeText(char, x, y);
            // Middle outline layer
            ctx.strokeText(char, x, y);

            // Draw text fill with gradient
            ctx.fillStyle = gradient;
            ctx.fillText(char, x, y);

            // Inner thin outline for extra sharpness
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
      checkAndComposite();
    };
    baseImage.onerror = (error) => {
      console.error("Failed to load base diffuse texture:", error);
      reject(new Error("Failed to load base diffuse texture"));
    };

    overlayImage.onload = () => {
      overlayLoaded = true;
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
  enableBobbing = false,
  bobbingOffset = 0,
  bobbingSpeed = 1,
  bobbingAmplitude = 0.1,
  onClick,
  originalPosition,
  originalRotation,
  resetTrigger,
  onResetComplete,
  hoverable = true,
  clickable = true,
  onShowOverlay,
  onAnimationComplete,
  isSelected: isSelectedProp,
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
  enableBobbing?: boolean; // Controls whether bobbing is active
  bobbingOffset?: number; // Phase offset for bobbing animation
  bobbingSpeed?: number; // Speed of bobbing animation
  bobbingAmplitude?: number; // Amplitude of bobbing motion
  onClick?: () => void; // Callback when pack is clicked
  originalPosition?: [number, number, number]; // Original position to reset to
  originalRotation?: [number, number, number]; // Original rotation to reset to
  resetTrigger?: number; // Trigger reset when this value changes
  onResetComplete?: () => void; // Callback when reset animation completes
  hoverable?: boolean; // Enable/disable hover scale effect (default: true)
  clickable?: boolean; // Enable/disable click interaction (default: true)
  onShowOverlay?: (show: boolean) => void; // Callback when overlay should be shown/hidden
  onAnimationComplete?: () => void; // Callback when click animation completes
  isSelected?: boolean; // External control for selected state (after animation completes)
  cards?: CardType[]; // Cards to display in the overlay
}) {
  const { scene: originalScene } = useGLTF(modelPath);
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);
  const texturesRef = useRef<Texture[]>([]);
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const isMountedRef = useRef(true);
  const accumulatedRotationRef = useRef(0); // Track accumulated rotation for autoRotate

  // Animation state for click-to-center functionality
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  // Track if pack is in selected state (after animation completes)
  // Can be controlled externally via isSelectedProp or internally when animation completes
  const [isSelected, setIsSelected] = useState(isSelectedProp ?? false);
  const [isMovingDown, setIsMovingDown] = useState(false); // Track if pack is moving downwards (second click)
  const [show2DOverlay, setShow2DOverlay] = useState(false); // Track if 2D overlay should be shown
  const [clicksDisabled, setClicksDisabled] = useState(false); // Track if click listener should be disabled

  // Sync internal isSelected state with external prop when prop changes
  useEffect(() => {
    if (isSelectedProp !== undefined) {
      setIsSelected(isSelectedProp);
    }
  }, [isSelectedProp]);
  const targetPositionRef = useRef<Vector3>(new Vector3(...position));
  const currentPositionRef = useRef<Vector3>(new Vector3(...position));
  const targetRotationRef = useRef<Quaternion | null>(null);
  const currentRotationRef = useRef<Quaternion>(new Quaternion());
  const originalRotationQuatRef = useRef<Quaternion | null>(null);
  const lastProcessedResetTriggerRef = useRef<number>(0);
  const accumulatedRotationAngleRef = useRef<number>(0); // Track accumulated rotation angle for 360-degree spin
  const startRotationQuatRef = useRef<Quaternion | null>(null); // Store starting rotation for spin animation

  // Bobbing animation state
  const baseYPositionRef = useRef<number | null>(null);
  const wasBobbingRef = useRef<boolean>(false);

  // Hover state for scale animation
  const [isHovered, setIsHovered] = useState(false);
  const currentScaleRef = useRef<Vector3>(
    new Vector3(...(Array.isArray(scale) ? scale : [scale, scale, scale]))
  );
  const targetScaleRef = useRef<Vector3>(
    new Vector3(...(Array.isArray(scale) ? scale : [scale, scale, scale]))
  );

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
  // Skip this if pack is animating or selected to preserve the animated rotation
  useEffect(() => {
    if (
      !autoRotate &&
      !isAnimating &&
      !isSelected &&
      !isResetting &&
      !isMovingDown
    ) {
      const targetRef = rotationCenter ? groupRef : meshRef;
      if (targetRef.current) {
        targetRef.current.rotation.set(
          finalRotation[0],
          finalRotation[1],
          finalRotation[2]
        );
      }
    }
  }, [
    finalRotation,
    autoRotate,
    rotationCenter,
    isAnimating,
    isSelected,
    isResetting,
    isMovingDown,
  ]);

  // Initialize base Y position when position prop changes
  useEffect(() => {
    // Only update baseYPositionRef when position prop changes, not when enableBobbing changes
    baseYPositionRef.current = position[1];
  }, [position]);

  // Track bobbing state
  useEffect(() => {
    wasBobbingRef.current = enableBobbing;
  }, [enableBobbing]);

  // Initialize original rotation quaternion
  useEffect(() => {
    if (originalRotation) {
      const originalEuler = new Euler(
        mu.degToRad(originalRotation[0]),
        mu.degToRad(originalRotation[1]),
        mu.degToRad(originalRotation[2]),
        "XYZ"
      );
      const originalUserQuat = new Quaternion().setFromEuler(originalEuler);
      originalRotationQuatRef.current = baseQuat
        .clone()
        .multiply(originalUserQuat);
    } else {
      // Use current rotation as original if not provided
      const targetRef = rotationCenter ? groupRef : meshRef;
      if (targetRef.current) {
        originalRotationQuatRef.current = targetRef.current.quaternion.clone();
      }
    }
  }, [originalRotation, baseQuat, rotationCenter]);

  // Handle reset trigger
  useEffect(() => {
    if (
      resetTrigger !== undefined &&
      resetTrigger > 0 &&
      resetTrigger !== lastProcessedResetTriggerRef.current &&
      !isResetting &&
      !isAnimating
    ) {
      lastProcessedResetTriggerRef.current = resetTrigger;
      setIsResetting(true);
      setIsAnimating(false); // Stop any ongoing click animation
      setIsSelected(false); // Clear selected state when resetting
      setIsMovingDown(false); // Clear downward movement state
      setShow2DOverlay(false); // Hide 2D overlay
      setClicksDisabled(false); // Re-enable clicks

      // Reset hover state and scale
      setIsHovered(false);
      const baseScale = Array.isArray(scale) ? scale[0] : scale;
      targetScaleRef.current.set(baseScale, baseScale, baseScale);

      // Set target to original position
      if (originalPosition) {
        targetPositionRef.current.set(...originalPosition);
      } else {
        targetPositionRef.current.set(...position);
      }

      // Set target rotation to original
      if (originalRotationQuatRef.current) {
        targetRotationRef.current = originalRotationQuatRef.current.clone();
      }

      // Store current position, rotation, and scale for smooth interpolation
      const targetRef = rotationCenter ? groupRef : meshRef;
      if (targetRef.current) {
        currentPositionRef.current.copy(targetRef.current.position);
        currentRotationRef.current.copy(targetRef.current.quaternion);
      }
      // Store current scale
      if (meshRef.current) {
        currentScaleRef.current.copy(meshRef.current.scale);
      }
    }
  }, [
    resetTrigger,
    isResetting,
    isAnimating,
    originalPosition,
    position,
    rotationCenter,
    scale,
  ]);

  // Handle hover enter
  const handlePointerEnter = (event: any) => {
    event.stopPropagation();
    // Don't hover if disabled, during animation/reset, or if pack is selected
    if (!hoverable || isAnimating || isResetting || isSelected) return;
    setIsHovered(true);
    // Set target scale to 1.10x (10% larger)
    const baseScale = Array.isArray(scale) ? scale[0] : scale;
    targetScaleRef.current.set(
      baseScale * 1.1,
      baseScale * 1.1,
      baseScale * 1.1
    );
  };

  // Handle hover leave
  const handlePointerLeave = (event: any) => {
    event.stopPropagation();
    // Don't process hover leave if hover is disabled or pack is selected
    if (!hoverable || isSelected) return;
    setIsHovered(false);
    // Reset scale to original
    const baseScale = Array.isArray(scale) ? scale[0] : scale;
    targetScaleRef.current.set(baseScale, baseScale, baseScale);
  };

  // Handle click to animate to center and face camera
  const handleClick = (event: any) => {
    event.stopPropagation();

    if (!clickable || clicksDisabled) return; // Don't process clicks if clickable is disabled or clicks are disabled
    if (isAnimating || isResetting || isMovingDown) return; // Prevent clicks during animation or reset

    // If pack is already selected (second click), move it down and show overlay
    if (isSelected) {
      setIsMovingDown(true);
      setShow2DOverlay(true);
      setClicksDisabled(true); // Disable click listener

      // Call onClick callback to trigger pack opening API call
      if (onClick) {
        onClick();
      }

      // Move mesh downwards - user can adjust this value later
      const targetRef = rotationCenter ? groupRef : meshRef;
      if (targetRef.current) {
        const currentY = targetRef.current.position.y;
        targetPositionRef.current.set(
          targetRef.current.position.x,
          currentY - 3.3, // Move down by 1.5 unit (adjustable)
          targetRef.current.position.z
        );
        currentPositionRef.current.copy(targetRef.current.position);

        // Set up rotation: rotate 360 degrees around Y axis
        // Store the starting rotation quaternion
        const startRotation = targetRef.current.quaternion.clone();
        startRotationQuatRef.current = startRotation;
        currentRotationRef.current.copy(startRotation);

        // Initialize accumulated rotation angle (we'll animate from 0 to 360 degrees)
        accumulatedRotationAngleRef.current = 0;

        // Set target rotation as starting rotation + 360 degrees
        const rotation360Y = new Quaternion().setFromAxisAngle(
          new Vector3(1, 0, 0),
          mu.degToRad(360)
        );
        targetRotationRef.current = startRotation
          .clone()
          .multiply(rotation360Y);
      }

      return;
    }

    // First click: animate to center and face camera
    // Reset hover state and selected state when clicking
    setIsHovered(false);
    setIsSelected(false);

    // Store current position, rotation, and scale for smooth interpolation
    // Do this BEFORE calling onClick callback to ensure we capture the current state
    const targetRef = rotationCenter ? groupRef : meshRef;
    if (!targetRef.current) return;

    // Always sync currentPositionRef with actual mesh position before starting animation
    // This ensures that after a reset, we start from the correct position
    currentPositionRef.current.copy(targetRef.current.position);
    currentRotationRef.current.copy(targetRef.current.quaternion);

    // Store current scale
    if (meshRef.current) {
      currentScaleRef.current.copy(meshRef.current.scale);
    }

    // Call onClick callback if provided
    if (onClick) {
      onClick();
    }

    setIsAnimating(true);

    // Reset target rotation so it gets calculated in useFrame
    targetRotationRef.current = null;

    // Select pack screen position - where the card moves to the center of the screen
    targetPositionRef.current.set(0, 0.4, 1.7);

    // Set target scale for animation (scale up to 1.5x when clicked)
    const baseScale = Array.isArray(scale) ? scale[0] : scale;
    targetScaleRef.current.set(
      baseScale * 1.5,
      baseScale * 1.5,
      baseScale * 1.5
    );
  };

  // Initialize scale refs when scale prop changes
  useEffect(() => {
    const scaleArray: [number, number, number] = Array.isArray(scale)
      ? [scale[0], scale[1] ?? scale[0], scale[2] ?? scale[0]]
      : [scale, scale, scale];
    currentScaleRef.current.set(scaleArray[0], scaleArray[1], scaleArray[2]);
    // Only update target scale if not hovered (preserve hover scale)
    if (!isHovered) {
      targetScaleRef.current.set(scaleArray[0], scaleArray[1], scaleArray[2]);
    }
  }, [scale, isHovered]);

  // Rotate the model automatically using quaternions and handle click animation
  useFrame((state, delta) => {
    const targetRef = rotationCenter ? groupRef : meshRef;
    const { camera, pointer } = state;

    if (!targetRef.current) return;

    // Handle scale animation on hover
    if (!isAnimating && !isResetting) {
      const lerpSpeed = 0.1; // Smooth scale transition
      currentScaleRef.current.lerp(targetScaleRef.current, lerpSpeed);

      // Apply scale to the appropriate ref
      if (rotationCenter) {
        if (meshRef.current) {
          meshRef.current.scale.copy(currentScaleRef.current);
        }
      } else {
        if (meshRef.current) {
          meshRef.current.scale.copy(currentScaleRef.current);
        }
      }
    }

    // Handle reset animation
    if (isResetting) {
      const lerpSpeed = 0.05; // Same speed as click animation

      // Interpolate position back to original
      currentPositionRef.current.lerp(targetPositionRef.current, lerpSpeed);

      // Interpolate rotation back to original using quaternion slerp
      if (targetRotationRef.current) {
        currentRotationRef.current.slerp(targetRotationRef.current, lerpSpeed);
      }

      // Interpolate scale back to original
      currentScaleRef.current.lerp(targetScaleRef.current, lerpSpeed);

      // Apply to the appropriate ref
      if (rotationCenter) {
        groupRef.current.position.copy(currentPositionRef.current);
        groupRef.current.quaternion.copy(currentRotationRef.current);
        if (meshRef.current) {
          meshRef.current.scale.copy(currentScaleRef.current);
        }
      } else {
        if (meshRef.current) {
          meshRef.current.position.copy(currentPositionRef.current);
          meshRef.current.quaternion.copy(currentRotationRef.current);
          meshRef.current.scale.copy(currentScaleRef.current);
        }
      }

      // Check if reset animation is complete
      const positionDiff = currentPositionRef.current.distanceTo(
        targetPositionRef.current
      );
      const rotationDiff = targetRotationRef.current
        ? currentRotationRef.current.angleTo(targetRotationRef.current)
        : 0;
      const scaleDiff = currentScaleRef.current.distanceTo(
        targetScaleRef.current
      );

      if (positionDiff < 0.01 && rotationDiff < 0.01 && scaleDiff < 0.01) {
        // Reset complete - snap to exact position/rotation/scale
        if (rotationCenter) {
          groupRef.current.position.copy(targetPositionRef.current);
          if (targetRotationRef.current) {
            groupRef.current.quaternion.copy(targetRotationRef.current);
          }
          if (meshRef.current) {
            meshRef.current.scale.copy(targetScaleRef.current);
          }
        } else {
          if (meshRef.current) {
            meshRef.current.position.copy(targetPositionRef.current);
            if (targetRotationRef.current) {
              meshRef.current.quaternion.copy(targetRotationRef.current);
            }
            meshRef.current.scale.copy(targetScaleRef.current);
          }
        }
        // Sync currentPositionRef and currentRotationRef with final values after reset
        currentPositionRef.current.copy(targetPositionRef.current);
        if (targetRotationRef.current) {
          currentRotationRef.current.copy(targetRotationRef.current);
        }
        currentScaleRef.current.copy(targetScaleRef.current);
        setIsResetting(false);

        // Check if card is being hovered over right when reset completes
        if (hoverable && meshRef.current) {
          // Create a raycaster from camera through pointer position
          const raycasterInstance = new Raycaster();
          raycasterInstance.setFromCamera(pointer, camera);

          // Check if ray intersects with the mesh
          const intersects = raycasterInstance.intersectObject(
            meshRef.current,
            true
          );

          if (intersects.length > 0) {
            // Card is being hovered - trigger hover effect
            setIsHovered(true);
            const baseScale = Array.isArray(scale) ? scale[0] : scale;
            targetScaleRef.current.set(
              baseScale * 1.1,
              baseScale * 1.1,
              baseScale * 1.1
            );
          }
        }

        // Call completion callback
        if (onResetComplete) {
          onResetComplete();
        }
      }

      return; // Skip autoRotate and bobbing during reset animation
    }

    // Handle click animation
    if (isAnimating) {
      // Calculate rotation to face camera on first frame of animation
      if (!targetRotationRef.current) {
        // Get camera position
        const cameraPosition = new Vector3();
        camera.getWorldPosition(cameraPosition);

        // Calculate direction from model to camera
        // Use Y=0 for rotation calculation to prevent upside-down orientation
        const targetPosForRotation = new Vector3(
          targetPositionRef.current.x,
          0, // Use 0 for Y to keep rotation consistent
          targetPositionRef.current.z
        );
        const directionToCamera = new Vector3()
          .subVectors(cameraPosition, targetPosForRotation)
          .normalize();

        // The model's forward direction - use -Z since it's facing opposite
        // We'll flip it 180 degrees to face the camera
        const modelForward = new Vector3(0, 0, -1);

        // Create quaternion to rotate model forward to camera direction
        const rotationQuat = new Quaternion().setFromUnitVectors(
          modelForward,
          directionToCamera
        );

        // Add 180-degree flip around Y axis to face camera instead of away
        const flip180Y = new Quaternion().setFromAxisAngle(
          new Vector3(0, 1, 0),
          mu.degToRad(180)
        );

        // Add 180-degree flip around X axis to fix upside down orientation
        const flip180X = new Quaternion().setFromAxisAngle(
          new Vector3(1, 0, 0),
          mu.degToRad(180)
        );

        // Add 90-degree correction around X axis to fix the upward tilt
        const correction90 = new Quaternion().setFromAxisAngle(
          new Vector3(1, 0, 0),
          mu.degToRad(-90)
        );

        // Apply rotation to face camera, then flip Y, then flip X, then correction, then base rotation
        targetRotationRef.current = rotationQuat
          .clone()
          .multiply(flip180Y)
          .multiply(flip180X)
          .multiply(correction90)
          .multiply(baseQuat);
      }

      const lerpSpeed = 0.05; // Adjust this value to control animation speed (0.01 = slow, 0.1 = fast)

      // Interpolate position
      currentPositionRef.current.lerp(targetPositionRef.current, lerpSpeed);

      // Interpolate rotation using quaternion slerp
      if (targetRotationRef.current) {
        currentRotationRef.current.slerp(targetRotationRef.current, lerpSpeed);
      }

      // Interpolate scale
      currentScaleRef.current.lerp(targetScaleRef.current, lerpSpeed);

      // Apply to the appropriate ref
      if (rotationCenter) {
        // For rotationCenter, animate the group position
        groupRef.current.position.copy(currentPositionRef.current);
        groupRef.current.quaternion.copy(currentRotationRef.current);
        if (meshRef.current) {
          meshRef.current.scale.copy(currentScaleRef.current);
        }
      } else {
        // For normal case, animate the mesh position, rotation, and scale
        if (meshRef.current) {
          meshRef.current.position.copy(currentPositionRef.current);
          meshRef.current.quaternion.copy(currentRotationRef.current);
          meshRef.current.scale.copy(currentScaleRef.current);
        }
      }

      // Check if animation is complete (close enough to target)
      const positionDiff = currentPositionRef.current.distanceTo(
        targetPositionRef.current
      );
      const rotationDiff = targetRotationRef.current
        ? currentRotationRef.current.angleTo(targetRotationRef.current)
        : 0;
      const scaleDiff = currentScaleRef.current.distanceTo(
        targetScaleRef.current
      );

      if (positionDiff < 0.01 && rotationDiff < 0.01 && scaleDiff < 0.01) {
        // Animation complete
        if (rotationCenter) {
          groupRef.current.position.copy(targetPositionRef.current);
          if (targetRotationRef.current) {
            groupRef.current.quaternion.copy(targetRotationRef.current);
          }
          if (meshRef.current) {
            meshRef.current.scale.copy(targetScaleRef.current);
          }
        } else {
          if (meshRef.current) {
            meshRef.current.position.copy(targetPositionRef.current);
            if (targetRotationRef.current) {
              meshRef.current.quaternion.copy(targetRotationRef.current);
            }
            meshRef.current.scale.copy(targetScaleRef.current);
          }
        }
        setIsAnimating(false);
        setIsSelected(true); // Mark as selected after animation completes
        setIsHovered(false); // Clear hover state when selected

        // Call animation complete callback if provided
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }

      return; // Skip autoRotate and bobbing during click animation
    }

    // Handle downward movement animation (second click)
    if (isMovingDown) {
      const lerpSpeed = 0.015; // Lower = slower downward movement, Higher = faster (default: 0.05)
      const rotationSpeed = 360; // Degrees per second for rotation (slower)

      // Interpolate position downwards
      currentPositionRef.current.lerp(targetPositionRef.current, lerpSpeed);

      // Accumulate rotation angle over time (to ensure full 360-degree rotation)
      if (
        startRotationQuatRef.current &&
        accumulatedRotationAngleRef.current < 360
      ) {
        // Calculate how much to rotate this frame
        const rotationDelta = rotationSpeed * delta;
        accumulatedRotationAngleRef.current = Math.min(
          accumulatedRotationAngleRef.current + rotationDelta,
          360
        );

        // Create rotation quaternion for current accumulated angle
        const currentRotationX = new Quaternion().setFromAxisAngle(
          new Vector3(1, 0, 0),
          mu.degToRad(accumulatedRotationAngleRef.current)
        );

        // Apply rotation: startRotation * currentRotationX
        currentRotationRef.current
          .copy(startRotationQuatRef.current)
          .multiply(currentRotationX);
      }

      // Apply to the appropriate ref
      if (rotationCenter) {
        groupRef.current.position.copy(currentPositionRef.current);
        if (startRotationQuatRef.current) {
          groupRef.current.quaternion.copy(currentRotationRef.current);
        }
      } else {
        if (meshRef.current) {
          meshRef.current.position.copy(currentPositionRef.current);
          if (startRotationQuatRef.current) {
            meshRef.current.quaternion.copy(currentRotationRef.current);
          }
        }
      }

      // Check if downward animation is complete
      const positionDiff = currentPositionRef.current.distanceTo(
        targetPositionRef.current
      );
      const rotationComplete = accumulatedRotationAngleRef.current >= 360;

      if (positionDiff < 0.01 && rotationComplete) {
        // Downward animation complete - snap to exact position and rotation
        if (rotationCenter) {
          groupRef.current.position.copy(targetPositionRef.current);
          if (targetRotationRef.current) {
            groupRef.current.quaternion.copy(targetRotationRef.current);
          }
        } else {
          if (meshRef.current) {
            meshRef.current.position.copy(targetPositionRef.current);
            if (targetRotationRef.current) {
              meshRef.current.quaternion.copy(targetRotationRef.current);
            }
          }
        }
        setIsMovingDown(false);
        // Reset rotation tracking
        accumulatedRotationAngleRef.current = 0;
        startRotationQuatRef.current = null;
      }

      return; // Skip autoRotate and bobbing during downward animation
    }

    // Bobbing animation logic (only when not animating)
    if (enableBobbing) {
      // Initialize base Y position if not set
      if (baseYPositionRef.current === null) {
        baseYPositionRef.current = targetRef.current.position.y;
        wasBobbingRef.current = true;
      }

      // Apply bobbing animation
      if (baseYPositionRef.current !== null) {
        const time = state.clock.elapsedTime;
        const bobbingY =
          baseYPositionRef.current +
          Math.sin(time * bobbingSpeed + bobbingOffset) * bobbingAmplitude;

        if (rotationCenter) {
          groupRef.current.position.y = bobbingY;
        } else {
          if (meshRef.current) {
            meshRef.current.position.y = bobbingY;
          }
        }
      }
    } else {
      // When bobbing stops, just mark that we're no longer bobbing
      // Don't try to maintain Y position - let it stay where it naturally is
      if (wasBobbingRef.current) {
        wasBobbingRef.current = false;
        // Clear baseYPositionRef so it can be reinitialized if bobbing restarts
        baseYPositionRef.current = null;
      }
    }

    // Auto-rotate logic (only when not animating)
    if (autoRotate) {
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

    // Helper function to load diffuse and normal textures
    const loadTextures = (
      diffuseUrl: string,
      onComplete: (diffuseTex: Texture, normalTex: Texture) => void
    ) => {
      loader.load(diffuseUrl, (diffuseTex: Texture) => {
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
          onComplete(diffuseTex, normalTex);
        });
      });
    };

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

            // Helper function to apply texture to a single material
            const applyToMaterial = (mat: StandardMaterial) => {
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
            };

            // Apply textures to material
            if (mesh.material instanceof StandardMaterial) {
              applyToMaterial(mesh.material);
            } else if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat: Material) => {
                if (mat instanceof StandardMaterial) {
                  applyToMaterial(mat);
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
                    applyTexture(compositedTex, normalTex);
                  });
                }
              )
              .catch((error) => {
                console.error("Failed to composite textures:", error);
                if (!isMountedRef.current) return;

                // Fallback to regular diffuse texture loading
                loadTextures(diffuseTexture, (diffuseTex, normalTex) => {
                  applyTexture(diffuseTex, normalTex);
                });
              });
          } else {
            // No overlay - use existing logic to load diffuse texture directly
            loadTextures(diffuseTexture, (diffuseTex, normalTex) => {
              applyTexture(diffuseTex, normalTex);
            });
          }
        }
      }
    });

    // Cleanup function to dispose textures and canvases
    return () => {
      isMountedRef.current = false;
      texturesRef.current.forEach((texture) => {
        if (texture) {
          texture.dispose();
        }
      });
      texturesRef.current = [];

      // Cleanup canvas references
      canvasRef.current.forEach((canvas) => {
        if (canvas) {
          // Clear canvas to free memory
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
      canvasRef.current = [];

      // Dispose of materials
      scene.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((mat) => {
            if (mat instanceof StandardMaterial) {
              if (mat.map) mat.map.dispose();
              if (mat.normalMap) mat.normalMap.dispose();
            }
            mat.dispose();
          });
        }
        if (child instanceof Mesh) {
          child.geometry.dispose();
        }
      });
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
    [meshRef.current, groupRef.current].forEach((ref) => {
      if (ref) {
        ref.rotation.order = "XYZ";
      }
    });
  }, []);

  // Notify parent when overlay should be shown/hidden
  useEffect(() => {
    if (onShowOverlay) {
      onShowOverlay(show2DOverlay);
    }
  }, [show2DOverlay, onShowOverlay]);

  // If rotationCenter is specified, wrap in a Group to handle pivot point
  if (rotationCenter) {
    // Calculate relative position: object position - rotation center
    const relativePosition: [number, number, number] = [
      position[0] - rotationCenter[0],
      position[1] - rotationCenter[1],
      position[2] - rotationCenter[2],
    ];

    return (
      <group
        ref={groupRef}
        position={rotationCenter}
        rotation={finalRotation}
        onClick={clickable && !clicksDisabled ? handleClick : undefined}
        onPointerEnter={hoverable ? handlePointerEnter : undefined}
        onPointerLeave={hoverable ? handlePointerLeave : undefined}
      >
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
      onClick={clickable && !clicksDisabled ? handleClick : undefined}
      onPointerEnter={hoverable ? handlePointerEnter : undefined}
      onPointerLeave={hoverable ? handlePointerLeave : undefined}
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
  hoverable?: boolean; // Enable/disable hover scale effect (default: true)
  clickable?: boolean; // Enable/disable click interaction (default: true)
  cards?: CardType[]; // Cards to display in the overlay
  onShowOverlay?: (show: boolean) => void; // Callback when overlay should be shown/hidden
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
  hoverable = true,
  clickable = true,
  cards,
  onShowOverlay,
}: PackModelProps) {
  // Default model path - using cardpack2.glb from assets folder
  // You can override this by passing a custom modelPath prop
  // If no custom path is provided, use the imported model URL
  const defaultModelPath = modelPath || cardpackModelUrl;

  // State to track 2D overlay visibility
  const [show2DOverlay, setShow2DOverlay] = useState(false);

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
        console.warn("WebGL context lost in PackModel");
        // Dispose of resources to free memory
        scene.traverse((object) => {
          if (object instanceof Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
              materials.forEach((mat) => {
                if (mat instanceof StandardMaterial) {
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
        console.log("WebGL context restored in PackModel");
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

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true }}
      >
        <ColorEnhancement />
        <WebGLContextHandler />
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
            hoverable={hoverable}
            clickable={clickable}
            onShowOverlay={(show) => {
              setShow2DOverlay(show);
              if (onShowOverlay) {
                onShowOverlay(show);
              }
            }}
            cards={cards}
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
      {/* 2D Overlay - rendered over the canvas */}
      {show2DOverlay && cards && cards.length > 0 && (
        <div className="absolute inset-0 pointer-events-auto z-10 flex items-center justify-center">
          <CardDrawings
            cards={cards}
            onClose={() => {
              setShow2DOverlay(false);
              if (onShowOverlay) {
                onShowOverlay(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
