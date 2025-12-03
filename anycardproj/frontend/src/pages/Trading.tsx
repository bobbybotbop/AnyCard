import AllUsersDisplay from "../components/AllUsersDisplay";
import { useAuth } from "../auth/authProvider";

const Trading = () => {
  const { user } = useAuth();

  if (!user?.uid) {
    return <p> User not found</p>;
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white overflow-x-hidden">
      <div className="mt-[8vh] w-[90%] max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Trading
        </h1>
        <div className="flex flex-col items-center">
          <AllUsersDisplay uid={user.uid} />
        </div>
      </div>
    </main>
  );
};

export default Trading;
