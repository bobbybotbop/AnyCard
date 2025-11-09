import Card from "@/components/Card";
import { cardSets } from "@/data/cards";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AnyCard Trading Card Game
        </h1>

        {cardSets.map((set) => (
          <div key={set.name} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 capitalize">
              {set.theme} Set
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {set.cards.map((card, index) => (
                <Card key={`${set.name}-${index}`} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
