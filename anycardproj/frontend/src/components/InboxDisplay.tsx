import { useState, useEffect } from "react";
import { getAllTrades } from "../api/api";
import { otherUser, Card } from "@full-stack/types";
import RequestTradeMail from "../components/RequestTradeMail";
import TradeToast from "../components/TradeToast";

interface InputProps {
  uid: string;
}

export default function InboxDisplay({ uid }: InputProps) {
  const [trades, setTrades] = useState<otherUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removedTradeIds, setRemovedTradeIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{
    givenCard: Card;
    receivedCard: Card;
  } | null>(null);
  
  const fetchTrades = async (showLoading: boolean = true) => {
    console.log(`[InboxDisplay] fetchTrades called - showLoading: ${showLoading}`);
    try {
      if (showLoading) {
        console.log(`[InboxDisplay] Setting loading to true`);
        setLoading(true);
      }
      setError(null);
      console.log(`[InboxDisplay] Calling getAllTrades API - uid: ${uid}`);
      const trades = await getAllTrades(uid);
      console.log(`[InboxDisplay] getAllTrades completed - received ${trades.length} trades`);
      setTrades(trades);
      // Clear removed trade IDs after refresh since backend has updated
      console.log(`[InboxDisplay] Clearing removedTradeIds`);
      setRemovedTradeIds(new Set());
      console.log(`[InboxDisplay] fetchTrades completed successfully`);
    } catch (err) {
      console.error(`[InboxDisplay] Error fetching user data:`, err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user data"
      );
    } finally {
      if (showLoading) {
        console.log(`[InboxDisplay] Setting loading to false`);
        setLoading(false);
      }
    }
  };

  // Separate function for refreshing without showing loading state
  const refreshTrades = async () => {
    console.log(`[InboxDisplay] refreshTrades called`);
    await fetchTrades(false);
    console.log(`[InboxDisplay] refreshTrades completed`);
  };

  // Function to mark a trade as removed (optimistic update)
  const handleTradeRemoved = (tradeId: string) => {
    console.log(`[InboxDisplay] handleTradeRemoved called - tradeId: ${tradeId}`);
    console.log(`[InboxDisplay] Current removedTradeIds before:`, Array.from(removedTradeIds));
    setRemovedTradeIds((prev) => {
      const newSet = new Set(prev).add(tradeId);
      console.log(`[InboxDisplay] New removedTradeIds:`, Array.from(newSet));
      return newSet;
    });
    console.log(`[InboxDisplay] handleTradeRemoved completed - tradeId: ${tradeId}`);
  };

  // Function to show toast notification when trade is accepted
  const handleTradeAccepted = (givenCard: Card, receivedCard: Card) => {
    console.log(`[InboxDisplay] handleTradeAccepted called - givenCard: ${givenCard.name}, receivedCard: ${receivedCard.name}`);
    setToast({ givenCard, receivedCard });
    console.log(`[InboxDisplay] Toast state set`);
  };

  useEffect(() => {
    if (uid) {
      fetchTrades();
    }
  }, [uid]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!trades) {
    return <div className="p-4">No user data found</div>;
  }

  console.log(`[InboxDisplay] Render - trades: ${trades?.length || 0}, removedTradeIds: ${removedTradeIds.size}, loading: ${loading}, toast: ${toast ? 'set' : 'null'}`);
  const filteredTrades = trades?.filter((trade) => !removedTradeIds.has(trade.tradeId)) || [];
  console.log(`[InboxDisplay] Filtered trades count: ${filteredTrades.length}`);

  return (
    <>
      {toast && (
        <TradeToast
          givenCard={toast.givenCard}
          receivedCard={toast.receivedCard}
          onClose={() => {
            console.log(`[InboxDisplay] Toast onClose called`);
            setToast(null);
          }}
        />
      )}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">User Inbox</h2>
        <p>{trades.length}</p>
        <div className="space-y-4">
          {filteredTrades.map((trade) => {
            console.log(`[InboxDisplay] Rendering RequestTradeMail - tradeId: ${trade.tradeId}`);
            return (
              <RequestTradeMail
                key={trade.tradeId}
                mail={trade}
                userUid={uid}
                onTradeUpdate={refreshTrades}
                onTradeRemoved={handleTradeRemoved}
                onTradeAccepted={handleTradeAccepted}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
