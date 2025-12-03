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
  "https://anycard-backend.vercel.app/",
];

// Add environment variable support for additional origins
const additionalOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const allAllowedOrigins = [...allowedOrigins, ...additionalOrigins];

// Helper function to check if origin should be allowed
// Allows Vercel preview deployments (any *.vercel.app subdomain)
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests with no origin

  // Check exact matches
  if (allAllowedOrigins.includes(origin)) return true;

  // Allow any Vercel preview deployment
  if (origin.includes(".vercel.app")) return true;

  // Allow localhost for development
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:")
  ) {
    return true;
  }

  return false;
};

// Add explicit CORS headers middleware (runs before cors() middleware)
// This ensures CORS headers are always set, even if cors() middleware fails
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  // When credentials: true, we must specify exact origin, not "*"
  if (isOriginAllowed(origin) && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    // For requests with no origin (like mobile apps), don't set credentials
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  // If origin is not allowed, don't set CORS headers (will be blocked)

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
