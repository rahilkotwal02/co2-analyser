import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

function Home() {
  const [user, setUser] = useState(null);
  const [co2Saved, setCo2Saved] = useState(0);
  const [ecoTips, setEcoTips] = useState([
    "Switch off appliances when not in use to save energy.",
    "Use public transport or cycle to reduce carbon footprint.",
    "Opt for reusable products instead of single-use plastics.",
    "Plant a tree to absorb CO₂ and improve air quality.",
    "Reduce food waste by planning meals efficiently."
  ]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token is found
    } else {
      fetchUserData();
      fetchCO2Data();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      navigate("/login"); // Redirect to login if token is invalid
    } finally {
      setLoading(false);
    }
  };

  const fetchCO2Data = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/co2/latest");
      if (response.data) {
        setCo2Saved(response.data.co2e);
      }
    } catch (error) {
      console.error("❌ Error fetching CO₂ data:", error);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-2xl">Loading...</div>;
  }

  return (
    <motion.div className="container mx-auto p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      {/* Hero Section */}
      <motion.div className="text-center py-16 bg-green-600 text-white rounded-lg shadow-lg" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <h1 className="text-5xl font-extrabold">Welcome {user ? user.name : "to CO₂ Analyzer"}! 🌍</h1>
        <p className="text-lg mt-4">Track, reduce, and analyze your carbon footprint in real time.</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Link to="/co2-calculator" className="bg-blue-500 text-white px-6 py-4 rounded-lg text-center shadow-lg hover:scale-105 transition">
          🌱 Calculate Your CO₂ Footprint
        </Link>
        <Link to="/dashboard" className="bg-green-500 text-white px-6 py-4 rounded-lg text-center shadow-lg hover:scale-105 transition">
          📊 View Dashboard & Analytics
        </Link>
        <Link to="/user" className="bg-purple-500 text-white px-6 py-4 rounded-lg text-center shadow-lg hover:scale-105 transition">
          🏆 Join CO₂ Challenges
        </Link>
      </motion.div>

      {/* CO₂ Reduction Progress */}
      <motion.div className="bg-gray-100 p-6 rounded-lg shadow-lg text-center mt-10" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold">Your CO₂ Reduction Goal</h2>
        <p>You’ve saved <span className="text-green-500 font-bold">{co2Saved} kg</span> of CO₂ emissions!</p>
        <p className="text-gray-600">Set a reduction goal to track your progress.</p>
      </motion.div>

      {/* Eco-Friendly Tips */}
      <motion.div className="mt-6 bg-yellow-100 shadow-lg rounded-lg p-6" whileHover={{ scale: 1.05 }}>
        <h3 className="text-xl font-bold">🌿 Eco Tip of the Day</h3>
        <p>{ecoTips[Math.floor(Math.random() * ecoTips.length)]}</p>
      </motion.div>

      {/* Fun Fact Section */}
      <motion.div className="mt-6 bg-blue-100 shadow-lg rounded-lg p-6" whileHover={{ scale: 1.05 }}>
        <h3 className="text-xl font-bold">🌍 Did You Know?</h3>
        <p>One tree absorbs up to 22 kg of CO₂ per year! Plant a tree today. 🌳</p>
      </motion.div>
    </motion.div>
  );
}

export default Home;