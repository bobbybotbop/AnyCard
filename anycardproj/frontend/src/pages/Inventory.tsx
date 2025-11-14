import Card from "../components/Card";
import { cardSets } from "../data/cards";

const Inventory = () => {
  return cardSets.map((set) => (
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
  ));
};

export default Inventory;
