import { createContext, useState, useEffect, type ReactNode } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const Context = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

type AuthContextProps = {
  children: ReactNode;
};

const AuthContext = ({ children }: AuthContextProps) => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth]);

  const values: AuthContextType = {
    user,
    setUser,
  };

  return (
    <Context.Provider value={values}>{!loading && children}</Context.Provider>
  );
};

export default AuthContext;
