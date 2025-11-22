import React, { useState } from "react";
import { searchWikipedia, callOpenRouter, createRandomSet } from "../api/cards";

const WikipediaTestButton: React.FC = () => {
  const [query, setQuery] = useState("Albert Einstein");
  const [loading, setLoading] = useState(false);
  const [openRouterInput, setOpenRouterInput] = useState(
    "What is artificial intelligence?"
  );
  const [openRouterLoading, setOpenRouterLoading] = useState(false);
  const [randomSetLoading, setRandomSetLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await searchWikipedia(query);
      console.log("Wikipedia Search Result:", result);
      console.log("Title:", result.title);
      console.log("Image URL:", result.imageUrl);
    } catch (error) {
      console.error("Error searching Wikipedia:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRouter = async () => {
    setOpenRouterLoading(true);
    try {
      const result = await callOpenRouter(openRouterInput);
      console.log("OpenRouter Response:", result);
      if (result.choices && result.choices.length > 0) {
        console.log("AI Response:", result.choices[0].message?.content);
      }
    } catch (error) {
      console.error("Error calling OpenRouter:", error);
    } finally {
      setOpenRouterLoading(false);
    }
  };

  const handleCreateRandomSet = async () => {
    setRandomSetLoading(true);
    try {
      const result = await createRandomSet();
      console.log("Random Set Created:", result);
    } catch (error) {
      console.error("Error creating random set:", error);
    } finally {
      setRandomSetLoading(false);
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

      {/* Wikipedia Test */}
      <div
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Wikipedia Search Test</h4>
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
            {loading ? "Searching..." : "Search Wikipedia"}
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
          OpenRouter (Grok 4.1 Fast) Test
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
      <div>
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

      <p style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}>
        Check the browser console for the results
      </p>
    </div>
  );
};

export default WikipediaTestButton;
