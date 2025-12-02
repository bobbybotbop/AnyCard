import React, { useState } from "react";
import {
  searchSerper,
  callOpenRouter,
  createRandomSet,
  createDailyPacks,
  getCustomSetPrompt,
} from "../api/api";

const WikipediaTestButton: React.FC = () => {
  const [query, setQuery] = useState("Albert Einstein");
  const [loading, setLoading] = useState(false);
  const [openRouterInput, setOpenRouterInput] = useState(
    "What is artificial intelligence?"
  );
  const [openRouterLoading, setOpenRouterLoading] = useState(false);
  const [randomSetLoading, setRandomSetLoading] = useState(false);
  const [dailyPacksLoading, setDailyPacksLoading] = useState(false);
  const [customPromptInput, setCustomPromptInput] = useState("space");
  const [customPromptLoading, setCustomPromptLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await searchSerper(query);
      console.log("Serper API result:", result);
    } catch (error) {
      console.error("Error searching Serper API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRouter = async () => {
    setOpenRouterLoading(true);
    try {
      await callOpenRouter(openRouterInput);
    } catch (error) {
      console.error("Error calling OpenRouter:", error);
    } finally {
      setOpenRouterLoading(false);
    }
  };

  const handleCreateRandomSet = async () => {
    setRandomSetLoading(true);
    try {
      await createRandomSet();
    } catch (error) {
      console.error("Error creating random set:", error);
    } finally {
      setRandomSetLoading(false);
    }
  };

  const handleCreateDailyPacks = async () => {
    setDailyPacksLoading(true);
    try {
      await createDailyPacks();
    } catch (error) {
      console.error("Error creating daily packs:", error);
    } finally {
      setDailyPacksLoading(false);
    }
  };

  const handleGetCustomPrompt = async () => {
    setCustomPromptLoading(true);
    try {
      const prompt = await getCustomSetPrompt(customPromptInput);
      console.log("Generated Custom Set Prompt:", prompt);
    } catch (error) {
      console.error("Error getting custom set prompt:", error);
    } finally {
      setCustomPromptLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "20px",
      }}
    >
      <h3>API Test Components</h3>

      {/* Serper API Test */}
      <div
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Serper API Image Search Test</h4>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query"
            style={{ padding: "8px", marginRight: "10px", width: "300px" }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Search Serper API"}
          </button>
        </div>
      </div>

      {/* OpenRouter Test */}
      <div
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>
          OpenRouter (Claude 3 Haiku) Test
        </h4>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={openRouterInput}
            onChange={(e) => setOpenRouterInput(e.target.value)}
            placeholder="Enter your message"
            style={{ padding: "8px", marginRight: "10px", width: "300px" }}
          />
          <button
            onClick={handleOpenRouter}
            disabled={openRouterLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: openRouterLoading ? "not-allowed" : "pointer",
            }}
          >
            {openRouterLoading ? "Processing..." : "Call OpenRouter"}
          </button>
        </div>
      </div>

      {/* Create Random Set Test */}
      <div
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Create Random Card Set Test</h4>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={handleCreateRandomSet}
            disabled={randomSetLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: randomSetLoading ? "not-allowed" : "pointer",
            }}
          >
            {randomSetLoading ? "Generating..." : "Create Random Set"}
          </button>
        </div>
      </div>

      {/* Create Daily Packs Test */}
      <div
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Create Daily Packs Test</h4>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={handleCreateDailyPacks}
            disabled={dailyPacksLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff6b35",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: dailyPacksLoading ? "not-allowed" : "pointer",
            }}
          >
            {dailyPacksLoading
              ? "Generating..."
              : "Create Daily Packs (3 Sets)"}
          </button>
        </div>
      </div>

      {/* Get Custom Set Prompt Test */}
      <div>
        <h4 style={{ marginBottom: "10px" }}>Get Custom Set Prompt Test</h4>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={customPromptInput}
            onChange={(e) => setCustomPromptInput(e.target.value)}
            placeholder="Enter theme input (e.g., 'space', 'animals')"
            style={{ padding: "8px", marginRight: "10px", width: "300px" }}
          />
          <button
            onClick={handleGetCustomPrompt}
            disabled={customPromptLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#9b59b6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: customPromptLoading ? "not-allowed" : "pointer",
            }}
          >
            {customPromptLoading ? "Generating..." : "Get Custom Prompt"}
          </button>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}>
        Check the browser console for the results
      </p>
    </div>
  );
};

export default WikipediaTestButton;
