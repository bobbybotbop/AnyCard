import express, { Router } from "express";
import * as controllers from "./controllers";

const router: Router = express.Router();

router.post("/api/createCard", async (req, res) => {
  try {
    const result = await controllers.createDocument("cards", req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

router.post("/api/createUser", async (req, res) => {
  try {
    const result = await controllers.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/api/getUserData/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = await controllers.getUserData(uid);
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

router.get("/api/getAllUsers/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const users = await controllers.getAllUsers(uid);

    if (!users) {
      res.status(200).json({
        error: "Something happened",
      });
      return;
    }

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch all users" });
  }
});

router.get("/api/getUserInventory/:userUid", async (req, res) => {
  const { userUid } = req.params;
  if (!userUid) return res.status(400).json({ error: "user not given" });

  try {
    const userdata = await controllers.getUserData(userUid);
    if (!userdata) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    return res.status(200).json({ cards: userdata.cards });
  } catch {
    return res.status(400).json({ error: "Invalid user" });
  }
});

// ============= WIKIPEDIA ROUTES =============

router.get("/api/searchWikipedia", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query parameter is required" });
      return;
    }

    const result = await controllers.searchWikipedia(query);
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

router.post("/api/openrouter", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Input parameter is required" });
      return;
    }

    const result = await controllers.callOpenRouter(input);
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

router.post("/api/createRandomSet", async (req, res) => {
  try {
    const result = await controllers.createRandomSet();
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

router.post("/api/createDailyPacks", async (req, res) => {
  try {
    const result = await controllers.createThreeRandomSets();
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

router.get("/api/getDailyPacks", async (req, res) => {
  try {
    const result = await controllers.getDailyPacks();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getDailyPacks", error);
    res.status(500).json({ error: "Failed to get daily packs" });
  }
});

router.get("/api/getAllSets", async (req, res) => {
  try {
    const result = await controllers.getAllSets();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getAllSets", error);
    res.status(500).json({ error: "Failed to get all sets" });
  }
});

router.post("/api/openPack/:userUid", async (req, res) => {
  const { userUid } = req.params;
  const { packId, collection } = req.body || {};

  if (!packId || typeof packId !== "string") {
    return res.status(400).json({ error: "packId required" });
  }

  if (!userUid || typeof userUid !== "string") {
    return res.status(400).json({ error: "userUid required" });
  }

  const collectionName = collection || "dailyPacks";

  try {
    const result = await controllers.openPack(userUid, packId, collectionName);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("openPack failed:", err);
    if (err.message === "Pack not found") {
      return res.status(404).json({ error: err.message });
    }
    return res
      .status(500)
      .json({ error: err.message || "Failed to open pack" });
  }
});

router.post("/api/saveFavoriteCard/:userUid", async (req, res) => {
  const { userUid } = req.params;
  const { card } = req.body;

  if (!userUid || !card) {
    return res.status(404).json({ error: "Invalid input" });
  }

  try {
    const result = await controllers.saveFavoritePack(userUid, card);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: "Failed to successfuly save card" });
  }
});

router.post("/api/requestTrade/:userUID", async (req, res) => {
  const { userUID } = req.params;
  const { sentUserUID, wantedCard, givenCard } = req.body;

  if (!userUID) {
    return res.status(400).json({ error: "userUid required" });
  }

  if (!sentUserUID || !wantedCard || !givenCard) {
    return res.status(400).json({ error: "invalid body" });
  }

  try {
    await controllers.requestTrade(userUID, sentUserUID, wantedCard, givenCard);

    return res.status(200).json({
      message: "Trade successfully started",
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete("/api/respondTrade/:userUID", async (req, res) => {
  const { userUID } = req.params;
  const { tradeId, response } = req.body;

  if (!userUID) {
    return res.status(400).json({ error: "userUid required" });
  }

  if (!response || !tradeId) {
    return res.status(400).json({ error: "invalid body" });
  }

  try {
    await controllers.respondTrade(userUID, response, tradeId);
    return res.status(200).json({
      message: response,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
