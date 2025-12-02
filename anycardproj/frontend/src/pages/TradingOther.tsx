import { useEffect, useState } from "react";
import { userData, Card } from "@full-stack/types";
import { getUserData } from "../api/api";
import { useParams } from "react-router-dom";
import CardComponent from "../components/Card";
import PopupTrading from "../components/PopupTrading";

type State = "Want" | "Give";

const TradingOther = () => {
  const { userUID, otherUID } = useParams();
  const [currentUser, setCurrentUser] = useState<userData | null>(null);
  const [otherUser, setOtherUser] = useState<userData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userWantCard, setUserWantCard] = useState<Card | null>(null);
  const [userGivenCard, setUserGivenCard] = useState<Card | null>(null);
  const [currentSelection, setCurrentSelection] = useState<State>("Want");
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!otherUID) {
        setError("Other User Data does not exist");
        setLoading(false);
        return;
      }

      if (!userUID) {
        setError("Current User Data does not exist");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const otherUserData = await getUserData(otherUID);
        setOtherUser(otherUserData);

        const currentUserData = await getUserData(userUID);
        setCurrentUser(currentUserData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch other user data"
        );
        console.error("Error fetching other user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userUID, otherUID]);

  const handleCardClick = (card: Card) => {
    if (currentSelection == "Want") {
      setCurrentSelection("Give");
      setUserWantCard(card);
      console.log("User wanted card:", card);
    } else {
      setUserGivenCard(card);
      setPopupOpen(true);
      console.log("User given card:", card);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center overflow-x-hidden">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center overflow-x-hidden">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center overflow-x-hidden">
        <div className="text-xl">Other user not found</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white flex items-center justify-center overflow-x-hidden">
        <div className="text-xl">Current user not found</div>
      </div>
    );
  }

  const user = currentSelection == "Want" ? otherUser : currentUser;
  return (
    <div className="min-h-screen p-8 pt-24 bg-gradient-to-b from-blue-400 to-white overflow-x-hidden">
      <div className="w-[90%] max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 break-words">
            {user.username}'s Cards
          </h1>
          <p className="text-gray-600 break-words">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Level {user.level} • {user.cards?.length || 0} cards
          </p>
        </div>

        {user.cards && user.cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {user.cards.map((card, index) => (
              <div key={index} className="w-full flex justify-center">
                <CardComponent
                  card={card}
                  enableTilt={true}
                  onClick={() => handleCardClick(card)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-xl">This user has no cards yet</p>
          </div>
        )}
      </div>
      <PopupTrading
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        wantCard={userWantCard}
        giveCard={userGivenCard}
        userUID={currentUser.UID}
        sentUserUID={otherUser.UID}
      />
    </div>
  );
};

export default TradingOther;
