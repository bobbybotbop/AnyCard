import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Rarity } from "../data/cards";
import CreateCardTestButton from "../components/CreateCardTestButton";
import { useAuth } from "../auth/authProvider";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    profilePicture:
      "https://pm1.aminoapps.com/7258/5520799cf0539b408bd8abee0a14d3a492ee5107r1-753-753v2_hq.jpg",
    level: 0,
  });

  // const useEffect(()=>{
  //   user
  // },[user])

  const cardsCollected = {
    total: 127,
    common: 45,
    uncom: 32,
    rare: 28,
    epic: 15,
    legend: 5,
    mythic: 2,
  };

  const inventoryPreview = [
    {
      name: "Pikachu",
      rarity: "rare" as Rarity,
      picture: "/pokemon/pikachu.jpg",
    },
    {
      name: "Charizard",
      rarity: "legend" as Rarity,
      picture: "/pokemon/charizard.jpg",
    },
    {
      name: "Mewtwo",
      rarity: "mythic" as Rarity,
      picture: "/pokemon/mewtwo.jpg",
    },
    {
      name: "Bulbasaur",
      rarity: "common" as Rarity,
      picture: "/pokemon/bulbasaur.jpg",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <CreateCardTestButton />
        </div>

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
                Favorite Cards
              </h2>
              <Link
                to="/inventory"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {inventoryPreview.map((card, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="aspect-square bg-gradient-to-b from-blue-200 to-blue-300 rounded mb-2 overflow-hidden">
                    <img
                      src={card.picture}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-800 truncate mb-1">
                    {card.name}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[0.5rem] font-bold uppercase ${rarityColors[card.rarity]}`}
                  >
                    {card.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
