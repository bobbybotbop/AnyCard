import express, { Express } from "express";
import cors from "cors";
import router from "./routers";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port = 8080;

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
app.use(router);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
