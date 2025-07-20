import React, { useEffect, useState } from "react";
import axios from "axios";

function UserPage() {
  const [userData, setUserData] = useState(null);
  const [goal, setGoal] = useState(0);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const token = localStorage.getItem("token");
      console.log("📡 Sending Token:", token);  // Debugging log

      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ User Data Fetched:", response.data);
      setUserData(response.data);
    } catch (error) {
      console.error("❌ Error fetching user data:", error.response?.data || error.message);
    }
}


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      {userData ? (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold">Hello, {userData.name}!</h2>
          <p>Email: {userData.email}</p>
          <p>Mobile: {userData.mobile}</p>
          <p>Location: {userData.location}</p>
          <p>Age: {userData.age}</p>
          <p>Role: {userData.role}</p>

          <h3 className="mt-6 font-semibold">Set Your CO₂ Reduction Goal:</h3>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Enter reduction target in kg"
          />
          <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">Save Goal</button>

          <h3 className="mt-6 font-semibold">Theme Preference:</h3>
          <select className="border p-2 rounded w-full" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
          <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded">Save Preferences</button>
        </div>
      ) : (
        <p className="text-red-500">❌ Failed to load user data.</p>
      )}
    </div>
  );
}

export default UserPage;
