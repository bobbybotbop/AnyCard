import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import { Card as CardType } from "@full-stack/types";
import { getUserData } from "../api/cards";
import { useAuth } from "../auth/authProvider";

// Scalable wrapper component that scales the entire card as a flat unit using CSS transform
function ScalableCard({
  card,
  onClick,
}: {
  card: CardType;
  onClick?: () => void;
}) {
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
        <Card card={card} enableTilt={true} onClick={onClick} />
      </div>
    </div>
  );
}

type SortOption =
  | "alphabet"
  | "alphabetReverse"
  | "rarityLowHigh"
  | "rarityHighLow"
  | "hpLowHigh"
  | "hpHighLow";

const rarityRank: Record<string, number> = {
  common: 1,
  uncom: 2,
  rare: 3,
  epic: 4,
  legend: 5,
  mythic: 6,
};

const Inventory = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("alphabet");
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  useEffect(() => {
    const fetchUserCards = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getUserData(user.uid);
        setCards(userData.cards || []);
      } catch (error) {
        console.error("Error fetching user cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [user]);

  // Lock body scroll while a card is expanded
  useEffect(() => {
    if (!selectedCard) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedCard]);

  // Allow closing with Escape key when a card is expanded
  useEffect(() => {
    if (!selectedCard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCard(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard]);

  const sortedCards = [...cards].sort((a, b) => {
    switch (sortOption) {
      case "alphabet":
        return a.name.localeCompare(b.name);
      case "alphabetReverse":
        return b.name.localeCompare(a.name);
      case "rarityLowHigh": {
        const aRank = rarityRank[a.rarity] ?? Number.MAX_SAFE_INTEGER;
        const bRank = rarityRank[b.rarity] ?? Number.MAX_SAFE_INTEGER;
        if (aRank === bRank) {
          return a.name.localeCompare(b.name);
        }
        return aRank - bRank;
      }
      case "rarityHighLow": {
        const aRank = rarityRank[a.rarity] ?? Number.MIN_SAFE_INTEGER;
        const bRank = rarityRank[b.rarity] ?? Number.MIN_SAFE_INTEGER;
        if (aRank === bRank) {
          return a.name.localeCompare(b.name);
        }
        return bRank - aRank;
      }
      case "hpLowHigh":
        if (a.hp === b.hp) {
          return a.name.localeCompare(b.name);
        }
        return a.hp - b.hp;
      case "hpHighLow":
        if (a.hp === b.hp) {
          return a.name.localeCompare(b.name);
        }
        return b.hp - a.hp;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
        <div className="w-[90%] mx-auto">
          <div className="text-xl text-gray-600 text-center">
            Loading inventory...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="w-[90%] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 mt-10">
          <h2 className="text-2xl font-semibold text-gray-700  ">
            Your Collection
          </h2>
          {cards.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="inventory-sort"
                className="text-sm text-gray-700 font-medium"
              >
                Sort by:
              </label>
              <select
                id="inventory-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="alphabet">Alphabet (A–Z)</option>
                <option value="alphabetReverse">Alphabet (Z–A)</option>
                <option value="rarityLowHigh">Rarity (Low → High)</option>
                <option value="rarityHighLow">Rarity (High → Low)</option>
                <option value="hpLowHigh">HP (Low → High)</option>
                <option value="hpHighLow">HP (High → Low)</option>
              </select>
            </div>
          )}
        </div>
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedCards.map((card, index) => (
              <ScalableCard
                key={`card-${index}`}
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">No cards in your collection yet.</p>
          </div>
        )}
      </div>

      {/* Expanded card overlay */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="w-[min(90vw,420px)] h-[90vh] flex items-center justify-center"
              initial={{ scale: 0.85, y: 40, opacity: 0.9 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="scale-[1.5] sm:scale-[1.7] md:scale-[1.8]">
                <Card
                  card={selectedCard}
                  enableTilt={true}
                  isExpanded={true}
                  onClose={() => setSelectedCard(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Inventory;
