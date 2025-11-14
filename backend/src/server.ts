import express, { Application, Request, Response } from "express";
import userRoute from "./routes/index";
// import externalRoute from "./routes/index.ts";

const app: Application = express();
const cors = require("cors");
const hostname = "0.0.0.0";
const port = 3000;

// middleware for cors procedure
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Mount routes for user routes
app.use("/api/users", userRoute);

// Mount routes for other depedencies our project lies on
// such as generating random card packs for the user
// app.use("api/external", externalRoute);
