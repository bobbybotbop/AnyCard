import DailyPacks from "../components/DailyPacks";
import PackGrid from "../components/PackGrid";
// import Carousel from "../components/Carousel";

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
        <div className="h-[100vh] w-full">
          <DailyPacks />
        </div>

        {/* Previous Sets Section */}
        <div className="mt-16 mb-8 w-full">
          <h2 className="text-3xl font-semibold mb-6 text-gray-700">
            Previous Sets
          </h2>
          <PackGrid />
        </div>

        {/* Infinite scrolling PackModels */}
        {/* <Carousel /> */}
      </div>
    </main>
  );
};

export default HomePage;
