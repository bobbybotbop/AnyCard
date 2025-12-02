import InboxDisplay from "../components/InboxDisplay";

const Inbox = () => {
  // Get some sample cards from the first set for testing
  const mockedUid: string = "dwyPdzKQayMGj4ZGnNyse1r2Ckn2";

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-400 to-white">
      <div className="w-[90%] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Inbox
        </h1>
        <div className="flex flex-col items-center">
          <InboxDisplay uid={mockedUid} />
        </div>
      </div>
    </main>
  );
};

export default Inbox;
