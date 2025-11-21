import path from "path";
import express, { Express } from "express";
import cors from "cors";
import { WeatherResponse, newUser, userData } from "@full-stack/types";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app: Express = express();

const hostname = "0.0.0.0";
const port = 8080;

app.use(cors());
app.use(express.json());

var admin = require("firebase-admin");

var serviceAccount = require("./secrets/ACFire.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function createDocument(collection: string, data: any) {
  try {
    const docRef = await db.collection(collection).add(data);
    return { id: docRef.id, ...data };
  } catch (error) {
    throw error;
  }
}

async function createUser(data: newUser): Promise<userData | null> {
  try {
    const userRef = await db.collection("users").doc(data.UID).set({
      username: data.username,
      email: data.email,
      createdAt: new Date().toString(),
      level: 0,
      cards: [],
      favoriteCards: [],
    });
    return userRef;
  } catch (error) {
    throw error;
  }
}

async function getUserData(uid: string): Promise<userData | null> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    const data = userDoc.data();
    return {
      UID: uid,
      username: data?.username || "",
      email: data?.email || "",
      createdAt: data?.createdAt || "",
      level: data?.level || 0,
      cards: data?.cards || [],
      favoriteCards: data?.favoriteCards || [],
    };
  } catch (error) {
    throw error;
  }
}

// app.get("/addUser", async (req, res) => {});

app.post("/api/createCard", async (req, res) => {
  try {
    const result = await createDocument("cards", req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

//pass in object with UID, username, email, createdAt, Level, Cards, FavoriteCards
app.post("/api/createUser", async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/api/getUserData/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = await getUserData(uid);
    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

app.get("/api/searchWikipedia", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query parameter is required" });
      return;
    }

    // Step 1: Search for the topic
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = (await searchResponse.json()) as any;

    if (
      !searchData.query ||
      !searchData.query.search ||
      searchData.query.search.length === 0
    ) {
      res.status(404).json({ error: "No results found" });
      return;
    }

    // Get the first result's title
    const firstResult = searchData.query.search[0];
    const title = firstResult.title;

    // Step 2: Get page summary with image
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`;
    const summaryResponse = await fetch(summaryUrl);

    if (!summaryResponse.ok) {
      res
        .status(summaryResponse.status)
        .json({ error: "Failed to fetch page summary" });
      return;
    }

    const summaryData = (await summaryResponse.json()) as any;

    const result = {
      title: summaryData.title,
      imageUrl: summaryData.thumbnail?.source || null,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    res.status(500).json({ error: "Failed to search Wikipedia" });
  }
});

app.post("/api/openrouter", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Input parameter is required" });
      return;
    }

    // OpenRouter API key - leave blank for user to add later
    // You can set this via environment variable: OPENROUTER_API_KEY
    const openRouterApiKey = (process.env.OPENROUTER_API_KEY || "").trim();

    console.log(openRouterApiKey);
    if (!openRouterApiKey) {
      res.status(500).json({
        error:
          "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
      });
      return;
    }

    // Debug logging (remove in production)
    console.log(
      "OpenRouter API Key loaded:",
      openRouterApiKey
        ? `YES (length: ${
            openRouterApiKey.length
          }, starts with: ${openRouterApiKey.substring(0, 10)}...)`
        : "NO"
    );

    // OpenRouter API endpoint
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

    // Request headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    };

    // Add optional headers only if they're set
    if (process.env.OPENROUTER_HTTP_REFERER) {
      headers["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER;
    }
    if (process.env.OPENROUTER_APP_NAME) {
      headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
    } else {
      headers["X-Title"] = "AnyCard";
    }

    // Debug logging (remove in production)
    console.log("Request URL:", openRouterUrl);
    console.log("Request headers:", {
      ...headers,
      Authorization: "Bearer ***",
    }); // Hide actual key in logs

    // Request body for Grok 4.1 Fast (free)
    const payload = {
      model: "x-ai/grok-4.1-fast:free", // Grok 4.1 Fast free model via OpenRouter
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
    };

    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      res.status(response.status).json({
        error: "Failed to call OpenRouter API",
        details: errorData,
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    res
      .status(500)
      .json({ error: "Failed to process request with OpenRouter" });
  }
});

app.listen(port, hostname, () => {
  console.log("Listening");
});
