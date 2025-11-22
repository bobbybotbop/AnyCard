import { useState } from "react";
import DailyPacks from "../components/DailyPacks";
import PackModel from "../components/packModel";

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
            overlayImageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Litoria_infrafrenata_-_Julatten.jpg/960px-Litoria_infrafrenata_-_Julatten.jpg"
            overlayX={0}
            overlayY={0}
            overlayWidth={1}
            overlayHeight={1}
            onCanvasReady={handleCanvasReady}
          ></PackModel>
        </div>

        {/* Display canvas visualization below PackModel */}
        {canvasDataUrl && canvasWidth && canvasHeight && (
          <div className="mt-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Canvas Visualization
            </h2>
            <div className="flex flex-col items-center">
              {/* Box with exact canvas dimensions */}
              <div
                className="border-4 border-red-500 bg-transparent relative max-w-full max-h-[80vh]"
                style={
                  {
                    width: `${canvasWidth}px`,
                    height: `${canvasHeight}px`,
                    "--canvas-width": `${canvasWidth}px`,
                    "--canvas-height": `${canvasHeight}px`,
                  } as React.CSSProperties & {
                    "--canvas-width": string;
                    "--canvas-height": string;
                  }
                }
              >
                <img
                  src={canvasDataUrl}
                  alt="Composited canvas texture"
                  className="w-full h-full object-contain max-w-full max-h-[80vh]"
                  style={
                    {
                      width: `${canvasWidth}px`,
                      height: `${canvasHeight}px`,
                    } as React.CSSProperties
                  }
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Canvas Size: {canvasWidth} × {canvasHeight} pixels
              </p>
            </div>
          </div>
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
