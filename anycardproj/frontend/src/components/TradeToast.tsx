import { useEffect, useState } from "react";
import { Card as CardType } from "@full-stack/types";
import Card from "./Card";

interface TradeToastProps {
  givenCard: CardType;
  receivedCard: CardType;
  onClose: () => void;
}

export default function TradeToast({
  givenCard,
  receivedCard,
  onClose,
}: TradeToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 2.5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade-out animation before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 w-[95%] sm:w-auto ${
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 min-w-[300px] sm:min-w-[500px] max-w-[700px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trade Completed!
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close notification"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Card you're giving */}
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              You gave
            </p>
            <div className="scale-[0.6] sm:scale-75 origin-center">
              <Card card={givenCard} />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 rotate-90 sm:rotate-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600 dark:text-gray-400"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          {/* Card you're receiving */}
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              You received
            </p>
            <div className="scale-[0.6] sm:scale-75 origin-center">
              <Card card={receivedCard} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
