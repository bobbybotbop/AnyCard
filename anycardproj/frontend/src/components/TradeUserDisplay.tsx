import { useState } from "react";
import { userData, Card } from "@full-stack/types";
import { useNavigate } from "react-router-dom";
import CardComponent from "../components/Card";

interface TradeUserDisplayProps {
  currentUser: userData;
  otherUser: userData;
}

export default function TradeUserDisplay({
  currentUser,
  otherUser,
}: TradeUserDisplayProps) {
  const [selectedUser, setSelectedUser] = useState<userData | null>(null);
  const navigate = useNavigate();

  const handleCardClick = (user: userData) => {
    setSelectedUser(user);
    console.log("Selected user:", user);
    const otherUID = user.UID;
    const userUID = currentUser.UID;
    navigate(`/trading/${userUID}/${otherUID}`);
  };

  // Get first 3 cards
  const displayedCards = (otherUser.cards || []).slice(0, 3);

  return (
    <div className="p-4">
      <div
        onClick={() => handleCardClick(otherUser)}
        className="cursor-pointer p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow mb-6"
      >
        <h3 className="text-lg font-semibold break-words">
          {otherUser.username}
        </h3>
        <p className="text-sm text-gray-600 break-words">{otherUser.email}</p>

        {displayedCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCards.map((card, index) => (
              <CardComponent key={`${card.name}-${index}`} card={card} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No cards available</p>
        )}
      </div>
    </div>
  );
}
