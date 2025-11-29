import React, { useState, useRef, useEffect } from "react";
import { Card as CardType } from "../data/cards";

interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {
  const [imageError, setImageError] = useState(false);
  const [titleOverflowing, setTitleOverflowing] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string>("#fef9e7"); // Default yellow-50
  const [secondaryColor, setSecondaryColor] = useState<string>("#facc15"); // Default yellow-400
  const imageRef = useRef<HTMLImageElement>(null);

  const rarityColors: Record<string, string> = {
    common: "bg-gray-200 text-gray-700",
    uncom: "bg-green-200 text-green-800",
    rare: "bg-blue-200 text-blue-800",
    epic: "bg-purple-200 text-purple-800",
    legend: "bg-orange-200 text-orange-800",
    mythic: "bg-red-200 text-red-800",
  };

  const rarityColor = rarityColors[card.rarity] || "bg-gray-200 text-gray-700";

  // Check if card is legendary or mythic
  // const isSpecialRarity = (): boolean => {
  //   return card.rarity === "legend" || card.rarity === "mythic";
  // };

  // Get inverse border color based on text color
  const getBorderColor = (textColor: string): string => {
    // If text is dark (gray-800), use white border; if light (gray-200), use black border
    return textColor === "#1f2937" ? "#ffffff" : "#000000";
  };

  // Convert RGB to LAB color space for perceptual color difference
  const rgbToLab = (
    r: number,
    g: number,
    b: number
  ): [number, number, number] => {
    // Normalize RGB values
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Convert to linear RGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ
    r *= 100;
    g *= 100;
    b *= 100;

    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Normalize for D65 illuminant
    x /= 95.047;
    y /= 100.0;
    z /= 108.883;

    // Convert to LAB
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const bLab = 200 * (y - z);

    return [l, a, bLab];
  };

  // Calculate Delta E (perceptual color difference)
  const calculateDeltaE = (
    color1: [number, number, number],
    color2: [number, number, number]
  ): number => {
    const lab1 = rgbToLab(color1[0], color1[1], color1[2]);
    const lab2 = rgbToLab(color2[0], color2[1], color2[2]);

    const deltaL = lab1[0] - lab2[0];
    const deltaA = lab1[1] - lab2[1];
    const deltaB = lab1[2] - lab2[2];

    // Delta E 76 formula
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  };

  // Convert RGB array to hex string
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
  };

  // Extract prominent colors from image
  const getProminentColors = (
    imageData: ImageData
  ): Array<[number, number, number]> => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Sample every Nth pixel for efficiency
    const sampleRate = 4;
    const colorMap = new Map<string, number>();

    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // Skip transparent pixels
        if (a < 255) continue;

        // Quantize colors to reduce noise
        const quantizedR = Math.floor(r / 16) * 16;
        const quantizedG = Math.floor(g / 16) * 16;
        const quantizedB = Math.floor(b / 16) * 16;
        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
    }

    // Sort colors by frequency
    const sortedColors = Array.from(colorMap.entries())
      .map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(",").map(Number);
        return { color: [r, g, b] as [number, number, number], count };
      })
      .sort((a, b) => b.count - a.count);

    return sortedColors.map((item) => item.color);
  };

  // Find two colors that are different enough
  const findTwoDifferentColors = (
    colors: Array<[number, number, number]>,
    threshold: number = 30
  ): [[number, number, number], [number, number, number]] | null => {
    if (colors.length < 2) return null;

    const primary = colors[0];

    // Find the first color that is different enough from primary
    for (let i = 1; i < colors.length; i++) {
      const deltaE = calculateDeltaE(primary, colors[i]);
      if (deltaE >= threshold) {
        return [primary, colors[i]];
      }
    }

    // If no color meets threshold, return first two anyway
    return [primary, colors[1] || primary];
  };

  // Extract colors from image
  const extractColorsFromImage = (imageSrc: string, isFallback = false) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const prominentColors = getProminentColors(imageData);
        const twoColors = findTwoDifferentColors(prominentColors);

        if (twoColors) {
          const [primary, secondary] = twoColors;
          setPrimaryColor(rgbToHex(primary[0], primary[1], primary[2]));
          setSecondaryColor(rgbToHex(secondary[0], secondary[1], secondary[2]));
        }
      } catch (error) {
        console.error("Error extracting colors:", error);
        // Keep default colors on error
      }
    };

    img.onerror = () => {
      // If main image fails, try ImageNotFound.jpg
      if (!isFallback && imageSrc !== "/ImageNotFound.jpg") {
        extractColorsFromImage("/ImageNotFound.jpg", true);
      }
    };

    img.src = imageSrc;
  };

  // Convert hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  };

  // Calculate relative luminance (WCAG formula)
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0.5; // Default to medium luminance

    const [r, g, b] = rgb.map((val) => {
      val = val / 255;
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Determine text color based on background luminance
  const getTextColor = (backgroundColor: string): string => {
    const luminance = getLuminance(backgroundColor);
    // If luminance is less than 0.5 (dark background), use light grey text
    return luminance < 0.5 ? "#e5e7eb" : "#1f2937"; // gray-200 or gray-800
  };

  // Blend two colors with adjustable ratio
  // ratio: 0.0 = 100% color1, 0.5 = 50-50 blend, 1.0 = 100% color2
  const blendColors = (
    color1: string,
    color2: string,
    ratio: number = 0.5
  ): string => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1; // Fallback if conversion fails

    // Clamp ratio between 0 and 1
    const clampedRatio = Math.max(0, Math.min(1, ratio));

    // Weighted blend: color1 * (1 - ratio) + color2 * ratio
    const blendedR = Math.round(
      rgb1[0] * (1 - clampedRatio) + rgb2[0] * clampedRatio
    );
    const blendedG = Math.round(
      rgb1[1] * (1 - clampedRatio) + rgb2[1] * clampedRatio
    );
    const blendedB = Math.round(
      rgb1[2] * (1 - clampedRatio) + rgb2[2] * clampedRatio
    );

    return rgbToHex(blendedR, blendedG, blendedB);
  };

  // Create gradient string for borders
  const createGradient = (): string => {
    const blendedColor = blendColors(primaryColor, secondaryColor, 0.3);
    return `linear-gradient(135deg, ${blendedColor}, ${secondaryColor}, ${blendedColor})`;
  };

  // Helper function to get rarity percentage based on pack distribution
  const getRarityPercentage = (rarity: string): string => {
    const rarityDistribution: Record<string, number> = {
      common: 6,
      uncom: 5,
      rare: 4,
      epic: 3,
      legend: 2,
      mythic: 1,
    };
    const totalCards = 21;
    const count = rarityDistribution[rarity] || 0;
    const percentage = (count / totalCards) * 100;
    return `${percentage.toFixed(2)}%`;
  };

  // Helper function to measure text width using Canvas API
  const measureTextWidth = (text: string, font: string): number => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;

    context.font = font;
    return context.measureText(text).width;
  };

  let nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (nameRef.current) {
      const availableWidth = nameRef.current.clientWidth;
      // Get the computed font style from the actual element for accurate measurement
      const computedStyle = window.getComputedStyle(nameRef.current);
      const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      const textWidth = measureTextWidth(card.name, font);

      const hasOverflow = textWidth > availableWidth;
      setTitleOverflowing(hasOverflow);
    }
  }, [card.name]);

  // Extract colors when image loads
  useEffect(() => {
    const currentImageSrc = imageError ? "/ImageNotFound.jpg" : card.picture;
    extractColorsFromImage(currentImageSrc);
  }, [card.picture, imageError]);

  // const isSpecial = isSpecialRarity();
  const isSpecial = false; // Commented out special logic
  const textColor = getTextColor(primaryColor);
  const borderColor = getBorderColor(textColor);

  return (
    <div
      className="w-[245px] h-[342px] rounded-lg p-1 shadow-lg relative"
      style={{
        background: createGradient(),
      }}
    >
      {/* Background image for special cards */}
      {/* {isSpecial && (
        <img
          ref={imageRef}
          src={imageError ? "/ImageNotFound.jpg" : card.picture}
          alt={card.name}
          className="absolute inset-0 w-full my-auto object-cover rounded-lg"
          style={{ zIndex: 5 }}
          onError={() => setImageError(true)}
          onLoad={() => {
            if (imageRef.current && !imageError) {
              extractColorsFromImage(imageRef.current.src);
            }
          }}
        />
      )} */}
      <div
        className={`w-full h-full rounded-lg overflow-hidden flex flex-col ${
          // isSpecial ? "relative" : ""
          ""
        }`}
        style={{
          backgroundColor: primaryColor, // isSpecial ? "transparent" : primaryColor,
          zIndex: "auto", // isSpecial ? 10 : "auto",
        }}
      >
        {/* Top Header Section */}
        <div
          className="flex items-center justify-between p-2 pb-0"
          style={{ backgroundColor: primaryColor }} // isSpecial ? "transparent" : primaryColor
        >
          {/* Rarity Badge */}
          <div
            className={`px-1.5 py-.5 rounded text-[.5rem] font-bold uppercase ${rarityColor} whitespace-nowrap`}
          >
            {card.rarity}
          </div>

          {/* Card Name */}
          <div className="flex-1 px-2 min-w-0">
            <h2
              className="text-lg font-bold"
              ref={nameRef}
              style={
                {
                  color: textColor,
                  WebkitTextStroke: "none", // isSpecial ? `1px ${borderColor}` : "none",
                } as React.CSSProperties
              }
            >
              {!titleOverflowing && card.name}
            </h2>
          </div>

          {/* HP */}
          <div className="text-right whitespace-nowrap">
            <span
              className="text-base font-bold flex"
              style={
                {
                  color: textColor,
                  WebkitTextStroke: "none", // isSpecial ? `1px ${borderColor}` : "none",
                } as React.CSSProperties
              }
            >
              <p className="pr-0.5 text-[.5rem] mt-auto mb-1">HP</p> {card.hp}
            </span>
          </div>
        </div>
        {/* card name if overflowing */}
        <h2
          className="text-lg font-bold px-2 self-center"
          style={{
            color: textColor,
            WebkitTextStroke: isSpecial ? `1px ${borderColor}` : "none",
          }}
        >
          {titleOverflowing && card.name}
        </h2>

        {/* Illustration Area */}
        <div className="relative w-[calc(100%-24px)] h-[180px] mx-auto mt-1 rounded-sm overflow-hidden">
          {/* {isSpecial ? (
            // Hidden image for spacing on special cards
            <img
              src={imageError ? "/ImageNotFound.jpg" : card.picture}
              alt=""
              className="w-full h-full object-contain object-center rounded-sm opacity-0 pointer-events-none"
              aria-hidden="true"
            />
          ) : ( */}
          <div
            className="w-full h-full rounded-sm p-0.5"
            style={{
              background: createGradient(),
            }}
          >
            <div
              className="w-full h-full rounded-sm overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              <img
                ref={imageRef}
                src={imageError ? "/ImageNotFound.jpg" : card.picture}
                alt={card.name}
                className="w-full h-full object-contain object-center rounded-sm"
                onError={() => setImageError(true)}
                onLoad={() => {
                  if (imageRef.current && !imageError) {
                    extractColorsFromImage(imageRef.current.src);
                  }
                }}
              />
            </div>
          </div>
          {/* )} */}
        </div>

        {/* Attack Section */}
        <div
          className="px-3 py-2 space-y-2.5 flex-1"
          style={{ backgroundColor: primaryColor }} // isSpecial ? "transparent" : primaryColor
        >
          {card.attacks.map((attack, index) => (
            <div key={index} className="flex items-baseline justify-between">
              <span
                className="text-sm font-bold flex-1"
                style={{
                  color: textColor,
                  WebkitTextStroke: "none", // isSpecial ? `1px ${borderColor}` : "none",
                }}
              >
                {attack.name}
              </span>
              <span
                className="text-sm font-bold ml-auto pl-2"
                style={{
                  color: textColor,
                  WebkitTextStroke: "none", // isSpecial ? `1px ${borderColor}` : "none",
                }}
              >
                {attack.damage}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Footer Section */}
        <div
          style={{
            backgroundColor: primaryColor, // isSpecial ? "transparent" : primaryColor,
          }}
        >
          <div
            className="px-3 py-1 text-[10px] flex justify-between items-center"
            style={{
              color: textColor,
              WebkitTextStroke: isSpecial ? `1px ${borderColor}` : "none",
            }}
          >
            <span>{card.fromPack}</span>
            <span>{getRarityPercentage(card.rarity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
