import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { getUserData } from "../api/api";
import Card from "../components/Card";
import { Card as CardType } from "@full-stack/types";
// import WikipediaTestButton from "../components/WikipediaTestButton";

const rarityRank: Record<string, number> = {
  common: 1,
  uncom: 2,
  rare: 3,
  epic: 4,
  legend: 5,
  mythic: 6,
};

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    profilePicture:
      "https://pm1.aminoapps.com/7258/5520799cf0539b408bd8abee0a14d3a492ee5107r1-753-753v2_hq.jpg",
    level: 0,
  });
  const [cardsCollected, setCardsCollected] = useState({
    total: 0,
    common: 0,
    uncom: 0,
    rare: 0,
    epic: 0,
    legend: 0,
    mythic: 0,
  });
  const [inventoryPreview, setInventoryPreview] = useState<CardType[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.uid) {
        setLoading(false);
        console.log("user has not logged in");
        return;
      }
      try {
        const userData = await getUserData(user.uid);
        const { username, level, cards } = userData;

        // Update profile data
        setProfileData({
          name: username || user.displayName || "Anonymous",
          profilePicture:
            "https://pm1.aminoapps.com/7258/5520799cf0539b408bd8abee0a14d3a492ee5107r1-753-753v2_hq.jpg",
          level: level || 0,
        });

        // Calculate cards collected by rarity
        const stats = {
          total: cards?.length || 0,
          common: 0,
          uncom: 0,
          rare: 0,
          epic: 0,
          legend: 0,
          mythic: 0,
        };

        cards?.forEach((card: any) => {
          const rarity = card.rarity?.toLowerCase();
          if (stats.hasOwnProperty(rarity)) {
            stats[rarity as keyof typeof stats]++;
          }
        });

        setCardsCollected(stats);

        // Get the 4 rarest cards from inventory
        const rarestCards = cards
          ? [...cards]
              .sort((a, b) => {
                const aRank = rarityRank[a.rarity?.toLowerCase()] ?? 0;
                const bRank = rarityRank[b.rarity?.toLowerCase()] ?? 0;
                if (aRank === bRank) {
                  return a.name.localeCompare(b.name);
                }
                return bRank - aRank; // Sort highest rarity first
              })
              .slice(0, 4)
          : [];
        setInventoryPreview(rarestCards);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  const rarityColors: Record<string, string> = {
    common: "bg-gray-200 text-gray-700",
    uncom: "bg-green-200 text-green-800",
    rare: "bg-blue-200 text-blue-800",
    epic: "bg-purple-200 text-purple-800",
    legend: "bg-orange-200 text-orange-800",
    mythic: "bg-red-200 text-red-800",
  };

  const rarityLabels: Record<string, string> = {
    common: "Common",
    uncom: "Uncommon",
    rare: "Rare",
    epic: "Epic",
    legend: "Legendary",
    mythic: "Mythic",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-white p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-white p-6">
      <div className=" mt-[9vh] w-[90%] mx-auto">
        {/* <WikipediaTestButton /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Profile
            </h2>
            <div className="flex flex-col items-center">
              <img
                src={profileData.profilePicture}
                alt={profileData.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-200"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {profileData.name}
              </h3>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">Level</span>
                <span className="text-lg font-bold">{profileData.level}</span>
              </div>
            </div>
          </div>

          {/* Cards Collected Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Cards Collected
            </h2>
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {cardsCollected.total}
              </div>
              <div className="text-sm text-gray-500">Total Cards</div>
            </div>
            <div className="space-y-3">
              {Object.entries(cardsCollected)
                .filter(([key]) => key !== "total")
                .map(([rarity, count]) => (
                  <div
                    key={rarity}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${rarityColors[rarity]}`}
                      >
                        {rarity}
                      </span>
                      <span className="text-sm text-gray-600">
                        {rarityLabels[rarity]}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Inventory Preview Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Rarest Cards
              </h2>
              <Link
                to="/inventory"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {inventoryPreview.length > 0 ? (
                inventoryPreview.slice(0, 4).map((card, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center h-[200px] w-full overflow-hidden"
                  >
                    <div className="scale-[0.5] origin-center">
                      <Card card={card} enableTilt={true} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  No cards in inventory yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
