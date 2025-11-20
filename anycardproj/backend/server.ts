import path from "path";
import express, { Express } from "express";
import cors from "cors";
import { WeatherResponse, newUser, userData } from "@full-stack/types";
import fetch from "node-fetch";

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
      level: data?.Level || 0,
      cards: data?.Cards || [],
      favoriteCards: data?.FavoriteCards || [],
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

app.listen(port, hostname, () => {
  console.log("Listening");
});
