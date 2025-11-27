import { useState, useRef } from "react";
import DailyPacks from "../components/DailyPacks";
import PackGrid from "../components/PackGrid";
// import Carousel from "../components/Carousel";

const HomePage = () => {
  // Track which component has an active selection
  const [activeComponent, setActiveComponent] = useState<
    "dailyPacks" | "packGrid" | null
  >(null);
  const dailyPacksResetRef = useRef<(() => void) | null>(null);
  const packGridResetRef = useRef<(() => void) | null>(null);

  const handleDailyPacksSelectionStart = () => {
    // If packGrid is active, reset it first
    if (activeComponent === "packGrid" && packGridResetRef.current) {
      packGridResetRef.current();
    }
    setActiveComponent("dailyPacks");
  };

  const handleDailyPacksSelectionEnd = () => {
    if (activeComponent === "dailyPacks") {
      setActiveComponent(null);
    }
  };

  const handlePackGridSelectionStart = () => {
    // If dailyPacks is active, reset it first
    if (activeComponent === "dailyPacks" && dailyPacksResetRef.current) {
      dailyPacksResetRef.current();
    }
    setActiveComponent("packGrid");
  };

  const handlePackGridSelectionEnd = () => {
    if (activeComponent === "packGrid") {
      setActiveComponent(null);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white relative overflow-hidden">
      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col pt-[8vh] text-center pointer-events-none z-0">
        <div className="text-[20vw] font-bold leading-none select-none background-text-gradient">
          <div>Weekly</div>
          <div className="text-right mt-[10vh] pr-[10vw]">Sets</div>
        </div>
      </div>

      <div className="w-[90%] mx-auto mt-10 relative z-10">
        <div className="h-[100vh] w-full">
          <DailyPacks
            isLocked={activeComponent === "packGrid"}
            onSelectionStart={handleDailyPacksSelectionStart}
            onSelectionEnd={handleDailyPacksSelectionEnd}
            resetRef={dailyPacksResetRef}
          />
        </div>

        {/* Previous Sets Section */}
        <div className=" w-full">
          <div className="text-[17vw] font-bold leading-none select-none background-text-gradient z-[-10] absolute w-full">
            <div>Previous</div>
            <div className="text-right mt-[35vh] pr-[10vw] ">Sets</div>
          </div>
          <div className="pt-[7%]">
            <PackGrid
              isLocked={activeComponent === "dailyPacks"}
              onSelectionStart={handlePackGridSelectionStart}
              onSelectionEnd={handlePackGridSelectionEnd}
              resetRef={packGridResetRef}
            />
          </div>
        </div>

        {/* Infinite scrolling PackModels */}
        {/* <Carousel /> */}
      </div>
    </main>
  );
};

export default HomePage;
