import {
  newUser,
  userData,
  Set,
  Card,
  Rarity,
  Attack,
  Status,
  MyResponse,
  sentUser,
  requestUser,
} from "@full-stack/types";
import fetch from "node-fetch";
import {
  generateRandomCardSetPrompt,
  generatePromptWithExclusions,
} from "./prompts";
import { generateRandomCardSetPrompt } from "./prompts";
import { v4 as uuidv4 } from "uuid";
const { db, auth } = require("./firebase");

const WIKIPEDIA_RATE_LIMIT_DELAY = 2000;

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
      sentTrade: data?.sentTrade || [],
      requestedTrade: data?.requestTrade || [],
    };
  } catch (error) {
    throw error;
  }
}

export async function getAllUsers(uid: string): Promise<userData[] | null> {
  try {
    const usersSnapshot = await db.collection("users").get();

    const allUsers: userData[] = usersSnapshot.docs.map(
      (doc: { data: () => userData }) => {
        const data = doc.data() as userData;
        return { ...data };
      }
    );

    const finalList = allUsers.filter((u) => u.UID !== uid);
    return finalList;
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

export async function getAllExistingThemes(): Promise<string[]> {
  try {
    const themesSet = new Set<string>();

    // Query dailyPacks collection
    const dailyPacksSnapshot = await db.collection("dailyPacks").get();
    dailyPacksSnapshot.forEach((doc: any) => {
      const data = doc.data() as Set;
      if (data.theme && typeof data.theme === "string") {
        themesSet.add(data.theme.trim());
      }
    });

    // Query cards collection
    const cardsSnapshot = await db.collection("cards").get();
    cardsSnapshot.forEach((doc: any) => {
      const data = doc.data() as Set;
      if (data.theme && typeof data.theme === "string") {
        themesSet.add(data.theme.trim());
      }
    });

    return Array.from(themesSet);
  } catch (error) {
    console.error("Error fetching existing themes:", error);
    // Return empty array on error to allow generation to proceed
    return [];
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
  } catch (error) {}

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
  collection: string = "cards",
  excludedThemes?: string[]
): Promise<Set> {
  // Use prompt with exclusions if excludedThemes is provided
  const finalPrompt =
    excludedThemes && excludedThemes.length > 0
      ? generatePromptWithExclusions(excludedThemes)
      : prompt;

  const result = await callOpenRouter(finalPrompt);
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

  // Fetch all existing themes from dailyPacks and cards collections
  const existingThemes = await getAllExistingThemes();
  const excludedThemes = [...existingThemes];

  console.log(
    `Found ${excludedThemes.length} existing themes to exclude:`,
    excludedThemes
  );

  for (let i = 0; i < 3; i++) {
    try {
      const setObject = await createRandomSet(
        generateRandomCardSetPrompt,
        "dailyPacks",
        excludedThemes
      );

      console.log(`Generated set theme: ${setObject.theme}`);

      processedSets.push(setObject);

      // Add the newly generated theme to excluded themes to avoid duplicates within this batch
      excludedThemes.push(setObject.theme);
    } catch (error) {
      console.error(`Failed to create set ${i + 1}:`, error);
      throw error;
    }
  }

  // Migrate old dailyPacks to cards collection
  try {
    const dailyPacksSnapshot = await db.collection("dailyPacks").get();
    const newSetNames = new Set(processedSets.map((s) => s.name));

    const migrationPromises: Promise<void>[] = [];

    dailyPacksSnapshot.forEach((doc: any) => {
      const docId = doc.id;
      const docData = doc.data();

      // If this is not one of the newly generated sets, migrate it to cards
      if (!newSetNames.has(docId)) {
        migrationPromises.push(
          (async () => {
            // Copy to cards collection
            await createDocumentWithId("cards", docId, docData);
            // Delete from dailyPacks collection
            await db.collection("dailyPacks").doc(docId).delete();
            console.log(`Migrated dailyPack "${docId}" to cards collection`);
          })()
        );
      }
    });

    // Wait for all migrations to complete
    await Promise.all(migrationPromises);
    console.log(
      `Migrated ${migrationPromises.length} old dailyPacks to cards collection`
    );
  } catch (error) {
    console.error("Error migrating old dailyPacks to cards:", error);
    // Don't throw - allow function to continue even if migration fails
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

export async function getAllSets(): Promise<Set[]> {
  try {
    const snapshot = await db.collection("cards").get();
    const sets: Set[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      sets.push(data as Set);
    });

    return sets;
  } catch (error) {
    throw error;
  }
}

export async function openPack(
  userUid: string,
  packId: string,
  collection: string = "dailyPacks"
): Promise<{ awarded: Card[]; message: string }> {
  try {
    const packRef = db.collection(collection).doc(packId);
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

    while (awarded.length < 10 && availableCards.length != 0) {
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

    console.log("Opened cards:", awarded);

    return {
      awarded,
      message: `Opened ${awarded.length} cards`,
    };
  } catch (err: any) {
    console.error("openPack failed:", err);
    throw err;
  }
}

export async function saveFavoritePack(userUid: string, card: Card) {
  const userData = await getUserData(userUid);
  if (!userData) {
    throw new Error("User not found");
  }
  let updatedFavoriteCards;

  if (userData.favoriteCards) {
    updatedFavoriteCards = [...userData.favoriteCards, card];
  } else {
    updatedFavoriteCards = [card];
  }

  const data = { favoriteCards: updatedFavoriteCards };
  const isSet = await setUserData(userUid, data);

  if (!isSet) throw new Error("Failed to update user data");

  return {
    message: `Successfuly saved favorite card`,
  };
}

export async function requestTrade(
  userUID: string,
  sentUserUID: string,
  wantedCard: Card,
  givenCard: Card
): Promise<void> {
  const userData = await getUserData(userUID);
  const sentUserData = await getUserData(sentUserUID);

  const tradeId = uuidv4();

  if (!userData || !sentUserData)
    throw new Error("User or sent User not found");
  let sentTrades: sentUser[] = [];
  const sendTrade: sentUser = {
    tradeId: tradeId,
    sentUserUID: userUID,
    wantedCard: wantedCard,
    givenCard: givenCard,
    status: "pending",
  };

  if (userData.sentTrade && userData.sentTrade.length > 0) {
    const hasUsedCard = userData.sentTrade.some(
      (t) => t.givenCard.name === givenCard.name
    );

    if (hasUsedCard) {
      throw Error("Card is already in use for another trade");
    }

    sentTrades = [...userData.sentTrade, sendTrade];
  } else {
    sentTrades = [sendTrade];
  }

  const sentTradeData = { sentTrade: sentTrades };

  let reqTrades: requestUser[] = [];
  const requestTrade: requestUser = {
    tradeId: tradeId,
    requestedUserUID: sentUserUID,
    wantedCard: givenCard,
    givenCard: wantedCard,
    status: "pending",
  };

  if (sentUserData.requestedTrade && sentUserData.requestedTrade.length > 0) {
    reqTrades = [...sentUserData.requestedTrade, requestTrade];
  } else {
    reqTrades = [requestTrade];
  }

  const reqTradedata = { requestedTrade: reqTrades };

  const isUserSet = await setUserData(userUID, sentTradeData);
  const isSentUserSet = await setUserData(sentUserUID, reqTradedata);

  if (!isUserSet) {
    if (!isSentUserSet) {
      throw new Error("Trade cannot be made");
    }

    throw new Error(" Sent User is set but User is not. That is NOT good");
  }

  if (!isSentUserSet) {
    throw new Error("User is set but sent user is not. That is NOT good");
  }
}

export async function respondTrade(
  userUID: string,
  response: MyResponse,
  tradeId: string
): Promise<void> {
  const userData = await getUserData(userUID);
  const reqUserData = await getReqUserData(userData, tradeId);

  if (!userData || !reqUserData) throw new Error("User or sent User not found");

  if (!userData.requestedTrade || !reqUserData.sentTrade) {
    throw new Error("Invalid requested user or sent user");
  }

  let reqUser = reqUserData.sentTrade.find((u) => u.tradeId === tradeId);
  if (!reqUser) throw new Error("User never wanted card?!");
  reqUser.status = response;

  if (response === "accepted") {
    const index = userData.cards.findIndex((u) => u === reqUser.givenCard);
    if (index !== -1) {
      userData.cards.splice(index, 1);
    } else {
      throw new Error("User never had the card to start off with");
    }
    userData.cards.push(reqUser.wantedCard);

    const index2 = reqUserData.cards.findIndex((u) => u === reqUser.wantedCard);
    if (index2 !== -1) {
      reqUserData.cards.splice(index2, 1);
    } else {
      throw new Error("Requested User never had the card");
    }
    reqUserData.cards.push(reqUser.givenCard);
  } else if (response === "rejected") {
    reqUser.status = "rejected";
  }

  userData.requestedTrade = userData.requestedTrade.filter(
    (u) => u.tradeId !== tradeId
  );
}

export async function getReqUserData(
  data: userData | null,
  tradeId: string
): Promise<userData | null> {
  if (!data) return null;

  const reqUser = (data.requestedTrade as requestUser[]).find(
    (u) => u.tradeId === tradeId
  );

  if (!reqUser?.requestedUserUID) return null;

  try {
    const reqUserDoc = await db
      .collection("users")
      .doc(reqUser.requestedUserUID)
      .get();

    const reqUserData = reqUserDoc.data();

    return {
      UID: reqUser.requestedUserUID,
      username: data?.username || "",
      email: data?.email || "",
      createdAt: data?.createdAt || "",
      level: data?.level || 0,
      cards: data?.cards || [],
      favoriteCards: data?.favoriteCards || [],
      sentTrade: data?.sentTrade || [],
      requestedTrade: data?.requestedTrade || [],
    };
  } catch {
    return null;
  }
}
