import { useState, useEffect } from "react";
import { getAllTrades } from "../api/cards";
import { requestUser, sentUser } from "@full-stack/types";
import RequestTradeMail from "../components/RequestTradeMail";

interface InputProps {
  uid: string;
}

export default function InboxDisplay({ uid }: InputProps) {
  const [trades, setTrades] = useState<(requestUser | sentUser)[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      <div className="space-y-4">
        {trades.map((t, i) => (
          <RequestTradeMail mail={t} />
        ))}
      </div>
    </div>
  );
}
