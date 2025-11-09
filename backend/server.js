import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// Define a basic route
app.get("/", (req, res) => {
  res.send("Hello from Express.js!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
