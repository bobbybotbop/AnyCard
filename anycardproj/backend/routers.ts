import express, { Router } from "express";
import * as controllers from "./controllers";

const router: Router = express.Router();

// ============= CARD ROUTES =============

router.post("/api/createCard", async (req, res) => {
  try {
    const result = await controllers.createDocument("cards", req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

// ============= USER ROUTES =============

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
    const result = await controllers.getAllUsers(uid);

    if (!result) {
      res.status(200).json({
        error: "Something happened",
      });
      return;
    }

    res.status(200).json(result);
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

router.get("/api/getAllTrades/:uid", async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: "user not given" });

  try {
    const result = await controllers.getAllTrades(uid);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// ============= WIKIPEDIA ROUTES =============

// router.get("/api/searchWikipedia", async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query || typeof query !== "string") {
//       res.status(400).json({ error: "Query parameter is required" });
//       return;
//     }

//     const result = await controllers.searchWikipedia(query);
//     res.status(200).json(result);
//   } catch (error: any) {
//     return res.status(400).json({ error: error.message });
//   }
// });

// ============= WIKIPEDIA ROUTES =============

// router.get("/api/searchWikipedia", async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query || typeof query !== "string") {
//       res.status(400).json({ error: "Query parameter is required" });
//       return;
//     }

//     const result = await controllers.searchWikipedia(query);
//     res.status(200).json(result);
//   } catch (error: any) {
//     console.error("Error searching Wikipedia:", error);
//     if (error.message === "No results found") {
//       res.status(404).json({ error: error.message });
//     } else if (error.message === "Failed to fetch page summary") {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: "Failed to search Wikipedia" });
//     }
//   }
// });

// ============= OPENROUTER ROUTES =============

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

// ============= CARD SET ROUTES =============

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

  try {
    const result = await controllers.openPack(
      userUid,
      packId,
      collection || "dailyPacks"
    );
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("openPack failed:", err);
    if (err.message === "Pack not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Pack has no cards configured") {
      return res.status(400).json({ error: err.message });
    }
    return res
      .status(500)
      .json({ error: err.message || "Failed to open pack" });
  }
});

router.post("/api/createCustomSet", async (req, res) => {
  try {
    const { themeInput } = req.body;

    if (!themeInput || typeof themeInput !== "string") {
      res.status(400).json({ error: "themeInput parameter is required" });
      return;
    }

    const result = await controllers.createCustomSet(themeInput);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in createCustomSet", error);
    if (error.message === "No results found") {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("API key not configured")) {
      res.status(500).json({ error: error.message });
    } else if (
      error.message.includes("Theme input is required") ||
      error.message.includes("Theme input is too long")
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to create custom set" });
    }
  }
});

router.get("/api/getAllCustomSets", async (req, res) => {
  try {
    const result = await controllers.getAllCustomSets();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getAllCustomSets", error);
    res.status(500).json({ error: "Failed to get custom sets" });
  }
});

// router.post("/api/openDailyPack/:userUid", async (req, res) => {
//   const { userUid } = req.params;
//   const { dailyPackId } = req.body || {};

//   if (!dailyPackId || typeof dailyPackId !== "string") {
//     return res.status(400).json({ error: "dailyPackId required" });
//   }

//   if (!userUid || typeof userUid !== "string") {
//     return res.status(400).json({ error: "userUid required" });
//   }

//   try {
//     const result = await controllers.openDailyPack(userUid, dailyPackId);
//     return res.status(200).json(result);
//   } catch (err: any) {
//     console.error("openDailyPack failed:", err);
//     if (err.message === "Pack not found") {
//       return res.status(404).json({ error: err.message });
//     }
//     return res
//       .status(500)
//       .json({ error: err.message || "Failed to open pack" });
//   }
// });

// ============= IMAGE PROXY ROUTES =============

router.get("/api/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: "URL parameter required" });
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return res
        .status(400)
        .json({ error: "Only HTTP and HTTPS URLs are allowed" });
    }

    try {
      // Determine appropriate referer based on the domain
      let referer = url.origin; // Default to the image's origin

      if (
        url.hostname.includes("wikia.nocookie.net") ||
        url.hostname.includes("fandom.com")
      ) {
        // For Wikia/Fandom: extract wiki name from path
        // URL format: https://static.wikia.nocookie.net/clashroyale/images/...
        const pathParts = url.pathname.split("/").filter((p) => p);
        if (pathParts.length > 0) {
          const wikiName = pathParts[0];
          referer = `https://${wikiName}.fandom.com/`;
        } else {
          referer = "https://www.fandom.com/";
        }
        // } else if (url.hostname.includes("wikipedia.org")) {
        //   referer = `https://${url.hostname}/`;
        // } else if (url.hostname.includes("wikimedia.org")) {
        //   referer = "https://www.wikipedia.org/";
        // } else {
      } else {
        // For other domains, use the origin as referer
        referer = url.origin + "/";
      }

      // Build headers with more complete browser-like headers
      const headers: Record<string, string> = {
        Referer: referer,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      };

      const response = await fetch(imageUrl, {
        headers,
        // Add redirect handling
        redirect: "follow",
      });

      if (!response.ok) {
        // Log more details for debugging
        console.error(`Image proxy failed for ${imageUrl}:`, {
          status: response.status,
          statusText: response.statusText,
          referer: referer,
        });
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/png";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
      res.send(Buffer.from(imageBuffer));
    } catch (error: any) {
      console.error("Error proxying image:", error);
      // Return a more informative error
      if (error.message.includes("Failed to fetch image")) {
        res.status(502).json({
          error: "Failed to fetch image from source",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Failed to proxy image" });
      }
    }
  } catch (error: any) {
    console.error("Error in proxy-image route:", error);
    res.status(500).json({ error: "Failed to process image proxy request" });
  }
});

router.post("/api/requestTrade/:userUID", async (req, res) => {
  const { userUID } = req.params;
  const { sentUserUID, wantedCard, givenCard } = req.body;

  console.log(sentUserUID);
  console.log(wantedCard);
  console.log(givenCard);
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
  const { response, tradeId } = req.body;

  if (!userUID) {
    return res.status(400).json({ error: "userUid required" });
  }

  if (!response || !tradeId) {
    return res.status(400).json({ error: "invalid body" });
  }

  try {
    const result = await controllers.respondTrade(userUID, response, tradeId);
    return result;
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
