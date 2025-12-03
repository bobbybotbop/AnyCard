import express, { Express } from "express";
import cors from "cors";
import router from "./routers";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

// Configure CORS with proper headers for OAuth popups
app.use(cors({
  origin: true, // Allow all origins (you can restrict this to your frontend URL in production)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(router);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
