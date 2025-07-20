import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove JWT and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("theme");
    // Optionally, clear cookies if you use refresh tokens in cookies
    // document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login page
    navigate("/login", { replace: true });
  }, [navigate]);

  return <div className="text-center mt-10 text-xl">Logging out...</div>;
};

export default Logout;
