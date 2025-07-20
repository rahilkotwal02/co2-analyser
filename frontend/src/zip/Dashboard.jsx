import React, { useEffect, useState } from "react";
import { getCO2Data, getRealTimeCO2Data, saveCO2Estimate, getFilteredCO2Data } from "../services/api";
import CO2TrendChart from "./CO2TrendChart";
import FilterControls from "./FilterControls";

function Dashboard() {
  const [dbData, setDbData] = useState([]);
  const [realTimeData, setRealTimeData] = useState(null);
  const [energy, setEnergy] = useState(4200);
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    console.log("📡 Fetching CO₂ data...");
    try {
      // ✅ Fetch Database Data (MySQL)
      const dbData = await getCO2Data();
      console.log("✅ Database CO₂ Data:", dbData);
      setDbData(dbData);
    } catch (error) {
      console.error("❌ Error fetching CO₂ data from database:", error);
    }
  }

  const handleCO2Estimate = async () => {
    try {
      console.log("📡 Fetching Real-Time CO₂ Estimate...");
      const newData = await getRealTimeCO2Data(Number(energy), "kWh");
      console.log("✅ API Response:", newData);
      
      if (newData && newData.co2e) {
        setRealTimeData(newData);
        console.log("📤 Saving CO₂ Estimate to Database...");
        
        const savedData = await saveCO2Estimate({
          energy: Number(energy),
          energy_unit: "kWh",
          co2e: newData.co2e,
          co2e_unit: newData.co2e_unit || "kg",
        });
        
        console.log("✅ CO₂ Estimate Saved Successfully", savedData);
        // Refresh data after saving
        fetchData();
      } else {
        console.error("❌ API Response Invalid:", newData);
      }
    } catch (error) {
      console.error("❌ Error fetching or saving CO₂ estimate:", error);
    }
  };

  // New function to handle filter application
  const handleApplyFilters = async (filters) => {
    try {
      if (Object.values(filters).some(val => val !== '')) {
        const filteredData = await getFilteredCO2Data(filters);
        setDbData(filteredData);
        setIsFiltered(true);
      } else {
        // If all filters are empty, fetch all data
        fetchData();
        setIsFiltered(false);
      }
    } catch (error) {
      console.error("❌ Error applying filters:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CO₂ Emissions Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-4">Real-Time CO₂ Estimate</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Energy Usage (kWh)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              min="0"
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleCO2Estimate}
          >
            Get CO₂ Estimate
          </button>
          
          {realTimeData && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className={`text-xl font-bold ${realTimeData.co2e > 600 ? 'text-red-400' : 'text-green-400'}`}>
                Estimated CO₂ Emission: {realTimeData.co2e} {realTimeData.co2e_unit || "kg"}
              </p>
            </div>
          )}
          
          {!realTimeData && (
            <p className="mt-4 text-gray-500">❌ No real-time data available</p>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-4">Filter CO₂ Data</h2>
          <FilterControls onApplyFilters={handleApplyFilters} />
          {isFiltered && (
            <p className="mt-2 text-sm text-blue-500">Showing filtered results.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">CO₂ Emissions Trend</h2>
        <div className="h-64">
          <CO2TrendChart data={dbData} />
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-bold mb-4">CO₂ Emissions Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Timestamp</th>
                <th className="py-2 px-4 border-b">CO2 Level</th>
                <th className="py-2 px-4 border-b">Temperature</th>
                {isFiltered && <th className="py-2 px-4 border-b">Location</th>}
                {isFiltered && <th className="py-2 px-4 border-b">Activity Type</th>}
              </tr>
            </thead>
            <tbody>
              {dbData.length > 0 ? (
                dbData.map((record) => (
                  <tr key={record.id}>
                    <td className="py-2 px-4 border-b">{record.timestamp}</td>
                    <td className={`py-2 px-4 border-b ${record.co2_level > 600 ? 'text-red-400' : 'text-green-400'}`}>
                      {record.co2_level}
                    </td>
                    <td className="py-2 px-4 border-b">{record.temperature}</td>
                    {isFiltered && <td className="py-2 px-4 border-b">{record.location || 'Unknown'}</td>}
                    {isFiltered && <td className="py-2 px-4 border-b">{record.activity_type || 'electricity'}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isFiltered ? 5 : 3} className="py-2 px-4 border-b text-center">
                    No matching data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
