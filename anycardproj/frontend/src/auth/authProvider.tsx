import { User } from "firebase/auth";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { auth } from "./firebase";

type AuthData = {
  user: User | null;
};

const AuthUserContext = createContext<AuthData>({ user: null });

export const AuthUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AuthData>({ user: null });
  const isInitialMount = useRef(true);

  useEffect(() => {
    auth.onAuthStateChanged(async (userAuth) => {
      // Skip automatic login on initial mount if user is already logged in
      if (isInitialMount.current && userAuth) {
        isInitialMount.current = false;
        return; // Don't set user on initial load if already logged in
      }
      
      // Allow all subsequent auth changes (explicit login/logout)
      isInitialMount.current = false;
      if (userAuth) {
        setUser({ user: userAuth });
      } else {
        setUser({ user: null });
      }
    });
  }, []);

  return (
    <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthUserProvider");
  }
  return context;
};

export default AuthUserProvider;
