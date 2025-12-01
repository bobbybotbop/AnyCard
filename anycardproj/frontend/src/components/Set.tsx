import { useState } from "react";
import { Set as SetType } from "../data/cards";
import { proxyImageUrl } from "../../lib/utils";

interface SetProps {
  set: SetType;
}

export default function Set({ set }: SetProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-[220px] h-[320px] border-4 border-gray-400 bg-white rounded-lg overflow-hidden shadow-xl flex flex-col hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
      {/* Top Banner Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 h-8 border-b-2 border-blue-800 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-wider">
          Trading Card Set
        </span>
      </div>

      {/* Cover Image Section */}
      <div className="relative flex-1 w-full min-h-0 bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 text-gray-500 text-sm p-4">
            <span className="text-center">{set.name}</span>
          </div>
        ) : (
          <img
            src={proxyImageUrl(set.coverImage)}
            alt={set.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Set Name Banner */}
      <div className="bg-gradient-to-b from-blue-700 to-blue-800 px-4 py-3 border-t-2 border-blue-900 shadow-inner">
        <h2 className="text-base font-bold text-white text-center uppercase tracking-wide drop-shadow-lg">
          {set.name}
        </h2>
      </div>
    </div>
  );
}
