var admin = require("firebase-admin");
var serviceAccount = require("./secrets/ACFire.json");

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export initialized services
var db = admin.firestore();
var auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};
