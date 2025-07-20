import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserPage from "./pages/UserPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./pages/Navbar";
import axios from "axios";
import CO2Calculator from "./pages/CO2Calculator";
import Logout from "./pages/Logout";




function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const userRole = localStorage.getItem("role");

  const handleRegister = async (formData) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful! Please login.");
      window.location.href = "/login"; // Redirect to login page
    } catch (err) {
      console.error("❌ Registration Error:", err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
  {/* Home (Protected) */}
  <Route path="/" element={authToken ? <Home /> : <Navigate to="/login" />} />

  {/* Main Authenticated Pages */}
  <Route path="/dashboard" element={authToken ? <Dashboard /> : <Navigate to="/login" />} />
  <Route path="/user" element={authToken ? <UserPage /> : <Navigate to="/login" />} />
  <Route path="/co2-calculator" element={authToken ? <CO2Calculator /> : <Navigate to="/login" />} />

  // In your App.js or Routes setup:
<Route path="/logout" element={<Logout />} />

  {/* Auth Routes */}
  <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
  <Route path="/register" element={<Register handleRegister={handleRegister} />} />

  {/* Admin Route */}
  <Route
    path="/admin"
    element={authToken && userRole === "admin" ? <Dashboard /> : <Navigate to="/" />}
  />

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>

    </Router>
  );
}

export default App;