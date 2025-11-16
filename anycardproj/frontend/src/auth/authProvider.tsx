import { User } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
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
  const { toast } = useToast();

  useEffect(() => {
    auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        setUser({ user: userAuth });
        toast({
          title: `Welcome ${userAuth.displayName}`,
          description: "You have successfully signed in.",
        });
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
