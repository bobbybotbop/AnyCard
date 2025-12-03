import { useState, useEffect } from "react";
import { getAllTrades } from "../api/api";
import { otherUser } from "@full-stack/types";
import RequestTradeMail from "../components/RequestTradeMail";

interface InputProps {
  uid: string;
}

export default function InboxDisplay({ uid }: InputProps) {
  const [trades, setTrades] = useState<otherUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const trades = await getAllTrades(uid);
      setTrades(trades);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user data"
      );
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Inbox</h2>
      <p>{trades.length}</p>
      <div className="space-y-4">
        {trades.map((trade) => (
          <RequestTradeMail
            key={trade.tradeId}
            mail={trade}
            userUid={uid}
            onTradeUpdate={fetchTrades}
          />
        ))}
      </div>
    </div>
  );
}
