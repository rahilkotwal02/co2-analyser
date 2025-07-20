import React, { useEffect, useState } from 'react';
import { getCO2Data, getRealTimeCO2Data, getFilteredCO2Data } from '../services/api';
import CO2TrendChart from './CO2TrendChart';
import FilterControls from './FilterControls';

function Dashboard() {
  const [dbData, setDbData] = useState([]);
  const [realTimeData, setRealTimeData] = useState(null);
  const [energy, setEnergy] = useState(4200);
  const [isFiltered, setIsFiltered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const dbData = await getCO2Data();
      if (Array.isArray(dbData)) {
        setDbData(dbData);
      } else {
        setError('Failed to load CO₂ data. Invalid data format.');
      }
    } catch (error) {
      setError('Failed to load CO₂ data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // FIX: Only call getRealTimeCO2Data, do NOT call saveCO2Estimate
  const handleCO2Estimate = async () => {
    if (Number(energy) <= 0) {
      alert('Please enter a valid energy value greater than 0');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newData = await getRealTimeCO2Data(Number(energy), 'kWh', 'electricity');
      if (newData && newData.co2e) {
        setRealTimeData(newData);
        await fetchData(); // Refresh data for chart and table
      } else {
        setError('Failed to get CO₂ estimate. Invalid response from service.');
      }
    } catch (error) {
      setError('Failed to calculate or save CO₂ estimate: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      if (Object.values(filters).some(val => val !== '')) {
        const filteredData = await getFilteredCO2Data(filters);
        setDbData(filteredData);
        setIsFiltered(true);
      } else {
        await fetchData();
        setIsFiltered(false);
      }
    } catch (error) {
      setError('Failed to apply filters: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CO₂ Emissions Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Real-Time CO₂ Estimate */}
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleCO2Estimate}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Get CO₂ Estimate'}
          </button>

          {realTimeData && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className={`text-xl font-bold ${realTimeData.co2e > 600 ? 'text-red-400' : 'text-green-400'}`}>
                Estimated CO₂ Emission: {realTimeData.co2e} {realTimeData.co2e_unit || 'kg'}
              </p>
            </div>
          )}
        </div>

        {/* Filter CO₂ Data */}
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-4">Filter CO₂ Data</h2>
          <FilterControls onApplyFilters={handleApplyFilters} />
          {isFiltered && <p className="mt-2 text-sm text-blue-500">Showing filtered results.</p>}
        </div>
      </div>

      {/* CO₂ Trend Chart */}
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">CO₂ Emissions Trend</h2>
        <div className="h-64">
          {loading && <p className="text-center text-gray-500">Loading chart data...</p>}
          {!loading && dbData.length > 0 ? (
            <CO2TrendChart data={dbData} />
          ) : (
            !loading && <p className="text-center text-gray-500">No data available for the chart</p>
          )}
        </div>
      </div>

      {/* CO₂ Records Table */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-bold mb-4">CO₂ Emissions Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">CO₂ Emission (kg)</th>
                <th className="py-2 px-4 border-b">Energy (kWh)</th>
                <th className="py-2 px-4 border-b">Temperature</th>
                <th className="py-2 px-4 border-b">Activity Type</th>
              </tr>
            </thead>
            <tbody>
              {dbData.length > 0 ? (
                dbData.map((record) => (
                  <tr key={record.id}>
                    <td className="py-2 px-4 border-b">{record.date}</td>
                    <td className={`py-2 px-4 border-b ${record.co2e > 600 ? 'text-red-400' : 'text-green-400'}`}>
                      {record.co2e || record.co2_level}
                    </td>
                    <td className="py-2 px-4 border-b">{record.energy} {record.energy_unit}</td>
                    <td className="py-2 px-4 border-b">{record.temperature}</td>
                    <td className="py-2 px-4 border-b">{record.activity || record.activity_type || 'electricity'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-2 px-4 text-center">
                    {loading ? 'Loading data...' : 'No data available'}
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
