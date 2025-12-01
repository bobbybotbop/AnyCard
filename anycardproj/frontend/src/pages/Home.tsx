import { useState, useRef } from "react";
import DailyPacks from "../components/DailyPacks";
import PackGrid from "../components/PackGrid";
import CustomPackGrid from "../components/CustomPackGrid";
import { createCustomSet } from "../api/cards";
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

  const handleCreateCustomSet = async () => {
    const trimmedInput = themeInput.trim();
    if (!trimmedInput) {
      setCreateSetError("Please enter a theme idea");
      return;
    }
    if (trimmedInput.length > 200) {
      setCreateSetError("Theme input is too long (max 200 characters)");
      return;
    }

    setIsCreatingSet(true);
    setCreateSetError(null);
    setCreateSetSuccess(null);

    try {
      const createdSet = await createCustomSet(trimmedInput);
      setCreateSetSuccess(`Successfully created set "${createdSet.name}"!`);
      setThemeInput("");
      // Refresh the custom sets grid by updating the key
      setCustomSetsRefreshKey((prev) => prev + 1);
      setTimeout(() => {
        setCreateSetSuccess(null);
      }, 5000);
    } catch (error: any) {
      setCreateSetError(error.message || "Failed to create custom set");
    } finally {
      setIsCreatingSet(false);
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
              isLocked={
                activeComponent === "dailyPacks" ||
                activeComponent === "customPackGrid"
              }
              onSelectionStart={handlePackGridSelectionStart}
              onSelectionEnd={handlePackGridSelectionEnd}
              resetRef={packGridResetRef}
            />
          </div>
        </div>

        {/* Custom Set Creation Section */}
        <div className="w-full mt-[10vh]">
          <div className="text-[17vw] font-bold leading-none select-none background-text-gradient z-[-10] absolute w-full">
            <div>Your</div>
            <div className="text-right mt-[35vh] pr-[10vw]">Theme</div>
          </div>
          <div className="pt-[7%] relative z-10">
            <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
              <input
                type="text"
                value={themeInput}
                onChange={(e) => {
                  setThemeInput(e.target.value);
                  setCreateSetError(null);
                  setCreateSetSuccess(null);
                }}
                placeholder="Enter a card theme idea (e.g., 'space', 'animals', 'famous scientists')"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white/90 backdrop-blur-sm"
                disabled={isCreatingSet}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCreatingSet) {
                    handleCreateCustomSet();
                  }
                }}
              />
              <button
                onClick={handleCreateCustomSet}
                disabled={isCreatingSet || !themeInput.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingSet ? "Creating Set..." : "Create Custom Set"}
              </button>
              {createSetError && (
                <div className="text-red-600 text-sm mt-2">
                  {createSetError}
                </div>
              )}
              {createSetSuccess && (
                <div className="text-green-600 text-sm mt-2">
                  {createSetSuccess}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Sets History Section */}
        <div className="w-full mt-[10vh]">
          <div className="text-[17vw] font-bold leading-none select-none background-text-gradient z-[-10] absolute w-full">
            <div>Custom</div>
            <div className="text-right mt-[35vh] pr-[10vw]">Sets</div>
          </div>
          <div className="pt-[7%]">
            <CustomPackGrid
              key={customSetsRefreshKey}
              isLocked={
                activeComponent === "dailyPacks" ||
                activeComponent === "packGrid"
              }
              onSelectionStart={handleCustomPackGridSelectionStart}
              onSelectionEnd={handleCustomPackGridSelectionEnd}
              resetRef={customPackGridResetRef}
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
