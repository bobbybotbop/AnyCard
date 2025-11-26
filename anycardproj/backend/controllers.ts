import {
  newUser,
  userData,
  Set,
  Card,
  Rarity,
  Attack,
} from "@full-stack/types";
import fetch from "node-fetch";
import { generateRandomCardSetPrompt } from "./prompts";

var admin = require("firebase-admin");

const db = admin.firestore();
const WIKIPEDIA_RATE_LIMIT_DELAY = 2000;
var serviceAccount = require("../backend/secrets/ACFire.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ============= DATABASE OPERATIONS =============

export async function createDocument(collection: string, data: any) {
  try {
    const docRef = await db.collection(collection).add(data);
    return { id: docRef.id, ...data };
  } catch (error) {
    throw error;
  }
}

export async function createDocumentWithId(
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

export async function createUser(data: newUser): Promise<userData | null> {
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

export async function getUserData(uid: string): Promise<userData | null> {
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

export async function setUserData(uid: string, data: any): Promise<boolean> {
  try {
    if (!data || !uid) {
      return false;
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return false;
    }

    await userRef.update(data);
    return true;
  } catch {
    return false;
  }
}

export async function getSetFromCollection(
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

// ============= WIKIPEDIA OPERATIONS =============

interface WikipediaResult {
  title: string;
  imageUrl: string | null;
}

export async function searchWikipedia(query: string): Promise<WikipediaResult> {
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

  const firstResult = searchData.query.search[0];
  const title = firstResult.title;

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
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log("wiki call failed, waiting " + waitTime);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        break;
      }
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

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
    // Ignore errors
  }

  return {
    title: title,
    imageUrl: imageUrl,
  };
}

// ============= OPENROUTER OPERATIONS =============

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

export async function callOpenRouter(
  input: string
): Promise<OpenRouterResponse> {
  const openRouterApiKey = (process.env.OPENROUTER_API_KEY || "").trim();

  if (!openRouterApiKey) {
    throw new Error(
      "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable."
    );
  }

  const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${openRouterApiKey}`,
    "Content-Type": "application/json",
  };

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

// ============= CARD SET OPERATIONS =============

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

export async function processSetData(parsedData: ParsedSetData): Promise<Set> {
  console.log("!!finished calling openrouter, now calling wiki");
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

    if (i < parsedData.cards.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, WIKIPEDIA_RATE_LIMIT_DELAY)
      );
    }

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

  console.log(`${setObject.theme} - images found`);

  return setObject;
}

export async function createRandomSet(
  prompt: string = generateRandomCardSetPrompt,
  collection: string = "cards"
): Promise<Set> {
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

export async function createThreeRandomSets(): Promise<Set[]> {
  const processedSets: Set[] = [];

  for (let i = 0; i < 3; i++) {
    try {
      const setObject = await createRandomSet(
        generateRandomCardSetPrompt,
        "dailyPacks"
      );

      console.log(`Generated set theme: ${setObject.theme}`);

      processedSets.push(setObject);
    } catch (error) {
      console.error(`Failed to create set ${i + 1}:`, error);
      throw error;
    }
  }

  console.log("All done generating!");

  return processedSets;
}

export async function getDailyPacks(): Promise<Set[]> {
  try {
    const snapshot = await db.collection("dailyPacks").get();
    const sets: Set[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      sets.push(data as Set);
    });

    return sets.slice(0, 3);
  } catch (error) {
    throw error;
  }
}

export async function openDailyPack(
  userUid: string,
  dailyPackId: string
): Promise<{ awarded: Card[]; message: string }> {
  try {
    const packRef = db.collection("dailyPacks").doc(dailyPackId);
    const packSnap = await packRef.get();
    if (!packSnap.exists) {
      throw new Error("Pack not found");
    }
    const packData: any = packSnap.data();

    const availableCards: any[] = Array.isArray(packData?.cards)
      ? packData.cards
      : [];
    if (availableCards.length === 0) {
      throw new Error("Pack has no cards configured");
    }

    const awarded: Card[] = [];

    while (awarded.length <= 10 && availableCards.length != 0) {
      const index = Math.floor(Math.random() * availableCards.length);
      awarded.push(availableCards[index]);
      availableCards.splice(index, 1);
    }

    const userData = await getUserData(userUid);
    if (!userData) {
      throw new Error("User not found");
    }
    let updatedCards;

    if (userData.cards) {
      updatedCards = [...userData.cards, ...awarded];
    } else {
      updatedCards = awarded;
    }

    const data = { cards: updatedCards };
    const isSet = await setUserData(userUid, data);
    if (!isSet) throw new Error("Failed to update user data");

    return {
      awarded,
      message: `Opened ${awarded.length} cards`,
    };
  } catch (err: any) {
    console.error("openDailyPack failed:", err);
    throw err;
  }
}
