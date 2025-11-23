import DailyPacks from "../components/DailyPacks";
import PackModel from "../components/packModel";

const HomePage = () => {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white relative overflow-hidden">
      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col pt-[8vh] text-center pointer-events-none z-0">
        <div className="text-[20vw] font-bold leading-none select-none background-text-gradient">
          <div>Weekly</div>
          <div className="text-right mt-[10vh] pr-[10vw]">Sets</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 relative z-10">
        <div className="mt-[15vh] h-100">
          <DailyPacks />
        </div>

        <div className="h-150">
          <PackModel
            overlayImageUrl="https://bogleech.com/pokemon/allpokes/102Exeggcute.png"
            rotation={[0, 0, 90]}
            autoRotate={true}
            rotationAxis="x"
            setTitle="The Coolest Eggs"
            // onCanvasReady={handleCanvasReady}
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
