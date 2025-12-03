import cors from "cors";
import express, { Express } from "express";
import router from "./routers";

var admin = require("firebase-admin");

// Get service account from environment variable or fallback to file
let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Decode from base64 string (for Vercel)
  const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
  serviceAccount = JSON.parse(decoded);
} else {
  // Fallback to file (for local development)
  serviceAccount = require("./secrets/ACFire.json");
}

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
