import cors from "cors";
import express, { Express } from "express";
import router from "./routers";

var admin = require("firebase-admin");

// Get service account from environment variable or fallback to file
let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Decode from base64 string (for Vercel)
  const decoded = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    "base64"
  ).toString("utf8");
  serviceAccount = JSON.parse(decoded);
} else {
  // Fallback to file (for local development)
  serviceAccount = require("../secrets/ACFire.json");
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
// Configure CORS to allow production frontend and local development
const allowedOrigins = [
  "https://any-card-j55v.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Add environment variable support for additional origins
const additionalOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const allAllowedOrigins = [...allowedOrigins, ...additionalOrigins];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allAllowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // In production, be more restrictive
        // For now, allow all origins to ensure compatibility
        // TODO: Restrict to only allowed origins in production
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Use routes
app.use(router);

// Export for Vercel
export default app;
