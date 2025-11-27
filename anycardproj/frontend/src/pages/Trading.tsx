import CardDrawings from "../components/CardDrawings";
import { cardSets } from "../data/cards";

const Trading = () => {
  // Get some sample cards from the first set for testing
  const sampleCards = cardSets[0]?.cards.slice(0, 10) || [];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Trading
        </h1>
        <div className="flex flex-col items-center">
          <CardDrawings cards={sampleCards} />
        </div>
      </div>
    </main>
  );
};

export default Trading;

