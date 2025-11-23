/*
 * SETUP NEEDED TO USE THIS COMPONENT:
 *
 * import { useState } from "react";
 * import PackModel from "../components/packModel";
 * import CanvasVisualization from "../components/CanvasVisualization";
 *
 * const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
 * const [canvasWidth, setCanvasWidth] = useState<number | null>(null);
 * const [canvasHeight, setCanvasHeight] = useState<number | null>(null);
 *
 * const handleCanvasReady = (
 *   dataUrl: string,
 *   width: number,
 *   height: number
 * ) => {
 *   setCanvasDataUrl(dataUrl);
 *   setCanvasWidth(width);
 *   setCanvasHeight(height);
 * };
 *
 * // Pass handleCanvasReady to PackModel:
 * <PackModel
 *   overlayImageUrl="..."
 *   onCanvasReady={handleCanvasReady}
 * />
 *
 * // Then render CanvasVisualization conditionally:
 * {canvasDataUrl && canvasWidth && canvasHeight && (
 *   <CanvasVisualization
 *     canvasDataUrl={canvasDataUrl}
 *     canvasWidth={canvasWidth}
 *     canvasHeight={canvasHeight}
 *   />
 * )}
 */

interface CanvasVisualizationProps {
  canvasDataUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  className?: string;
}

export default function CanvasVisualization({
  canvasDataUrl,
  canvasWidth,
  canvasHeight,
  className = "",
}: CanvasVisualizationProps) {
  return (
    <div className={`mt-8 flex flex-col items-center ${className}`}>
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
  );
}
