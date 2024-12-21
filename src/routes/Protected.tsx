import { Navigate } from "react-router";
import { ReactNode, useContext } from "react";
import { Context } from "../context/AuthContext";
const Protected = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(Context);

  if (!user) {
    return <Navigate to="/" replace />;
  } else {
    return children;
  }
};

export default Protected;
