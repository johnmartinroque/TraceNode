// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, fallback = "/" }) {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    try {
      const parsedUser = JSON.parse(userInfo);

      // Check token + user exist
      if (parsedUser?.access_token && parsedUser?.user) {
        return children;
      }
    } catch (error) {
      console.error("Invalid userInfo in localStorage");
    }
  }

  return <Navigate to={fallback} replace />;
}

export default ProtectedRoute;
