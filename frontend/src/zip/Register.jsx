import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    location: "",
    age: "",
    role: "user", // Default role is "user"
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful! Please login.");
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Register</h1>
      {error && <p className="text-red-500">{error}</p>}

      <input type="text" name="name" placeholder="Name" className="border p-2 rounded w-full" onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" className="border p-2 rounded w-full mt-2" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" className="border p-2 rounded w-full mt-2" onChange={handleChange} />
      <input type="text" name="mobile" placeholder="Mobile" className="border p-2 rounded w-full mt-2" onChange={handleChange} />
      <input type="text" name="location" placeholder="Location" className="border p-2 rounded w-full mt-2" onChange={handleChange} />
      <input type="number" name="age" placeholder="Age" className="border p-2 rounded w-full mt-2" onChange={handleChange} />

      <select name="role" className="border p-2 rounded w-full mt-2" onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button className="bg-green-500 text-white px-4 py-2 rounded mt-3" onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;