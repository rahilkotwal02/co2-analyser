import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

function CO2TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-red-400">📉 No CO₂ data available for the chart</p>;
  }

  // Format data to handle both possible data structures
  const formattedData = data.map((record) => {
    // Create a formatted date from either timestamp or created_at
    const dateString = record.timestamp || 
                       (record.created_at ? new Date(record.created_at).toLocaleDateString() : "Unknown");
    
    // Get CO2 value from either co2_level or co2e
    const co2Value = record.co2_level !== undefined ? record.co2_level : record.co2e;
    
    return {
      timestamp: dateString,
      co2_level: co2Value,
      energy: record.energy || 0,
    };
  });

  // Sort data by date if timestamps are available
  formattedData.sort((a, b) => {
    // Try to parse dates for comparison
    try {
      return new Date(a.timestamp) - new Date(b.timestamp);
    } catch {
      return 0; // If dates can't be parsed, don't change order
    }
  });

  // Format tooltip to show more detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-green-500 rounded">
          <p className="text-green-300">{`Date: ${label}`}</p>
          <p className="text-green-400 font-bold">{`CO₂: ${payload[0].value} kg`}</p>
          {payload[1] && (
            <p className="text-blue-400">{`Energy: ${payload[1].value} kWh`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg text-white mb-4">
      <h3 className="text-lg font-bold mb-2">📊 CO₂ Emission Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF" 
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="co2_level" 
            name="CO₂ Emissions"
            stroke="#10B981" 
            strokeWidth={2} 
            dot={{ fill: "#10B981", r: 4 }}
            activeDot={{ r: 6, fill: "#059669" }}
          />
          {formattedData[0] && formattedData[0].energy > 0 && (
            <Line 
              type="monotone" 
              dataKey="energy" 
              name="Energy Used"
              stroke="#3B82F6" 
              strokeWidth={1.5} 
              dot={{ fill: "#3B82F6", r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CO2TrendChart;
