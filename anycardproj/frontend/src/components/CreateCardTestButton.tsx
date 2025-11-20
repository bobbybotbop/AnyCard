import { useState } from "react";
import { createCard } from "../api/cards";

const CreateCardTestButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateTestCard = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const newCard = await createCard({
        name: "Test Card",
        description: "Created from Profile page",
      });
      setMessage(`✅ Card created successfully! ID: ${newCard.id}`);
      console.log("Card created:", newCard);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create card";
      setMessage(`❌ Error: ${errorMessage}`);
      console.error("Error creating card:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreateTestCard}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating..." : "Test Create Card"}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateCardTestButton;
