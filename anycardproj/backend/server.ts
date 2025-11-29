import express, { Express } from "express";
import cors from "cors";
import router from "./routers";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(router);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
