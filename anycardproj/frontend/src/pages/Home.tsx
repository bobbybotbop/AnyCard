import { useState, useRef } from "react";
import DailyPacks from "../components/DailyPacks";
import PreviousSetsSection from "../components/PreviousSetsSection";
import CustomSetCreationSection from "../components/CustomSetCreationSection";
import PreviousCustomSetsSection from "../components/PreviousCustomSetsSection";
// import Carousel from "../components/Carousel";

const HomePage = () => {
  // Track which component has an active selection
  const [activeComponent, setActiveComponent] = useState<
    "dailyPacks" | "packGrid" | "customPackGrid" | null
  >(null);
  const dailyPacksResetRef = useRef<(() => void) | null>(null);
  const packGridResetRef = useRef<(() => void) | null>(null);
  const customPackGridResetRef = useRef<(() => void) | null>(null);

  // Custom set creation state
  const [themeInput, setThemeInput] = useState("");
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [createSetError, setCreateSetError] = useState<string | null>(null);
  const [createSetSuccess, setCreateSetSuccess] = useState<string | null>(null);
  const [customSetsRefreshKey, setCustomSetsRefreshKey] = useState(0);

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

  const handleCustomPackGridSelectionStart = () => {
    // If other components are active, reset them first
    if (activeComponent === "dailyPacks" && dailyPacksResetRef.current) {
      dailyPacksResetRef.current();
    }
    if (activeComponent === "packGrid" && packGridResetRef.current) {
      packGridResetRef.current();
    }
    setActiveComponent("customPackGrid");
  };

  const handleCustomPackGridSelectionEnd = () => {
    if (activeComponent === "customPackGrid") {
      setActiveComponent(null);
    }
  };

  const handleCustomSetCreated = () => {
    // Refresh the custom sets grid by updating the key
    setCustomSetsRefreshKey((prev) => prev + 1);
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

        {/* Custom Set Creation Section */}
        <CustomSetCreationSection
          themeInput={themeInput}
          setThemeInput={setThemeInput}
          isCreatingSet={isCreatingSet}
          setIsCreatingSet={setIsCreatingSet}
          createSetError={createSetError}
          setCreateSetError={setCreateSetError}
          createSetSuccess={createSetSuccess}
          setCreateSetSuccess={setCreateSetSuccess}
          onSetCreated={handleCustomSetCreated}
        />

        {/* Custom Sets History Section */}
        <PreviousCustomSetsSection
          isLocked={
            activeComponent === "dailyPacks" || activeComponent === "packGrid"
          }
          onSelectionStart={handleCustomPackGridSelectionStart}
          onSelectionEnd={handleCustomPackGridSelectionEnd}
          resetRef={customPackGridResetRef}
          refreshKey={customSetsRefreshKey}
        />

        {/* Previous Sets Section */}
        <PreviousSetsSection
          isLocked={
            activeComponent === "dailyPacks" ||
            activeComponent === "customPackGrid"
          }
          onSelectionStart={handlePackGridSelectionStart}
          onSelectionEnd={handlePackGridSelectionEnd}
          resetRef={packGridResetRef}
        />

        {/* Infinite scrolling PackModels */}
        {/* <Carousel /> */}
      </div>
    </main>
  );
};

export default HomePage;
