const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "secrets/ACFire.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const encoded = Buffer.from(JSON.stringify(config)).toString("base64");

console.log("\n=== Encoded Firebase Config (Base64) ===");
console.log(encoded);
console.log(
  "\n=== Copy this value to Vercel environment variable: FIREBASE_SERVICE_ACCOUNT ===\n"
);

