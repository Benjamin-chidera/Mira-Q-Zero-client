import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuthStore();

  console.log(user);
  

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
