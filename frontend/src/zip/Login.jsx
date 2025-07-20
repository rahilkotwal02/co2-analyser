import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login({ setAuthToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role); // Store role for protected routes
      setAuthToken(response.data.token);

      alert("Login Successful!");
      window.location.href = "/dashboard"; // Redirect to dashboard after login
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      
      <input type="email" placeholder="Email" className="border p-2 rounded w-full" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="border p-2 rounded w-full mt-2" onChange={(e) => setPassword(e.target.value)} />
      
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-3" onClick={handleLogin}>Login</button>
      
      <p className="mt-4">
        Don't have an account? <Link to="/register" className="text-blue-500">Register here</Link>
      </p>
    </div>
  );
}

export default Login;