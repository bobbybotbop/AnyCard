import { otherUser } from "@full-stack/types";
import { respondTrade } from "../api/cards";
import Card from "../components/Card";

interface InputProps {
  mail: otherUser;
  userUid: string;
  onTradeUpdate: () => void; // Add callback prop
}

export default function RequestTradeMail({
  mail,
  userUid,
  onTradeUpdate,
}: InputProps) {
  async function handleDecline(): Promise<void> {
    try {
      await respondTrade("rejected", userUid, mail.tradeId);
      onTradeUpdate(); // Trigger parent to refresh
    } catch (error) {
      console.error("Failed to decline trade:", error);
    }
  }

  async function handleAccept(): Promise<void> {
    try {
      await respondTrade("accepted", userUid, mail.tradeId);
      onTradeUpdate(); // Trigger parent to refresh
    } catch (error) {
      console.error("Failed to accept trade:", error);
    }
  }

  return (
    <div className="relative p-2 border rounded pb-16">
      {mail.type === "request" ? (
        <>
          <p className="font-semibold">Requests</p>
        </>
      ) : (
        <>
          <p className="font-semibold">Sent Request</p>
        </>
      )}
      <p className="text-sm">Other user UID: {mail.otherUserUID}</p>
      <p className="text-sm">Wanted:</p>
      <Card card={mail.wantedCard} />
      <p className="text-sm">Given:</p>
      <Card card={mail.givenCard} />
      <p className="text-sm">Status: {mail.status}</p>
      <p className="text-xs text-gray-500">
        {new Date(mail.date).toLocaleString()}
      </p>
      {mail.type === "request" && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
