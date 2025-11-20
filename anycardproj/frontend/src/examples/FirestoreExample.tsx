import { useState } from "react";
import {
  addDocument,
  setDocument,
  updateDocument,
  addCardToCollection,
} from "../utils/firestore";
import { auth } from "../auth/firebase";
import { Card } from "../data/cards";

/**
 * Example component showing how to add data to Firestore
 * This is a reference file - you can use these patterns in your actual components
 */
const FirestoreExample = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Example 1: Add a document with auto-generated ID
  const handleAddCard = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in first");
        return;
      }

      const newCard: Card = {
        name: "Pikachu",
        picture: "/pokemon/pikachu.jpg",
        hp: 60,
        rarity: "rare",
        attacks: [
          { name: "Thunder Shock", damage: 10 },
          { name: "Thunderbolt", damage: 50 },
        ],
        chance: 0.15,
      };

      // Add to user's card collection
      const docRef = await addCardToCollection(user.uid, newCard);
      setMessage(`Card added with ID: ${docRef.id}`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Add a document to a collection (generic)
  const handleAddGeneric = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = {
        name: "Test Document",
        value: 123,
        tags: ["test", "example"],
      };

      const docRef = await addDocument("testCollection", data);
      setMessage(`Document added with ID: ${docRef.id}`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Set a document with a specific ID
  const handleSetDocument = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in first");
        return;
      }

      const profileData = {
        displayName: user.displayName || "Anonymous",
        email: user.email,
        photoURL: user.photoURL,
        level: 1,
        totalCards: 0,
      };

      // This will create or update the user document
      await setDocument("users", user.uid, profileData);
      setMessage("User profile saved successfully");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Update an existing document
  const handleUpdateDocument = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in first");
        return;
      }

      // Only update specific fields
      await updateDocument("users", user.uid, {
        level: 42,
        lastLogin: new Date().toISOString(),
      });
      setMessage("User profile updated successfully");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firestore Examples</h1>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">1. Add Card to Collection</h2>
          <p className="text-sm text-gray-600 mb-2">
            Adds a card to the user's collection with auto-generated ID
          </p>
          <button
            onClick={handleAddCard}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Add Card
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">2. Add Generic Document</h2>
          <p className="text-sm text-gray-600 mb-2">
            Adds a document to any collection with auto-generated ID
          </p>
          <button
            onClick={handleAddGeneric}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Add Generic Document
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">3. Set Document with ID</h2>
          <p className="text-sm text-gray-600 mb-2">
            Creates or updates a document with a specific ID (user profile)
          </p>
          <button
            onClick={handleSetDocument}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Save User Profile
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">4. Update Document</h2>
          <p className="text-sm text-gray-600 mb-2">
            Updates specific fields in an existing document
          </p>
          <button
            onClick={handleUpdateDocument}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Update User Profile
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded ${message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Quick Reference:</h3>
        <pre className="text-xs overflow-x-auto">
          {`// Add document (auto ID)
import { addDocument } from "../utils/firestore";
await addDocument("collectionName", { field: "value" });

// Set document (specific ID)
import { setDocument } from "../utils/firestore";
await setDocument("collectionName", "docId", { field: "value" });

// Update document
import { updateDocument } from "../utils/firestore";
await updateDocument("collectionName", "docId", { field: "newValue" });`}
        </pre>
      </div>
    </div>
  );
};

export default FirestoreExample;
