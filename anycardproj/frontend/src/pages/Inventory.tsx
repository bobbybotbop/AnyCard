import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import { Card as CardType } from "@full-stack/types";
import { getUserData } from "../api/api";
import { useAuth } from "../auth/authProvider";
import { Search } from "@mynaui/icons-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

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

  // Debounce search query to avoid filtering on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize sorted cards to avoid re-sorting on every render
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
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
  }, [cards, sortOption]);

  // Memoize filtered cards to avoid re-filtering on every render
  const filteredCards = useMemo(() => {
    return sortedCards.filter((card) =>
      card.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [sortedCards, debouncedSearchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
        <div className="w-[90%] mx-auto">
          <div className="text-xl text-white/90 text-center">
            Loading inventory...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="mt-[8vh] w-[90%] mx-auto">
        {/* Search Bar */}f

        <div className="flex flex-row justify-center mt-8 mb-4">
          <div className="relative w-[50%] my-auto mr-10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards by name..."
              className="w-full !px-6 !pr-14 text-lg !border-2 !shadow-xl !border-white/30 !bg-blue-400/30 !rounded-4xl h-10 focus:outline-none focus:border-blue-500 backdrop-blur-sm !text-white/90 placeholder:text-white/90"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2">
              <Search className="text-white/90 w-5 h-5" />
            </div>
          </div>
          {cards.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="inventory-sort"
                className="text-sm text-white/90 font-medium"
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
          filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map((card, key) => (
                <Card
                  key={key}
                  card={card}
                  enableTilt={true}
                  autoScale={true}
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-white/90 py-12">
              <p className="text-lg">
                {debouncedSearchQuery.trim()
                  ? "No cards found matching your search."
                  : "No cards in your collection yet."}
              </p>
            </div>
          )
        ) : (
          <div className="text-center text-white/90 py-12">
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
