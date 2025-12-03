import { User } from "firebase/auth";
import { createContext, useContext, useState } from "react";

type AuthData = {
  user: User | null;
};

const AuthUserContext = createContext<AuthData>({ user: null });

export const AuthUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, _setUser] = useState<AuthData>({ user: null });

  // Commented out automatic login if already logged in
  // useEffect(() => {
  //   auth.onAuthStateChanged(async (userAuth) => {
  //     if (userAuth) {
  //       setUser({ user: userAuth });
  //     } else {
  //       setUser({ user: null });
  //     }
  //   });
  // }, []);

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
