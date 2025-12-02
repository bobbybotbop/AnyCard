import { Card } from "@full-stack/types";
import { useNavigate } from "react-router-dom";
import CardComponet from "../components/Card";
import { requestTrade } from "../api/api";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  userUID: string;
  sentUserUID: string;
  wantCard: Card | null;
  giveCard: Card | null;
}

const PopupTrading = ({
  open,
  wantCard,
  giveCard,
  userUID,
  sentUserUID,
  onClose,
}: PopupProps) => {
  const navigate = useNavigate();
  if (!open) return null;

  async function onInitiateTrade(wantToTrade: boolean) {
    if (!wantCard || !giveCard) return null;

    if (wantToTrade) {
      try {
        await requestTrade(wantCard, giveCard, userUID, sentUserUID);
        console.log("successful");
      } catch (error: any) {
        console.log(error);
      }
    }

    onClose();
    navigate(`/trading`);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white w-[90%] max-w-4xl rounded-xl shadow-xl p-6 relative mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Confirm Trade</h2>

        <div className="flex items-center justify-center gap-6 p-4 flex-wrap">
          {/* Want Card */}
          <div className="flex-shrink-0">
            {wantCard ? (
              <CardComponet card={wantCard} />
            ) : (
              <p className="text-center text-gray-400">Pick Card</p>
            )}
          </div>

          {/* Trade Icon */}
          <div className="text-4xl font-bold text-blue-500">⇄</div>

          {/* Give Card */}
          <div className="flex-shrink-0">
            {giveCard ? (
              <CardComponet card={giveCard} />
            ) : (
              // add card component
              <p className="text-center text-gray-400">Pick Card</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between gap-4">
          <button
            onClick={() => onInitiateTrade(true)}
            disabled={!wantCard || !giveCard}
            className={`w-1/2 py-2 rounded-lg font-semibold text-white ${
              wantCard && giveCard
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Initiate Trade
          </button>

          <button
            onClick={() => onInitiateTrade(false)}
            className="w-1/2 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupTrading;
