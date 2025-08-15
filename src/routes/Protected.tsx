import { ReactNode, useContext } from "react";
import { Navigate } from "react-router";
import { Context } from "../context/AuthContext";
const Protected = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(Context);

  if (!user || user.emailVerified === false) {
    return <Navigate to="/login" replace />;
  } else {
    return children;
  }
};

export default Protected;
