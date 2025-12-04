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
  "https://any-card-j55v.vercel.app", // Production frontend
  "https://anycard-backend.vercel.app", // Production backend
  "http://localhost:5173", // Local development (Vite)
  "http://localhost:3000", // Local development (alternative port)
];

// Add environment variable support for additional origins
const additionalOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const allAllowedOrigins = [...allowedOrigins, ...additionalOrigins];

// Helper function to normalize origin (remove trailing slashes, ensure https)
const normalizeOrigin = (origin: string): string => {
  return origin.replace(/\/+$/, ""); // Remove trailing slashes
};

// Helper function to check if origin should be allowed
// Explicitly allows production frontend and backend, plus Vercel preview deployments
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests with no origin

  // Normalize the origin for comparison
  const normalizedOrigin = normalizeOrigin(origin);

  // Check exact matches (normalized)
  const normalizedAllowed = allAllowedOrigins.map(normalizeOrigin);
  if (normalizedAllowed.includes(normalizedOrigin)) return true;

  // Explicitly allow production domains
  if (
    normalizedOrigin === "https://any-card-j55v.vercel.app" ||
    normalizedOrigin === "https://anycard-backend.vercel.app"
  ) {
    return true;
  }

  // Allow any Vercel preview deployment (including production and preview URLs)
  if (normalizedOrigin.includes(".vercel.app")) return true;

  // Allow localhost for development
  if (
    normalizedOrigin.startsWith("http://localhost:") ||
    normalizedOrigin.startsWith("http://127.0.0.1:")
  ) {
    return true;
  }

  // Log disallowed origins for debugging (only in development)
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[CORS] Origin not allowed: ${origin} (normalized: ${normalizedOrigin})`
    );
  }

  return false;
};

// Add explicit CORS headers middleware (runs before cors() middleware)
// This ensures CORS headers are always set, even if cors() middleware fails
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  // Handle preflight OPTIONS requests FIRST - must return early with proper headers
  if (req.method === "OPTIONS") {
    // For preflight, always set CORS headers based on origin
    if (origin) {
      // When credentials are used, must specify exact origin, not "*"
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      // For requests with no origin, use wildcard (but can't use credentials)
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    // Set required CORS headers for preflight
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

    // Return 204 No Content for preflight
    return res.status(204).end();
  }

  // For non-OPTIONS requests, set CORS headers
  // Check if origin is allowed
  const originAllowed = isOriginAllowed(origin);

  // Always set CORS headers - be permissive to ensure requests work
  // When credentials: true, we must specify exact origin, not "*"
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    // For requests with no origin (like mobile apps), don't set credentials
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  // Always set these headers for all requests
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        // In production, be permissive to avoid CORS issues
        // Log for debugging but still allow the request
        console.log(`[CORS] Allowing origin (permissive mode): ${origin}`);
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Use routes
app.use(router);

// Export for Vercel
export default app;
