import { auth } from "./firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createUser } from "../api/cards";
import { newUser } from "@full-stack/types";

const provider = new GoogleAuthProvider();

export const signin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;

    //update database with potental new user

    const createUserParams: newUser = {
      UID: user.uid,
      email: user.email || "",
      username: user.displayName || "",
    };
    await createUser(createUserParams);

    return { token, user };
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
