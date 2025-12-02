import { useState } from "react";
import { userData, Card } from "@full-stack/types";

interface TradeUserDisplayProps {
  user: userData;
}

export default function TradeUserDisplay({ user }: TradeUserDisplayProps) {
  const [selectedUser, setSelectedUser] = useState<userData | null>(null);

  const handleCardClick = (user: userData) => {
    setSelectedUser(user);
    console.log("Selected user:", user);
    // Add your click handler logic here
  };

  // Get first 3 cards
  const displayedCards = (user.cards || []).slice(0, 3);

  return (
    <div className="p-4">
      <div
        onClick={() => handleCardClick(user)}
        className="cursor-pointer p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow mb-6"
      >
        <h3 className="text-lg font-semibold">{user.username}</h3>
        <p className="text-sm text-gray-600">{user.email}</p>

        {/* Display Cards */}
        {displayedCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCards.map((card: Card, idx: number) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-md bg-white"
              >
                <h4 className="font-semibold">{card.name}</h4>
                <p className="text-sm text-gray-600">HP: {card.hp}</p>
                <p className="text-sm text-gray-600">Rarity: {card.rarity}</p>
                <p className="text-xs text-gray-500">From: {card.fromPack}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No cards available</p>
        )}
      </div>
    </div>
  );
}
