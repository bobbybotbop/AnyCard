
import { useState } from "react";
import { respondTrade } from "../api/api";
import { otherUser, Card } from "@full-stack/types";
import CardComponent from "../components/Card";

interface InputProps {
  mail: otherUser;
  userUid: string;
  onTradeUpdate: () => Promise<void>; // Add callback prop
  onTradeRemoved: (tradeId: string) => void; // Callback to notify parent of removal
  onTradeAccepted: (givenCard: Card, receivedCard: Card) => void; // Callback to show toast
}

export default function RequestTradeMail({
  mail,
  userUid,
  onTradeUpdate,
  onTradeRemoved,
  onTradeAccepted,
}: InputProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  console.log(`[RequestTradeMail] Render - tradeId: ${mail.tradeId}, isProcessing: ${isProcessing}, type: ${mail.type}`);

  async function handleDecline(): Promise<void> {
    console.log(`[RequestTradeMail] handleDecline called - tradeId: ${mail.tradeId}, current isProcessing: ${isProcessing}`);
    if (isProcessing) {
      console.log(`[RequestTradeMail] handleDecline blocked - already processing`);
      return;
    }
    try {
      console.log(`[RequestTradeMail] Setting isProcessing to true - tradeId: ${mail.tradeId}`);
      setIsProcessing(true);
      console.log(`[RequestTradeMail] Calling respondTrade API - tradeId: ${mail.tradeId}`);
      await respondTrade("rejected", userUid, mail.tradeId);
      console.log(`[RequestTradeMail] respondTrade API completed - tradeId: ${mail.tradeId}`);
      // Reset processing state before removing component
      console.log(`[RequestTradeMail] Setting isProcessing to false - tradeId: ${mail.tradeId}`);
      setIsProcessing(false);
      // Notify parent to remove this trade immediately
      console.log(`[RequestTradeMail] Calling onTradeRemoved - tradeId: ${mail.tradeId}`);
      onTradeRemoved(mail.tradeId);
      console.log(`[RequestTradeMail] onTradeRemoved called - tradeId: ${mail.tradeId}`);
      // Refresh the trade list to ensure UI is in sync with backend
      // Don't await - let it happen in background since component is being removed
      console.log(`[RequestTradeMail] Calling onTradeUpdate - tradeId: ${mail.tradeId}`);
      onTradeUpdate().catch((err) => {
        console.error(`[RequestTradeMail] Error refreshing trades - tradeId: ${mail.tradeId}:`, err);
      });
      console.log(`[RequestTradeMail] handleDecline completed - tradeId: ${mail.tradeId}`);
    } catch (error) {
      console.error(`[RequestTradeMail] Failed to decline trade - tradeId: ${mail.tradeId}:`, error);
      console.log(`[RequestTradeMail] Setting isProcessing to false (error case) - tradeId: ${mail.tradeId}`);
      setIsProcessing(false);
    }
  }

  async function handleAccept(): Promise<void> {
    console.log(`[RequestTradeMail] handleAccept called - tradeId: ${mail.tradeId}, current isProcessing: ${isProcessing}`);
    if (isProcessing) {
      console.log(`[RequestTradeMail] handleAccept blocked - already processing`);
      return;
    }
    try {
      console.log(`[RequestTradeMail] Setting isProcessing to true - tradeId: ${mail.tradeId}`);
      setIsProcessing(true);
      console.log(`[RequestTradeMail] Calling respondTrade API - tradeId: ${mail.tradeId}`);
      await respondTrade("accepted", userUid, mail.tradeId);
      console.log(`[RequestTradeMail] respondTrade API completed - tradeId: ${mail.tradeId}`);
      // Show toast notification with trade details
      // For "request" type: user is giving givenCard and receiving wantedCard
      // For "send" type: user is giving givenCard and receiving wantedCard
      console.log(`[RequestTradeMail] Calling onTradeAccepted - tradeId: ${mail.tradeId}`);
      onTradeAccepted(mail.givenCard, mail.wantedCard);
      console.log(`[RequestTradeMail] onTradeAccepted called - tradeId: ${mail.tradeId}`);
      // Reset processing state before removing component
      console.log(`[RequestTradeMail] Setting isProcessing to false - tradeId: ${mail.tradeId}`);
      setIsProcessing(false);
      // Notify parent to remove this trade immediately
      console.log(`[RequestTradeMail] Calling onTradeRemoved - tradeId: ${mail.tradeId}`);
      onTradeRemoved(mail.tradeId);
      console.log(`[RequestTradeMail] onTradeRemoved called - tradeId: ${mail.tradeId}`);
      // Refresh the trade list to ensure UI is in sync with backend
      // Don't await - let it happen in background since component is being removed
      console.log(`[RequestTradeMail] Calling onTradeUpdate - tradeId: ${mail.tradeId}`);
      onTradeUpdate().catch((err) => {
        console.error(`[RequestTradeMail] Error refreshing trades - tradeId: ${mail.tradeId}:`, err);
      });
      console.log(`[RequestTradeMail] handleAccept completed - tradeId: ${mail.tradeId}`);
    } catch (error) {
      console.error(`[RequestTradeMail] Failed to accept trade - tradeId: ${mail.tradeId}:`, error);
      console.log(`[RequestTradeMail] Setting isProcessing to false (error case) - tradeId: ${mail.tradeId}`);
      setIsProcessing(false);
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
      <CardComponent card={mail.wantedCard} />
      <p className="text-sm">Given:</p>
      <CardComponent card={mail.givenCard} />
      <p className="text-sm">Status: {mail.status}</p>
      <p className="text-xs text-gray-500">
        {new Date(mail.date).toLocaleString()}
      </p>
      {mail.type === "request" && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAccept}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Accept"}
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDecline}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Decline"}
          </button>
        </div>
      )}
    </div>
  );
}
