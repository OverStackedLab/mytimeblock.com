import { createContext, useState, useEffect, type ReactNode } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { initializeAuth } from "../services/authSlice";

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
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    dispatch(initializeAuth());

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, dispatch]);

  const values: AuthContextType = {
    user,
    setUser,
  };

  return (
    <Context.Provider value={values}>{!loading && children}</Context.Provider>
  );
};

export default AuthContext;
