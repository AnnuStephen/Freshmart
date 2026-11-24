
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <h4 className="text-center mt-5">Loading...</h4>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_staff) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
