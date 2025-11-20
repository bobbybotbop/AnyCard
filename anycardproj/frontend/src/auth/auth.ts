import { auth } from "./firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "../auth/authProvider";
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
    console.log(await createUser(createUserParams));
    // console.log(user);

    return { token, user };
  } catch (error: any) {
    const code = error.code;
    const message = error.message;
    const email = error.customData?.email;

    console.log(
      `An error ${code} occurred when logging user with email: ${email} with message: ${message}`
    );
    // Re-throw the error so the calling code can handle it
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.log(error);
  }
};
