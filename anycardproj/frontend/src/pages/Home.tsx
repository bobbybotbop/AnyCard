import Set from "../components/Set";
import { cardSets } from "../data/cards";

const HomePage = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AnyCard Trading Card Game
        </h1>

        {/* Sets Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Card Sets
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {cardSets.map((set) => (
              <Set key={set.name} set={set} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
