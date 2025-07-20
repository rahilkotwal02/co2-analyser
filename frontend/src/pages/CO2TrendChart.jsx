import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

function CO2TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-red-400">
        📉 No CO₂ data available for the chart
      </p>
    );
  }

  // Try all likely date fields, including nested ones
  const getDateValue = (record) =>
    record.created_at ||
    record.timestamp ||
    record.date ||
    record.day ||
    record.recorded_at ||
    record.time ||
    record.datetime ||
    (record.meta && record.meta.date) ||
    (record.meta && record.meta.timestamp);

  // Map data for chart, but DO NOT sort!
  const formattedData = data.map((record, idx) => {
    let dateValue = getDateValue(record);
    let dateString = "unknown";

    if (dateValue) {
      let parsedDate;
      if (typeof dateValue === "number") {
        parsedDate = new Date(dateValue);
        if (parsedDate.getFullYear() < 2000) {
          parsedDate = new Date(dateValue * 1000);
        }
      } else {
        parsedDate = new Date(dateValue);
      }
      if (!isNaN(parsedDate.getTime())) {
        dateString = parsedDate.toLocaleDateString(); // Or .toLocaleString() for date+time
      } else {
        console.warn(`Invalid date at index ${idx}:`, dateValue);
      }
    } else {
      console.warn(`No date field at index ${idx}:`, record);
    }

    const co2Value =
      record.co2_level !== undefined
        ? record.co2_level
        : record.co2e !== undefined
        ? record.co2e
        : 0;

    return {
      timestamp: dateString,
      co2_level: parseFloat(co2Value),
      energy: record.energy ? parseFloat(record.energy) : 0
    };
  });

  // DO NOT SORT HERE! We want to keep the backend/database order.

  // Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-green-500 rounded">
          <p className="text-green-300">📅 Date: {label}</p>
          <p className="text-green-400 font-bold">
            CO₂: {payload[0].value} kg
          </p>
          {payload[1] && (
            <p className="text-blue-400">
              ⚡ Energy: {payload[1].value} kWh
            </p>
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
            tick={{ fill: "#9CA3AF" }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: "#9CA3AF" }}
            label={{
              value: "CO₂ (kg)",
              angle: -90,
              position: "insideLeft",
              fill: "#9CA3AF"
            }}
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
          {formattedData.some((d) => d.energy > 0) && (
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
