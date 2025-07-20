import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useCarbonFootprint } from "react-carbon-footprint";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function Home() {
  const [user, setUser] = useState(null);
  const [co2Saved, setCo2Saved] = useState(0);
  const [ecoTips] = useState([
    "Switch off appliances when not in use to save energy.",
    "Use public transport or cycle to reduce carbon footprint.",
    "Opt for reusable products instead of single-use plastics.",
    "Plant a tree to absorb CO₂ and improve air quality.",
    "Reduce food waste by planning meals efficiently."
  ]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [emissionStats, setEmissionStats] = useState(null);
  const [gCO2, bytesTransferred] = useCarbonFootprint();

  // For animated counter
  const [displayedCO2, setDisplayedCO2] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchUserData();
      fetchCO2Data();
      fetchStats();
    }
  }, []);

  // Animate CO₂ counter
  useEffect(() => {
    let start = 0;
    if (co2Saved > 0) {
      const step = Math.ceil(co2Saved / 40);
      const interval = setInterval(() => {
        start += step;
        if (start >= co2Saved) {
          setDisplayedCO2(co2Saved);
          clearInterval(interval);
        } else {
          setDisplayedCO2(start);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedCO2(0);
    }
  }, [co2Saved]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      navigate("/login");
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get("http://localhost:5000/api/co2/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmissionStats(response.data);
      }
    } catch {}
  };

  // Eco tip of the day (rotates daily)
  const todayTip = ecoTips[new Date().getDate() % ecoTips.length];

  // Progress Bar toward a goal (e.g. 500 kg)
  const goal = 500;
  const progress = Math.min((co2Saved / goal) * 100, 100);

  // Pie chart breakdown
  const COLORS = ["#10B981", "#3B82F6", "#F59E42", "#EF4444", "#A78BFA"];
  const breakdown = emissionStats?.breakdown?.map((item, idx) => ({
    name: item.activity_type.charAt(0).toUpperCase() + item.activity_type.slice(1),
    value: parseFloat(item.total),
    color: COLORS[idx % COLORS.length]
  }));

  // Social share handler
  const handleShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=I've saved ${co2Saved}kg CO₂ with CO₂ Analyzer! 🌱`,
      "_blank"
    );
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
        <p>
          You’ve saved{" "}
          <span className="text-green-500 font-bold text-3xl transition-all duration-500">
            <AnimatePresence>
              {displayedCO2}
            </AnimatePresence>
          </span>{" "}
          kg of CO₂ emissions!
        </p>
        <p className="text-gray-600">Set a reduction goal to track your progress.</p>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4 mb-2">
          <div className="bg-green-500 h-4 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p>{co2Saved} / {goal} kg CO₂ saved</p>
        {progress === 100 && <p className="text-green-600 font-bold">Goal achieved! Set a new one!</p>}
        {/* Social Share Button */}
        <button
          onClick={handleShare}
          className="bg-blue-400 text-white px-4 py-2 rounded mt-4 shadow hover:bg-blue-500"
        >
          📤 Share My Progress
        </button>
      </motion.div>

      {/* Emission Stats Card */}
      {emissionStats && (
        <motion.div className="bg-white shadow-lg rounded-lg p-6 mt-6 text-center" whileHover={{ scale: 1.03 }}>
          <h3 className="text-xl font-bold mb-2">📈 Your Emission Stats</h3>
          <p>Total: <span className="font-bold text-green-700">{emissionStats.total_emissions?.toFixed(2) || 0} kg</span></p>
          <p>Average: <span className="font-bold">{emissionStats.avg_emissions?.toFixed(2) || 0} kg</span></p>
          <p>Max: <span className="font-bold">{emissionStats.max_emissions?.toFixed(2) || 0} kg</span></p>
          <p>Records: <span className="font-bold">{emissionStats.count || 0}</span></p>
        </motion.div>
      )}

      {/* Personal Best/Badge Section */}
      {emissionStats && emissionStats.count > 0 && (
        <motion.div className="bg-purple-100 shadow-lg rounded-lg p-6 mt-6 text-center" whileHover={{ scale: 1.04 }}>
          <h3 className="text-xl font-bold mb-2">🏅 Personal Best</h3>
          <p>
            Your lowest single emission: <span className="text-green-700 font-bold">
              {emissionStats.min_emissions?.toFixed(2) || 0} kg
            </span>
          </p>
          <p>
            {emissionStats.total_emissions > 1000
              ? "🌟 You've saved over 1 ton of CO₂! Incredible!"
              : emissionStats.total_emissions > 100
              ? "🎉 Over 100 kg saved! Keep going!"
              : "Every kg counts. You're making a difference!"}
          </p>
        </motion.div>
      )}

      {/* Pie Chart Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <motion.div className="bg-white shadow-lg rounded-lg p-6 mt-6 text-center" whileHover={{ scale: 1.03 }}>
          <h3 className="text-xl font-bold mb-4">🔍 Emissions Breakdown by Activity</h3>
          <PieChart width={320} height={220}>
            <Pie
              data={breakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {breakdown.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </motion.div>
      )}

      {/* Eco-Friendly Tips */}
      <motion.div className="mt-6 bg-yellow-100 shadow-lg rounded-lg p-6" whileHover={{ scale: 1.05 }}>
        <h3 className="text-xl font-bold">🌿 Eco Tip of the Day</h3>
        <p>{todayTip}</p>
      </motion.div>

      {/* Fun Fact Section */}
      <motion.div className="mt-6 bg-blue-100 shadow-lg rounded-lg p-6" whileHover={{ scale: 1.05 }}>
        <h3 className="text-xl font-bold">🌍 Did You Know?</h3>
        <p>One tree absorbs up to 22 kg of CO₂ per year! Plant a tree today. 🌳</p>
      </motion.div>

      {/* Network CO₂ Widget */}
      <motion.div className="mt-6 bg-green-100 shadow-lg rounded-lg p-6" whileHover={{ scale: 1.05 }}>
        <h3 className="text-lg font-bold">💻 Your Web Session CO₂</h3>
        <p><strong>Bytes Transferred:</strong> {bytesTransferred} bytes</p>
        <p><strong>CO₂ Emissions:</strong> {gCO2.toFixed(2)} grams</p>
        <p className="text-xs text-gray-600">This is an estimate based on your web usage this session.</p>
      </motion.div>
    </motion.div>
  );
}

export default Home;
