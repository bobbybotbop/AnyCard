import { useEffect, useState } from "react";
import { userData, Card } from "@full-stack/types";
import { getUserData } from "../api/cards";
import { useParams } from "react-router-dom";

interface TradingOtherProps {
  onBack?: () => void;
}

const TradingOther = ({ onBack }: TradingOtherProps) => {
  const { uid } = useParams<{ uid: string }>();
  const [user, setUser] = useState<userData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) throw Error("User Data does not exist");
      try {
        setLoading(true);
        setError(null);
        const userData = await getUserData(uid);
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    console.log("Selected card:", card);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="w-[90%] mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            ← Back to Trading
          </button>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {user.username}'s Cards
          </h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Level {user.level} • {user.cards?.length || 0} cards
          </p>
        </div>

        {user.cards && user.cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {user.cards.map((card: Card, idx: number) => (
              <div
                key={idx}
                onClick={() => handleCardClick(card)}
                className="cursor-pointer p-6 border-2 rounded-lg shadow-md bg-white hover:shadow-xl hover:scale-105 transition-all duration-200 hover:border-blue-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg">{card.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      card.rarity === "mythic"
                        ? "bg-purple-500 text-white"
                        : card.rarity === "legend"
                        ? "bg-yellow-500 text-white"
                        : card.rarity === "epic"
                        ? "bg-red-500 text-white"
                        : card.rarity === "rare"
                        ? "bg-blue-500 text-white"
                        : card.rarity === "uncom"
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {card.rarity}
                  </span>
                </div>

                {card.picture && (
                  <div className="mb-3 h-32 bg-gray-100 rounded flex items-center justify-center">
                    <img
                      src={card.picture}
                      alt={card.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    HP: <span className="text-red-600">{card.hp}</span>
                  </p>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-600">
                      Attacks:
                    </p>
                    {card.attacks?.map((attack, i) => (
                      <div
                        key={i}
                        className="text-xs bg-gray-50 p-2 rounded flex justify-between"
                      >
                        <span>{attack.name}</span>
                        <span className="font-semibold">{attack.damage}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    From: {card.fromPack}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-xl">This user has no cards yet</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TradingOther;
