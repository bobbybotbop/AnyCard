import { useEffect, useState } from "react";
import { userData, Card } from "@full-stack/types";
import { getUserData } from "../api/cards";
import { useParams } from "react-router-dom";
import CardComponent from "../components/Card";
import CardDrawings from "../components/CardDrawings";

const TradingOther = () => {
  const { uid } = useParams<{ uid: string }>();
  const [user, setUser] = useState<userData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) {
        setError("User Data does not exist");
        setLoading(false);
        return;
      }
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
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white">
      <div className="w-[90%] mx-auto">
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
            {user.cards.map((card) => (
              <CardComponent
                card={card}
                enableTilt={true}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-xl">This user has no cards yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingOther;
