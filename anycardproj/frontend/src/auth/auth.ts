import { auth } from "./firebase";
import { signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { createUser } from "../api/api";
import { newUser } from "@full-stack/types";

const provider = new GoogleAuthProvider();

// Initialize redirect-based auth on app load
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      // Update database with potential new user
      const createUserParams: newUser = {
        UID: user.uid,
        email: user.email || "",
        username: user.displayName || "",
      };
      await createUser(createUserParams);

      return { token, user };
    }
    return null;
  } catch (error: any) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

export const signin = async () => {
  try {
    // Use redirect instead of popup to avoid COOP issues
    await signInWithRedirect(auth, provider);
    // Note: This will redirect the page, so no return value here
  } catch (error: any) {
    // Re-throw the error so the calling code can handle it
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    // Error handled silently
  }
};
