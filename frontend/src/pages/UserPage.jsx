import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle, FaCheckCircle, FaRegMoon, FaRegSun, FaBullseye } from "react-icons/fa";

function UserPage() {
  const [userData, setUserData] = useState(null);
  const [goal, setGoal] = useState("");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Apply theme to document
  const applyTheme = (themeValue) => {
    if (themeValue === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.remove("dark");
    }
  };

  useEffect(() => {
    fetchUserData();
    // Load theme from localStorage if present
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  async function fetchUserData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }
      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setGoal(response.data.co2_goal || "");
      if (response.data.theme) {
        setTheme(response.data.theme);
        applyTheme(response.data.theme);
        localStorage.setItem("theme", response.data.theme);
      }
      setLoading(false);
    } catch (error) {
      setError("Failed to load profile data. " + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  }

  const handleSaveGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/auth/save-goal",
        { goal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(`Goal of ${goal} kg reduction saved!`);
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch {
      setError("Failed to save CO₂ goal.");
    }
  };

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/auth/save-theme",
        { theme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(`Theme preference saved: ${theme}`);
      setTimeout(() => setSuccessMsg(""), 2000);
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    } catch {
      setError("Failed to save theme preference.");
    }
  };

  if (loading) return <div className="container mx-auto p-6">Loading user data...</div>;

  return (
    <div className={`container mx-auto p-6 max-w-xl ${theme === "dark" ? "bg-gray-900 text-white" : ""}`}>
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-xl p-8 transition-colors duration-500">

        <FaUserCircle className="text-6xl text-green-500 mb-2" />
        <h1 className="text-3xl font-bold mb-2">User Profile</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMsg && (
          <p className="text-green-600 mb-4 flex items-center justify-center">
            <FaCheckCircle className="mr-2" /> {successMsg}
          </p>
        )}
        {userData ? (
          <>
            <div className="w-full text-center mb-4">
              <h2 className="text-xl font-semibold">Hello, {userData.name}!</h2>
              <p className="mt-2">Email: <span className="font-mono">{userData.email}</span></p>
              <p className="mt-1">Mobile: <span className="font-mono">{userData.mobile}</span></p>
              <p className="mt-1">Location: <span className="font-mono">{userData.location}</span></p>
              <p className="mt-1">Age: <span className="font-mono">{userData.age}</span></p>
              <p className="mt-1">Role: <span className="font-mono">{userData.role}</span></p>
            </div>
            <div className="w-full mt-6">
              <h3 className="font-semibold mb-2 flex items-center"><FaBullseye className="mr-2" />Set Your CO₂ Reduction Goal:</h3>
              <div className="flex">
                <input
                  type="number"
                  className="border p-2 rounded-l w-full text-black"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Enter reduction target in kg"
                  min="0"
                />
                <button
                  className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition"
                  onClick={handleSaveGoal}
                  title="Save CO₂ Goal"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="w-full mt-6">
              <h3 className="font-semibold mb-2 flex items-center">
                {theme === "dark" ? <FaRegMoon className="mr-2" /> : <FaRegSun className="mr-2" />}
                Theme Preference:
              </h3>
              <div className="flex items-center">
                <select
                  className="border p-2 rounded-l w-full text-black"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
                <button
                  className="bg-green-500 text-white px-4 rounded-r flex items-center hover:bg-green-600 transition"
                  onClick={handleSavePreferences}
                  title="Save Theme"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-red-500">❌ Failed to load user data.</p>
        )}
      </div>
    </div>
  );
}

export default UserPage;
