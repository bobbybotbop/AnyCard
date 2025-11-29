import { useState, useRef, useEffect } from "react";
import Card from "../components/Card";
import { Card as CardType } from "@full-stack/types";
import { getUserData } from "../api/cards";
import { useAuth } from "../auth/authProvider";

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

const Inventory = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Your Collection
        </h2>
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {cards.map((card, index) => (
              <ScalableCard key={`card-${index}`} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">No cards in your collection yet.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Inventory;
