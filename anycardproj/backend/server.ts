import path from "path";
import express, { Express } from "express";
import cors from "cors";
import {
  newUser,
  userData,
  Set,
  Card,
  Rarity,
  Attack,
} from "@full-stack/types";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { generateRandomCardSetPrompt } from "./prompts";

// Load environment variables from .env file
dotenv.config();

const app: Express = express();

const hostname = "0.0.0.0";
const port = 8080;
const WIKIPEDIA_RATE_LIMIT_DELAY = 2000;

app.use(cors());
app.use(express.json());

var admin = require("firebase-admin");

// var serviceAccount = require("./secrets/ACFire.json")
var serviceAccount = require("../backend/secrets/ACFire.json");

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

async function createDocumentWithId(
  collection: string,
  documentId: string,
  data: any
): Promise<void> {
  try {
    await db.collection(collection).doc(documentId).set(data);
  } catch (error) {
    throw error;
  }
}

async function createUser(data: newUser): Promise<userData | null> {
  try {
    await createDocumentWithId("users", data.UID, {
      username: data.username,
      email: data.email,
      createdAt: new Date().toString(),
      level: 0,
      cards: [],
      favoriteCards: [],
    });
    return null;
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

async function setUserData(uid: string, data: any): Promise<boolean> {
  try {
    if (!data || !uid) {
      return false;
    }

    const userRef = db.collection("users").doc(uid); // DocRef
    const userSnap = await userRef.get(); // Snapshot

    if (!userSnap.exists) {
      return false;
    }

    console.log("aye");
    await userRef.update(data);
    return true;
  } catch {
    return false;
  }
}

async function getSetFromCollection(
  collection: string,
  setId: string
): Promise<Set | null> {
  try {
    const setDoc = await db.collection(collection).doc(setId).get();
    if (!setDoc.exists) {
      return null;
    }
    const data = setDoc.data();
    return data as Set;
  } catch (error) {
    throw error;
  }
}

interface WikipediaResult {
  title: string;
  imageUrl: string | null;
}

async function searchWikipedia(query: string): Promise<WikipediaResult> {
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
    throw new Error("No results found");
  }

  // Get the first result's title
  const firstResult = searchData.query.search[0];
  const title = firstResult.title;

  // Step 2: Try to get page summary with image (with retry logic)
  let imageUrl: string | null = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`;
      const summaryResponse = await fetch(summaryUrl);

      if (summaryResponse.ok) {
        const summaryData = (await summaryResponse.json()) as any;
        imageUrl = summaryData.thumbnail?.source || null;
        if (imageUrl) {
          return {
            title: summaryData.title || title,
            imageUrl: imageUrl,
          };
        }
      } else if (summaryResponse.status === 429) {
        // Rate limited - wait before retry

        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log("wiki call failed, waiting " + waitTime);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Last attempt failed, try alternative method
        break;
      }
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // Step 3: Alternative method - try to get image from page images API
  try {
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=pageimages&pithumbsize=500&format=json&origin=*`;
    const imagesResponse = await fetch(imagesUrl);

    if (imagesResponse.ok) {
      const imagesData = (await imagesResponse.json()) as any;
      const pages = imagesData.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        if (page?.thumbnail?.source) {
          imageUrl = page.thumbnail.source;
        }
      }
    }
  } catch (error) {
    // Ignore errors from alternative method
  }

  // Return result even if no image found
  return {
    title: title,
    imageUrl: imageUrl,
  };
}

interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  error?: string;
  details?: any;
}

async function callOpenRouter(input: string): Promise<OpenRouterResponse> {
  // OpenRouter API key
  const openRouterApiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  console.log(openRouterApiKey);

  if (!openRouterApiKey) {
    throw new Error(
      "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable."
    );
  }

  // OpenRouter API endpoint
  const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

  // Request headers
  const headers: Record<string, string> = {
    Authorization: `Bearer ${openRouterApiKey}`,
    "Content-Type": "application/json",
  };

  // Request body for Claude 3 Haiku
  const payload = {
    model: "anthropic/claude-3-haiku",
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
    const error: any = new Error(
      `OpenRouter API error: ${JSON.stringify(errorData)}`
    );
    error.status = response.status;
    error.errorData = errorData;
    throw error;
  }

  const data = await response.json();
  return data;
}

interface ParsedSetData {
  theme: string;
  setName: string;
  cards: Array<{
    name: string;
    hp: number;
    rarity: string;
    attacks: Array<{ name: string; damage: number }>;
  }>;
}

// Commented out function - kept in case we need randomness logic later
// async function addRandomnessToPrompt(basePrompt: string): string {
//   // Generate a random seed/number to add variation to the prompt
//   const randomSeed = Math.floor(Math.random() * 10000);
//   const randomThemes = [
//     "Medieval Weapons",
//     "Ocean Creatures",
//     "Historical Battles",
//     "World War II Aircraft",
//     "Ancient Civilizations",
//     "Appliances",
//     "Furniture",
//     "Cookware",
//     "Tableware",
//     "Bedding",
//     "Lighting",
//     "Electronics",
//     "Tools",
//     "Cleaning Supplies",
//     "Storage",
//     "Decor ",
//     "Textiles",
//     "Stationery",
//     "Utensils",
//   ];
//   const randomThemeHint =
//     randomThemes[Math.floor(Math.random() * randomThemes.length)];
//
//   const promptWithRandomness = `${basePrompt}\n\nIMPORTANT: Use a DIFFERENT theme than "${randomThemeHint}". Be creative and choose something unique. Random seed: ${randomSeed}`;
//   return promptWithRandomness;
// }

async function processSetData(parsedData: ParsedSetData): Promise<Set> {
  console.log("!!finished calling openrouter, now calling wiki");
  // Get cover image for the theme
  let coverImage = "";
  try {
    const themeResult = await searchWikipedia(parsedData.theme);
    coverImage = themeResult.imageUrl || "";
  } catch (error) {
    console.error(
      `Failed to get cover image for theme "${parsedData.theme}":`,
      error
    );
  }

  // Transform cards with Wikipedia images (process sequentially to avoid rate limiting)
  const transformedCards = [];
  for (let i = 0; i < parsedData.cards.length; i++) {
    const card = parsedData.cards[i];
    let picture = "";
    try {
      const cardResult = await searchWikipedia(card.name);
      picture = cardResult.imageUrl || "doesNotExistOnWiki";
    } catch (error) {
      console.error(`Failed to get image for card "${card.name}":`, error);
      picture = "cardNotFound";
    }

    // Add a small delay between requests to avoid rate limiting (except for the last card)
    if (i < parsedData.cards.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, WIKIPEDIA_RATE_LIMIT_DELAY)
      );
    }

    // Ensure we have exactly 2 attacks
    if (card.attacks.length !== 2) {
      console.error(
        `Card "${card.name}" has ${card.attacks.length} attacks, expected 2`
      );
    }

    transformedCards.push({
      name: card.name,
      picture: picture,
      hp: card.hp,
      rarity: card.rarity as Rarity,
      attacks: [
        card.attacks[0] || { name: "Unknown", damage: 0 },
        card.attacks[1] || { name: "Unknown", damage: 0 },
      ] as [Attack, Attack],
      fromPack: parsedData.setName,
    });
  }

  // If coverImage is not found, use a randomly selected image from successfully found card images
  if (!coverImage) {
    const successfulCardImages = transformedCards
      .map((card) => card.picture)
      .filter((picture) => picture && picture !== "cardNotFound");

    if (successfulCardImages.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * successfulCardImages.length
      );
      coverImage = successfulCardImages[randomIndex];
      console.log(
        `Cover image not found for theme "${parsedData.theme}", using random card image: ${coverImage}`
      );
    }
  }

  const setObject: Set = {
    name: parsedData.setName,
    theme: parsedData.theme,
    coverImage: coverImage,
    cards: transformedCards,
  };

  // Console log: After images are found for the set
  console.log(`${setObject.theme} - images found`);

  return setObject;
}

async function createRandomSet(
  prompt: string = generateRandomCardSetPrompt,
  collection: string = "cards"
): Promise<Set> {
  // Simply call openrouter with the provided prompt (or default)
  const result = await callOpenRouter(prompt);
  if (!result || !result.choices || result.choices.length === 0) {
    throw new Error("No response received from OpenRouter API");
  }

  const content = result.choices[0].message?.content;
  if (!content) {
    throw new Error("No content in OpenRouter API response");
  }

  try {
    const parsedData: ParsedSetData = JSON.parse(content);
    const setObject = await processSetData(parsedData);
    await createDocumentWithId(collection, setObject.name, setObject);
    console.log(setObject);
    return setObject;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(
      `Failed to parse JSON response: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function createThreeRandomSets(): Promise<Set[]> {
  const processedSets: Set[] = [];

  // Call createRandomSet three separate times
  for (let i = 0; i < 3; i++) {
    try {
      const setObject = await createRandomSet(
        generateRandomCardSetPrompt,
        "dailyPacks"
      );

      // Console log: After each Claude call completes, log the theme that was generated
      console.log(`Generated set theme: ${setObject.theme}`);

      processedSets.push(setObject);
    } catch (error) {
      console.error(`Failed to create set ${i + 1}:`, error);
      throw error;
    }
  }

  // Console log: When everything is done
  console.log("All done generating!");

  return processedSets;
}

async function getDailyPacks(): Promise<Set[]> {
  try {
    const snapshot = await db.collection("dailyPacks").get();
    const sets: Set[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      sets.push(data as Set);
    });

    // Return the first 3 sets (or fewer if less than 3 exist)
    return sets.slice(0, 3);
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

    const result = await searchWikipedia(query);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error searching Wikipedia:", error);
    if (error.message === "No results found") {
      res.status(404).json({ error: error.message });
    } else if (error.message === "Failed to fetch page summary") {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to search Wikipedia" });
    }
  }
});

app.post("/api/openrouter", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Input parameter is required" });
      return;
    }

    const result = await callOpenRouter(input);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error calling OpenRouter:", error);
    if (error.message.includes("API key not configured")) {
      res.status(500).json({ error: error.message });
    } else if (error.status) {
      res.status(error.status).json({
        error: "Failed to call OpenRouter API",
        details: error.errorData || error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "Failed to process request with OpenRouter" });
    }
  }
});

app.post("/api/createRandomSet", async (req, res) => {
  try {
    const result = await createRandomSet();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in createRandomSet", error);
    if (error.message === "No results found") {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("API key not configured")) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to process combined request" });
    }
  }
});

app.post("/api/createDailyPacks", async (req, res) => {
  try {
    const result = await createThreeRandomSets();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in createThreeRandomSets", error);
    if (error.message === "No results found") {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("API key not configured")) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to process daily packs request" });
    }
  }
});

app.get("/api/getDailyPacks", async (req, res) => {
  try {
    const result = await getDailyPacks();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getDailyPacks", error);
    res.status(500).json({ error: "Failed to get daily packs" });
  }
});

app.listen(port, hostname, () => {
  console.log("Listening on " + port);
});

app.get("/api/getUserInventory/:userUid", async (req, res) => {
  const { userUid } = req.params;
  if (!userUid) return res.status(400).json({ error: "user not given" });

  try {
    const userdata = await getUserData(userUid);
    if (!userdata) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    return res.status(200).json({ cards: userdata.cards });
  } catch {
    return res.status(400).json({ error: "Invalid user" });
  }
});

// POST /api/openDailyPack
app.post("/api/openDailyPack/:userUid", async (req, res) => {
  const { userUid } = req.params;
  const { dailyPackId } = req.body || {};

  // 1) Basic validation
  if (!dailyPackId || typeof dailyPackId !== "string") {
    return res.status(400).json({ error: "dailyPackId required" });
  }

  if (!userUid || typeof userUid !== "string") {
    return res.status(400).json({ error: "dailyPackId required" });
  }

  try {
    const packRef = db.collection("dailyPacks").doc(dailyPackId);
    const packSnap = await packRef.get();
    if (!packSnap.exists)
      return res.status(404).json({ error: "Pack not found" });
    const packData: any = packSnap.data();

    const availableCards: any[] = Array.isArray(packData?.cards)
      ? packData.cards
      : [];
    if (availableCards.length === 0) {
      return res.status(400).json({ error: "Pack has no cards configured" });
    }

    const awarded: Card[] = [];

    // pull at max 10 cards from user
    while (awarded.length <= 10 && availableCards.length != 0) {
      // grab random card
      const index = Math.floor(Math.random() * availableCards.length);
      awarded.push(availableCards[index]);
      availableCards.splice(index, 1);
    }

    const userData = await getUserData(userUid);
    if (!userData) {
      return res.status(400).json({ error: "User not found" });
    }
    let updatedCards;

    if (userData.cards) {
      updatedCards = [...userData.cards, ...awarded];
    } else {
      updatedCards = awarded;
    }

    const data = { cards: updatedCards };
    const isSet = await setUserData(userUid, data);
    if (!isSet) throw Error;

    return res.status(200).json({
      awarded,
      message: `Opened ${awarded.length} cards`,
    });
  } catch (err: any) {
    console.error("openDailyPack failed:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to open pack" });
  }
});
