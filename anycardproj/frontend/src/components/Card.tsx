import { useState, useRef, useEffect } from "react";
import { Card as CardType } from "../data/cards";

interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {
  const [imageError, setImageError] = useState(false);
  const [titleOverflowing, setTitleOverflowing] = useState(false);

  const rarityColors: Record<string, string> = {
    common: "bg-gray-200 text-gray-700",
    uncom: "bg-green-200 text-green-800",
    rare: "bg-blue-200 text-blue-800",
    epic: "bg-purple-200 text-purple-800",
    legend: "bg-orange-200 text-orange-800",
    mythic: "bg-red-200 text-red-800",
  };

  const rarityColor = rarityColors[card.rarity] || "bg-gray-200 text-gray-700";

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

      console.log(
        `Available width: ${availableWidth}, Text width: ${textWidth}`
      );

      const hasOverflow = textWidth > availableWidth;
      setTitleOverflowing(hasOverflow);

      if (hasOverflow) {
        console.log(card.name + " has overflow");
      }
    }
  }, [card.name]);
  return (
    <div className="w-[245px] h-[342px] border-4 border-yellow-400 bg-yellow-50 rounded-lg overflow-hidden shadow-lg flex flex-col">
      {/* Top Header Section */}
      <div className="flex items-center justify-between p-2 pb-0 bg-yellow-50">
        {/* Rarity Badge */}
        <div
          className={`px-1.5 py-.5 rounded text-[.5rem] font-bold uppercase ${rarityColor} whitespace-nowrap`}
        >
          {card.rarity}
        </div>

        {/* Card Name */}
        <div className="flex-1 px-2 min-w-0">
          <h2 className="text-lg font-bold text-gray-800" ref={nameRef}>
            {!titleOverflowing && card.name}
          </h2>
        </div>

        {/* HP */}
        <div className="text-right whitespace-nowrap">
          <span className="text-base font-bold text-gray-800 flex">
            <p className="pr-0.5 text-[.5rem] mt-auto mb-1">HP</p> {card.hp}
          </span>
        </div>
      </div>
      {/* card name if overflowing */}
      <h2 className="text-lg font-bold text-gray-800 px-2 self-center">
        {titleOverflowing && card.name}
      </h2>

      {/* Illustration Area */}
      <div className="relative w-[calc(100%-16px)] h-[180px] bg-gradient-to-b from-blue-200 to-blue-300 mx-2 mt-1 rounded-sm overflow-hidden">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-200 to-blue-300 text-gray-500 text-xs">
            <span className="text-center px-2">{card.name}</span>
          </div>
        ) : (
          <img
            src={card.picture}
            alt={card.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Attack Section */}
      <div className="px-3 py-2 space-y-2.5 flex-1 bg-yellow-50">
        {card.attacks.map((attack, index) => (
          <div key={index} className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-gray-800 flex-1">
              {attack.name}
            </span>
            <span className="text-sm font-bold text-gray-800 ml-auto pl-2">
              {attack.damage}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-yellow-50">
        {/* Card Number and Copyright */}
        <div className="px-3 py-1 text-[10px] text-gray-600 text-center">
          AnyCard Trading Card Game
        </div>
      </div>
    </div>
  );
}
