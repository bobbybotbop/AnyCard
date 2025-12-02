import AllUsersDisplay from "../components/AllUsersDisplay";
import { cardSets } from "../data/cards";

const Trading = () => {
  const mockUid = "04cd2c33-e3db-4787-9cee-4ed653546284";
  // Get some sample cards from the first set for testing
  const sampleCards = cardSets[0]?.cards.slice(0, 10) || [];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="w-[90%] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Trading
        </h1>
        <div className="flex flex-col items-center">
          <AllUsersDisplay uid={mockUid} />
        </div>
      </div>
    </main>
  );
};

export default Trading;
