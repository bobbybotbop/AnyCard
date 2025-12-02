import { useState } from "react";
import Card from "./Card";
import { Card as CardType } from "@full-stack/types";

interface CardDrawingsProps {
  cards: CardType[];
  onClose?: () => void;
}

const MAX_VISIBLE_CARDS = 4; // Show up to 4 cards in the stack

export default function CardDrawings({ cards, onClose }: CardDrawingsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCardClick = () => {
    if (isAnimating || currentIndex >= cards.length) return;

    setIsAnimating(true);

    // After animation completes, advance to next card
    // Cards behind will automatically animate forward due to position changes
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 500);
  };

  // Calculate which cards to display (current + up to MAX_VISIBLE_CARDS behind it)
  const getVisibleCards = () => {
    const visible: Array<{ card: CardType; index: number; position: number }> =
      [];

    for (
      let i = 0;
      i < MAX_VISIBLE_CARDS && currentIndex + i < cards.length;
      i++
    ) {
      visible.push({
        card: cards[currentIndex + i],
        index: currentIndex + i,
        position: i, // 0 = top card, 1 = second card, etc.
      });
    }

    return visible;
  };

  const visibleCards = getVisibleCards();

  // If no cards left, show all viewed cards in a grid
  if (currentIndex >= cards.length) {
    const viewedCards = cards.slice(0, currentIndex);
    return (
      <div className="w-full h-full max-w-full max-h-full overflow-hidden flex flex-col relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
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
        <div className="grid grid-cols-5 auto-rows-[minmax(0,1fr)] gap-x-8 gap-y-10 justify-items-center items-start w-full flex-1 overflow-auto">
          {viewedCards.map((card, index) => (
            <Card key={index} card={card} autoScale={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full max-w-full max-h-full overflow-hidden">
      {visibleCards.map(({ card, index, position }) => {
        const isTopCard = position === 0;
        const isExiting = isTopCard && isAnimating;

        // Calculate transform values for staggered effect
        // Cards behind the top card are offset, scaled, rotated, and have reduced opacity
        const baseScale = 1.5; // Increased base scale for larger cards
        const offsetX = position * 15; // Horizontal offset: 0px, 15px, 30px, 45px
        const offsetY = position * 8; // Vertical offset: 0px, 8px, 16px, 24px
        const scale = baseScale * (1 - position * 0.03); // Scale: 150%, 145.5%, 141%, 136.5%
        const rotation = position * 1.5; // Rotation: 0°, 1.5°, 3°, 4.5°
        const opacity = Math.max(0.3, 1 - position * 0.15); // Opacity: 100%, 85%, 70%, 55% (min 30%)

        // Exit animation: slide left, move up, rotate, and fade out
        const exitTransform = isExiting
          ? "translateX(-300px) translateY(-50px) rotate(-15deg) scale(1.2)"
          : `translateX(${offsetX}px) translateY(${offsetY}px) scale(${scale}) rotate(${rotation}deg)`;
        const exitOpacity = isExiting ? 0 : opacity;

        return (
          <div
            key={index}
            className="absolute transition-all duration-500 ease-in-out"
            style={{
              transform: exitTransform,
              opacity: exitOpacity,
              zIndex: MAX_VISIBLE_CARDS - position, // Higher z-index for cards closer to front
              cursor: isTopCard ? "pointer" : "default",
              pointerEvents: isTopCard ? "auto" : "none", // Only top card is clickable
            }}
            onClick={isTopCard ? handleCardClick : undefined}
          >
            <Card card={card} enableTilt={isTopCard} isExiting={isExiting} />
          </div>
        );
      })}
    </div>
  );
}
