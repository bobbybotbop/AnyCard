import { userData } from "@full-stack/types";
import { getAllUsers, getUserData } from "../api/api";
import TradeUserDisplay from "../components/TradeUserDisplay";
import { useEffect, useState } from "react";

interface AllUsersDisplayProps {
  uid: string;
}

export default function AllUsersDisplay({ uid }: AllUsersDisplayProps) {
  const [users, setUsers] = useState<userData[]>();
  const [currentUser, setCurrentUser] = useState<userData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const allUsersData = await getAllUsers(uid);
        setUsers(allUsersData);

        const userData = await getUserData(uid);
        setCurrentUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [uid]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!users) {
    return <div className="p-4">No users found</div>;
  }
  if (!currentUser) {
    return <div className="p-4">Current user not found</div>;
  }

  return (
    <div>
      <h1>User ID: {uid}</h1>
      {users.map((user) => (
        <TradeUserDisplay otherUser={user} currentUser={currentUser} />
      ))}
    </div>
  );
}
