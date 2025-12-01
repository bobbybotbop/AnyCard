import React from "react";
import LiquidGlass from "liquid-glass-react";
import { Loader2, Send } from "lucide-react";

interface CustomSetInputProps {
  themeInput: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isCreatingSet: boolean;
  error: string | null;
  success: string | null;
}

const CustomSetInput = ({
  themeInput,
  onInputChange,
  onSubmit,
  isCreatingSet,
  error,
  success,
}: CustomSetInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isCreatingSet && themeInput.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
      <LiquidGlass
        cornerRadius={16}
        blurAmount={0.1}
        displacementScale={64}
        saturation={130}
        aberrationIntensity={2}
        elasticity={0.35}
        padding="0"
        className="w-full"
      >
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={themeInput}
            onChange={(e) => {
              onInputChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter a card theme idea (e.g., 'space', 'animals', 'famous scientists')"
            disabled={isCreatingSet}
            className="flex-1 px-4 py-3 text-lg bg-transparent border-none outline-none placeholder:text-gray-400 text-white disabled:opacity-50"
          />
          <button
            onClick={onSubmit}
            disabled={isCreatingSet || !themeInput.trim()}
            className="px-4 py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ minWidth: "48px" }}
          >
            {isCreatingSet ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </LiquidGlass>
      {error && (
        <div className="text-red-600 text-sm mt-2 w-full text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 text-sm mt-2 w-full text-center">
          {success}
        </div>
      )}
    </div>
  );
};

export default CustomSetInput;

