import { useState, useRef, useEffect } from "react";
import Card from "./Card";
import { Card as CardType } from "@full-stack/types";

interface CardDrawingsProps {
  cards: CardType[];
}

const MAX_VISIBLE_CARDS = 4; // Show up to 4 cards in the stack

// Tilted card wrapper that applies 3D tilt effect based on mouse position
function TiltedCardWrapper({
  card,
  children,
  isExiting,
}: {
  card: CardType;
  children: React.ReactNode;
  isExiting?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isExiting) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate tilt angles (max 15 degrees)
    const maxTilt = 10;
    const tiltX = (mouseY / (rect.height / 2)) * maxTilt;
    const tiltY = (mouseX / (rect.width / 2)) * -maxTilt;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    if (!isExiting) {
      setTilt({ x: 0, y: 0 });
    }
  };

  // Reset tilt when exiting
  useEffect(() => {
    if (isExiting) {
      setTilt({ x: 0, y: 0 });
    }
  }, [isExiting]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
        transition: isExiting
          ? "transform 0.5s ease-in-out"
          : "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  );
}

// Scalable wrapper component that scales the entire card as a flat unit using CSS transform
function ScalableCard({ card }: { card: CardType }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        // Base card size: 245px × 342px
        // Calculate scale based on available space
        const scaleX = width / 245;
        const scaleY = height / 342;
        const newScale = Math.min(scaleX, scaleY, 1.5); // Cap at 150% to prevent too large
        setScale(Math.max(0.3, newScale)); // Min 30% scale
      }
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          width: "245px",
          height: "342px",
        }}
      >
        <Card card={card} />
      </div>
    </div>
  );
}

export default function CardDrawings({ cards }: CardDrawingsProps) {
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
      <div className="grid grid-cols-5 auto-rows-[minmax(0,1fr)] gap-x-8 gap-y-10 justify-items-center items-start w-full">
        {viewedCards.map((card, index) => (
          <ScalableCard key={index} card={card} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-[400px]">
      {visibleCards.map(({ card, index, position }) => {
        const isTopCard = position === 0;
        const isExiting = isTopCard && isAnimating;

        // Calculate transform values for staggered effect
        // Cards behind the top card are offset, scaled, rotated, and have reduced opacity
        const offsetX = position * 15; // Horizontal offset: 0px, 15px, 30px, 45px
        const offsetY = position * 8; // Vertical offset: 0px, 8px, 16px, 24px
        const scale = 1 - position * 0.03; // Scale: 100%, 97%, 94%, 91%
        const rotation = position * 1.5; // Rotation: 0°, 1.5°, 3°, 4.5°
        const opacity = Math.max(0.3, 1 - position * 0.15); // Opacity: 100%, 85%, 70%, 55% (min 30%)

        // Exit animation: slide left, move up, rotate, and fade out
        const exitTransform = isExiting
          ? "translateX(-300px) translateY(-50px) rotate(-15deg) scale(0.8)"
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
            {isTopCard ? (
              <TiltedCardWrapper card={card} isExiting={isExiting}>
                <Card card={card} />
              </TiltedCardWrapper>
            ) : (
              <Card card={card} />
            )}
          </div>
        );
      })}
    </div>
  );
}
