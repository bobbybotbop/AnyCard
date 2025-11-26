import admin from "firebase-admin";
import serviceAccount from "./secrets/";

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
