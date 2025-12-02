import InboxDisplay from "../components/InboxDisplay";
import { useAuth } from "../auth/authProvider";

const Inbox = () => {
  const { user } = useAuth();

  if (!user?.uid) {
    return <p>User not found</p>;
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="w-[90%] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Inbox
        </h1>
        <div className="flex flex-col items-center">
          <InboxDisplay uid={user.uid} />
        </div>
      </div>
    </main>
  );
};

export default Inbox;
