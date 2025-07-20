import React, { useState } from "react";
import { getRealTimeCO2Data, saveCO2Estimate } from "../services/api";

function CO2Calculator() {
  const [activity, setActivity] = useState("electricity");
  const [value, setValue] = useState(0);
  const [unit, setUnit] = useState("kWh");
  const [co2Result, setCo2Result] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculation = async () => {
    if (value <= 0) {
        alert("Please enter a valid value.");
        return;
    }

    const energyUnit = activity === "electricity" ? "kWh" : activity === "car" ? "km" : "miles";
    setUnit(energyUnit);
    setLoading(true);
    setError(null);

    const requestData = {
        energy: Number(value),
        energy_unit: energyUnit,
        activity_type: activity
    };

    console.log("📡 Sending Request Data:", requestData);

    try {
        const data = await getRealTimeCO2Data(requestData.energy, requestData.energy_unit);

        if (data && data.co2e) {
            setCo2Result(data);
            await saveCO2Estimate({
                ...requestData,
                co2e: data.co2e,
                co2e_unit: data.co2e_unit || "kg"
            });
        } else {
            setError("Failed to fetch CO₂ estimate. Response data was invalid.");
            console.error("Invalid API response:", data);
        }
    } catch (err) {
        setError(`Error calculating CO₂ emissions: ${err.response?.data?.error || err.message}`);
        console.error("❌ API Error:", err);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CO₂ Emissions Calculator</h1>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Activity Type</label>
          <select
            className="w-full p-2 border rounded"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          >
            <option value="electricity">Electricity Usage</option>
            <option value="car">Car Travel</option>
            <option value="flight">Air Travel</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            {activity === "electricity" ? "Energy Used (kWh)" : 
             activity === "car" ? "Distance (km)" : "Distance (miles)"}
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="0"
          />
        </div>
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleCalculation}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate CO₂ Emissions"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {co2Result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Results</h2>
          <p className="text-2xl mb-2">
            {co2Result.co2e} {co2Result.co2e_unit || "kg"}
          </p>
          <p>
            Based on {value} {unit} of {activity} activity
          </p>
        </div>
      )}
    </div>
  );
}

export default CO2Calculator;
