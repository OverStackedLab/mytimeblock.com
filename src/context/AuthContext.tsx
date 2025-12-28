import { createContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../supabase/config";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { initializeAuth } from "../services/authSlice";

type User = {
  email: string | null | undefined;
  uid: string | undefined;
  displayName: string | null | undefined;
  photoURL: string | null | undefined;
  emailVerified: boolean | undefined;
  isAnonymous: boolean | undefined;
  isAdmin: boolean;
};

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile to get is_admin status
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, display_name, photo_url")
          .eq("id", session.user.id)
          .single();

        setUser({
          email: session.user.email,
          uid: session.user.id,
          displayName: profile?.display_name || null,
          photoURL: profile?.photo_url || null,
          emailVerified: session.user.email_confirmed_at !== null,
          isAnonymous: false,
          isAdmin: profile?.is_admin || false,
        });
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch profile to get is_admin status
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, display_name, photo_url")
          .eq("id", session.user.id)
          .single();

        setUser({
          email: session.user.email,
          uid: session.user.id,
          displayName: profile?.display_name || null,
          photoURL: profile?.photo_url || null,
          emailVerified: session.user.email_confirmed_at !== null,
          isAnonymous: false,
          isAdmin: profile?.is_admin || false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    dispatch(initializeAuth());

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const values: AuthContextType = {
    user,
    setUser,
  };

  return (
    <Context.Provider value={values}>{!loading && children}</Context.Provider>
  );
};

export default AuthContext;
