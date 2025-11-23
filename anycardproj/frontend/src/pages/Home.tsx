import { useState } from "react";
import DailyPacks from "../components/DailyPacks";
import PackModel from "../components/packModel";
import CanvasVisualization from "../components/CanvasVisualization";

const HomePage = () => {
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number | null>(null);
  const [canvasHeight, setCanvasHeight] = useState<number | null>(null);

  const handleCanvasReady = (
    dataUrl: string,
    width: number,
    height: number
  ) => {
    setCanvasDataUrl(dataUrl);
    setCanvasWidth(width);
    setCanvasHeight(height);
  };

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
            rotation={[0, 0, 90]}
            autoRotate={true}
            rotationAxis="x"
            setTitle="cool eggys"
            onCanvasReady={handleCanvasReady}
          ></PackModel>
        </div>

        {canvasDataUrl && canvasWidth && canvasHeight && (
          <CanvasVisualization
            canvasDataUrl={canvasDataUrl}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        )}
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
