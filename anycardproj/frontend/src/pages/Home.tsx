import DailyPacks from "../components/DailyPacks";
import PackModel from "../components/packModel";

const HomePage = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AnyCard Trading Card Game
        </h1>
        <div className="h-100">
          <DailyPacks />
        </div>

        <div className="h-150">
          <PackModel
            overlayImageUrl="https://bogleech.com/pokemon/allpokes/102Exeggcute.png"
            overlayX={0}
            overlayY={0}
            overlayWidth={1}
            overlayHeight={1}
          ></PackModel>
        </div>
        {/* Sets Section */}
        {/* <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Card Sets
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {cardSets.map((set) => (
              <Set key={set.name} set={set} />
            ))}
          </div>
        </div> */}
      </div>
    </main>
  );
};

export default HomePage;
