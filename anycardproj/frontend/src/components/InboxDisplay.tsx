import { useState, useEffect } from "react";
import { getUserData } from "../api/cards";
import { userData } from "@full-stack/types";

interface InputProps {
  uid: string;
}

export default function InboxDisplay({ uid }: InputProps) {
  const [user, setUser] = useState<userData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserData(uid);
        setUser(data);
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
      fetchUserData();
    }
  }, [uid]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="p-4">No user data found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Inbox</h2>
      <div className="space-y-4">
        {/* Add your inbox content here */}
        <p>User ID: {uid}</p>
      </div>
    </div>
  );
}
