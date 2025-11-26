import cors from "cors";
import express, { Express } from "express";
import router from "./routers";

var admin = require("firebase-admin");
var serviceAccount = require("../secrets/ACFire.json");

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use(router);

// Export for Vercel
export default app;
