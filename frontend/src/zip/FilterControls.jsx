import React, { useState } from 'react';

function FilterControls({ onApplyFilters }) {
  const [filters, setFilters] = useState({
    location: '',
    minEmission: '',
    maxEmission: '',
    minTemp: '',
    maxTemp: '',
    startDate: '',
    endDate: '',
    activityType: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({
      location: '',
      minEmission: '',
      maxEmission: '',
      minTemp: '',
      maxTemp: '',
      startDate: '',
      endDate: '',
      activityType: ''
    });
    onApplyFilters({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Filter CO₂ Data</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g. New York"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Type</label>
          <select
            name="activityType"
            value={filters.activityType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Activities</option>
            <option value="electricity">Electricity</option>
            <option value="car">Car</option>
            <option value="flight">Flight</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Emission (kg)</label>
          <input
            type="number"
            name="minEmission"
            value={filters.minEmission}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Emission (kg)</label>
          <input
            type="number"
            name="maxEmission"
            value={filters.maxEmission}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Temperature</label>
          <input
            type="number"
            name="minTemp"
            value={filters.minTemp}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Temperature</label>
          <input
            type="number"
            name="maxTemp"
            value={filters.maxTemp}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Reset Filters
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}

export default FilterControls;
