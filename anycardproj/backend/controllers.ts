import {
  newUser,
  userData,
  Set,
  Card,
  Rarity,
  Attack,
  Status,
  MyResponse,
  otherUser,
  // sentUser,
  // requestUser,
} from "@full-stack/types";
import fetch from "node-fetch";
import {
  generateRandomCardSetPrompt,
  generatePromptWithExclusions,
  generateCustomSetPrompt,
} from "./prompts";
import { v4 as uuidv4 } from "uuid";
const { db, auth } = require("./firebase");

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
    // Check if user already exists
    const userDoc = await db.collection("users").doc(data.UID).get();

    if (userDoc.exists) {
      // User already exists, don't overwrite their data
      console.log(`User ${data.UID} already exists, skipping creation`);
      return null;
    }

    // User doesn't exist, create new user
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
      requestedTrade: data?.requestedTrade || [],
    };
  } catch (error) {
    throw error;
  }
}

export async function getAllUsers(uid: string): Promise<userData[] | null> {
  try {
    const usersSnapshot = await db.collection("users").get();
    const allUsers: userData[] = usersSnapshot.docs.map((doc: any) => ({
      ...(doc.data() as userData),
      UID: doc.id,
    }));
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

export async function getAllTrades(uid: string) {
  const userData = await getUserData(uid);
  if (!userData) throw Error("User not found!");

  let reqAndSent: otherUser[] = [];
  console.log(userData.requestedTrade?.length);
  console.log(userData.sentTrade?.length);
  if (userData.requestedTrade) reqAndSent = [...userData.requestedTrade];

  if (userData.sentTrade) reqAndSent = [...reqAndSent, ...userData.sentTrade];

  return reqAndSent.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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

// ============= SERPER API OPERATIONS =============

interface SerperResult {
  title: string;
  imageUrls: string[];
}

export async function getSerperImage(query: string): Promise<SerperResult> {
  const serperApiKey = (process.env.SERPER_API_KEY || "").trim();

  if (!serperApiKey) {
    throw new Error(
      "Serper API key not configured. Please set SERPER_API_KEY environment variable."
    );
  }

  const serperUrl = "https://google.serper.dev/images";

  const headers: Record<string, string> = {
    "X-API-KEY": serperApiKey,
    "Content-Type": "application/json",
  };

  const payload = {
    q: query,
  };

  try {
    const response = await fetch(serperUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      console.log("Serper API rate limit exceeded. Please try again later.");
      return {
        title: query,
        imageUrls: [],
      };
    }

    if (!response.ok) {
      console.error(
        `Serper API error: ${response.status} ${response.statusText}`
      );
      return {
        title: query,
        imageUrls: [],
      };
    }

    const data = (await response.json()) as any;

    // Parse all images from the images array (up to 10)
    const images = data.images || [];
    const imageUrls = images
      .slice(0, 10)
      .map((img: any) => img?.imageUrl)
      .filter((url: string | undefined) => url != null);

    return {
      title: query,
      imageUrls: imageUrls,
    };
  } catch (error) {
    console.error(
      `Error fetching image from Serper API for "${query}":`,
      error
    );
    return {
      title: query,
      imageUrls: [],
    };
  }
}

/**
 * Tests if an image URL works through the proxy endpoint
 * @param imageUrl - The image URL to test
 * @returns true if the proxy returns 200, false otherwise
 */
async function testProxyImage(imageUrl: string): Promise<boolean> {
  try {
    const backendUrl = process.env.BACKENDURL || "http://localhost:8080";
    const proxyUrl = `${backendUrl}/api/proxy-image?url=${encodeURIComponent(
      imageUrl
    )}`;

    const response = await fetch(proxyUrl, {
      method: "GET",
    });

    // Check status - 502 means Bad Gateway (proxy failed), 200 means success
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Finds the first working image from an array of image URLs by testing each through the proxy
 * @param imageUrls - Array of image URLs to test
 * @param cardName - Name of the card (for error logging)
 * @returns The first working image URL, or null if all fail
 */
async function findWorkingImage(
  imageUrls: string[],
  cardName: string
): Promise<string | null> {
  for (const imageUrl of imageUrls) {
    const works = await testProxyImage(imageUrl);
    if (works) {
      return imageUrl;
    }
  }

  // All images failed
  console.error(
    `Proxy unsuccessful for all ${imageUrls.length} images for "${cardName}"`
  );
  return null;
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
  console.log("!!finished calling openrouter, now calling serper");
  let coverImage = "";
  try {
    const themeResult = await getSerperImage(parsedData.theme);
    if (themeResult.imageUrls.length > 0) {
      const workingImage = await findWorkingImage(
        themeResult.imageUrls,
        `theme: ${parsedData.theme}`
      );
      coverImage = workingImage || "";
    }
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
      // Append theme to card query for better image results
      const cardQuery = `${card.name} ${parsedData.theme}`;
      const cardResult = await getSerperImage(cardQuery);
      if (cardResult.imageUrls.length > 0) {
        const workingImage = await findWorkingImage(
          cardResult.imageUrls,
          card.name
        );
        picture = workingImage || "doesNotExistOnSerper";
      } else {
        picture = "doesNotExistOnSerper";
      }
    } catch (error) {
      console.error(`Failed to get image for card "${card.name}":`, error);
      picture = "cardNotFound";
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

export async function getCustomSetPrompt(themeInput: string): Promise<string> {
  // Validate and trim input
  const trimmedInput = themeInput.trim();
  if (!trimmedInput || trimmedInput.length === 0) {
    throw new Error("Theme input is required");
  }
  if (trimmedInput.length > 200) {
    throw new Error("Theme input is too long (max 200 characters)");
  }

  // Generate custom prompt based on user input
  const customPrompt = generateCustomSetPrompt(trimmedInput);
  return customPrompt;
}

export async function createCustomSet(themeInput: string): Promise<Set> {
  // Validate and trim input
  const trimmedInput = themeInput.trim();
  if (!trimmedInput || trimmedInput.length === 0) {
    throw new Error("Theme input is required");
  }
  if (trimmedInput.length > 200) {
    throw new Error("Theme input is too long (max 200 characters)");
  }

  // Generate custom prompt based on user input
  const customPrompt = generateCustomSetPrompt(trimmedInput);

  // Use the same flow as createRandomSet but with custom prompt and customSets collection
  const result = await callOpenRouter(customPrompt);
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
    await createDocumentWithId("customSets", setObject.name, setObject);
    console.log("Custom set created:", setObject);
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

export async function getAllCustomSets(): Promise<Set[]> {
  try {
    const snapshot = await db.collection("customSets").get();
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

// controllers.ts (REPLACEMENT)

export async function requestTrade(
  userUID: string,
  sentUserUID: string,
  wantedCard: Card,
  givenCard: Card
): Promise<void> {
  const tradeId = uuidv4();
  const date = new Date();

  // 1. Wrap all database operations in a Transaction
  await db.runTransaction(async (transaction: any) => {
    // Define Document References
    const userRef = db.collection("users").doc(userUID);
    const sentUserRef = db.collection("users").doc(sentUserUID);

    // 2. Read Documents ATOMICALLY within the transaction
    const [userDoc, sentUserDoc] = await Promise.all([
      transaction.get(userRef),
      transaction.get(sentUserRef),
    ]);

    if (!userDoc.exists) throw new Error("Requesting User not found");
    if (!sentUserDoc.exists) throw new Error("Recipient User not found");

    const userData = userDoc.data() as userData;
    const sentUserData = sentUserDoc.data() as userData;

    // 3. Validation and Trade Object Creation
    const pendingSentTrades = (userData.sentTrade || []).filter(
      (t) => t.status === "pending"
    );
    const hasUsedCard = pendingSentTrades.some(
      (t) => t.givenCard.name === givenCard.name
    );
    if (hasUsedCard) {
      throw new Error("Card is already in use for another trade");
    }

    // Trade object for the SENDER (userUID)
    const sendTrade: otherUser = {
      type: "send",
      tradeId: tradeId,
      otherUserUID: sentUserUID,
      wantedCard: wantedCard,
      givenCard: givenCard,
      status: "pending",
      date: date,
    };

    // Trade object for the RECIPIENT (sentUserUID)
    const requestTrade: otherUser = {
      type: "request",
      tradeId: tradeId,
      otherUserUID: userUID,
      wantedCard: wantedCard,
      givenCard: givenCard,
      status: "pending",
      date: date,
    };

    // 4. Modify Data in Memory
    const newSentTrades = [...(userData.sentTrade || []), sendTrade];
    const newReqTrades = [...(sentUserData.requestedTrade || []), requestTrade];

    // 5. Perform Atomic Writes
    // If either of these fails, the entire transaction is rolled back.
    transaction.update(userRef, { sentTrade: newSentTrades });
    transaction.update(sentUserRef, { requestedTrade: newReqTrades });
  });
}

export async function respondTrade(
  userUID: string,
  response: MyResponse,
  tradeId: string
): Promise<void> {
  await db.runTransaction(async (transaction: any) => {
    // 1. Get User A's (Recipient/Responder) data
    const userRef = db.collection("users").doc(userUID);
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) throw new Error("Responder User document not found.");
    const userData = userDoc.data() as userData;

    // 2. Locate the requested trade in the responder's data
    const userTradeIndex = (userData.requestedTrade || []).findIndex(
      (t) => t.tradeId === tradeId && t.status === "pending"
    );

    if (userTradeIndex === -1) {
      // This is the error you were hitting, now safely inside the transaction
      throw new Error(
        "Trade not found or already processed (no longer pending)."
      );
    }
    if (!userData.requestedTrade) throw Error("Not Found");
    const userTrade = userData.requestedTrade[userTradeIndex];
    const reqUserUID = userTrade.otherUserUID; // The sender's UID

    // 3. Get User B's (Sender/Requester) data
    const reqUserRef = db.collection("users").doc(reqUserUID);
    const reqUserDoc = await transaction.get(reqUserRef);
    if (!reqUserDoc.exists)
      throw new Error("Requester User document not found.");
    const reqUserData = reqUserDoc.data() as userData;

    // 4. Locate the corresponding sent trade in the sender's data
    const reqUserTradeIndex = (reqUserData.sentTrade || []).findIndex(
      (t) => t.tradeId === tradeId && t.status === "pending"
    );

    // Safety check, though the recipient should always have it if the request was valid
    if (reqUserTradeIndex === -1) {
      throw new Error("Corresponding sent trade not found for requester.");
    }

    if (!reqUserData.sentTrade) throw Error("Sent Trade not found");
    const reqUserTrade = reqUserData.sentTrade[reqUserTradeIndex];

    // --- 5. Card Swapping & Trade Status Update ---
    let newUserDataCards = [...(userData.cards || [])];
    let newReqUserDataCards = [...(reqUserData.cards || [])];

    let tradeStatus: Status = response === "accepted" ? "accepted" : "rejected";

    if (tradeStatus === "accepted") {
      // User A (Responder) card swap
      // From responder's perspective: wantedCard is what the requester wants (responder gives this)
      // and givenCard is what the requester gives (responder receives this)
      const cardToGiveIndexA = newUserDataCards.findIndex(
        (c) => c.name === userTrade.wantedCard.name
      );
      if (cardToGiveIndexA === -1) {
        throw new Error(
          `Responder User ${userUID} does not have card to give: ${userTrade.wantedCard.name}`
        );
      }
      newUserDataCards.splice(cardToGiveIndexA, 1); // Give away what requester wants
      newUserDataCards.push(userTrade.givenCard); // Receive what requester gives

      // User B (Requester) card swap
      // Requester gives givenCard and receives wantedCard
      const cardToGiveIndexB = newReqUserDataCards.findIndex(
        (c) => c.name === reqUserTrade.givenCard.name
      );
      if (cardToGiveIndexB === -1) {
        throw new Error(
          `Requester User ${reqUserUID} does not have card to give: ${reqUserTrade.givenCard.name}`
        );
      }
      newReqUserDataCards.splice(cardToGiveIndexB, 1); // Give away
      newReqUserDataCards.push(reqUserTrade.wantedCard); // Receive
    }

    // --- 6. Prepare for Atomic Writes (Remove the processed trade) ---

    // Filter out the processed trade (regardless of accepted/rejected)
    const newRequestedTrade = (userData.requestedTrade || []).filter(
      (t) => t.tradeId !== tradeId
    );

    const newSentTrade = (reqUserData.sentTrade || []).filter(
      (t) => t.tradeId !== tradeId
    );

    // 7. Perform Atomic Writes

    // Update Responder (User A)
    transaction.update(userRef, {
      cards: newUserDataCards,
      requestedTrade: newRequestedTrade,
    });

    // Update Requester (User B)
    transaction.update(reqUserRef, {
      cards: newReqUserDataCards,
      sentTrade: newSentTrade,
    });
  });
}

// NOTE: You can now delete the getReqUserData function as it is no longer needed.

export async function getReqUserData(
  data: userData | null,
  tradeId: string
): Promise<userData | null> {
  if (!data) return null;

  const reqUser = (data.requestedTrade as otherUser[]).find(
    (u) => u.tradeId === tradeId
  );

  if (!reqUser?.otherUserUID) return null;

  try {
    const reqUserDoc = await db
      .collection("users")
      .doc(reqUser.otherUserUID)
      .get();

    const reqUserData = reqUserDoc.data();

    return {
      UID: reqUser.otherUserUID,
      username: reqUserData?.username || "",
      email: reqUserData?.email || "",
      createdAt: reqUserData?.createdAt || "",
      level: reqUserData?.level || 0,
      cards: reqUserData?.cards || [],
      favoriteCards: reqUserData?.favoriteCards || [],
      sentTrade: reqUserData?.sentTrade || [],
      requestedTrade: reqUserData?.requestedTrade || [],
    };
  } catch {
    return null;
  }
}
