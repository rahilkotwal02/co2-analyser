import axios from "axios";

const API_URL = "http://localhost:5000/api/co2"; // Backend API URL
const API_KEY = import.meta.env.VITE_CLIMATIQ_API_KEY; // API key from environment variables

// Fetch CO₂ Data from Local Backend (MySQL)
export const getCO2Data = async () => {
  try {
    console.log("Fetching CO2 data from database");
    const response = await axios.get(`${API_URL}/estimates`);
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Retrieved ${response.data.length} CO2 records`);
      // Transform data for chart display with proper field mappings
      const transformedData = response.data.map((record) => ({
        id: record.id,
        date: new Date(record.created_at).toLocaleDateString(),
        co2_level: record.co2e,
        co2e: record.co2e,
        energy: record.energy,
        energy_unit: record.energy_unit,
        co2e_unit: record.co2e_unit || "kg",
        temperature: record.temperature || "N/A",
        activity: record.activity_type || "electricity",
        activity_type: record.activity_type || "electricity",
      }));
      return transformedData;
    } else {
      console.warn("⚠️ Received empty or invalid CO2 data:", response.data);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching CO2 data from database:", error);
    return [];
  }
};

export const saveCO2Estimate = async (data) => {
  try {
    // Try to get user_id from localStorage - this should be set at login
    const userId = localStorage.getItem("user_id");
    console.log("Saving CO2 estimate with user_id:", userId);
    // Ensure we have required fields
    const payload = {
      ...data,
      user_id: userId || null,
      activity_type: data.activity_type || "electricity",
    };
    console.log("📤 Sending CO2 estimate data:", payload);
    const response = await axios.post(`${API_URL}/store-estimate`, payload);
    console.log("✅ CO₂ Estimate Saved:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving CO₂ estimate:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Calculate CO2 data locally if the external API fails
export const calculateLocalCO2 = async (energy, unit, activity) => {
  try {
    const response = await axios.post(`${API_URL}/calculate`, {
      energy: Number(energy),
      energy_unit: unit,
      activity_type: activity,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Local calculation error:", error);
    throw error;
  }
};

// Fetch Real-Time CO₂ Data from Climatiq API with fallback
export const getRealTimeCO2Data = async (energy = 100, unit = "kWh", activity = "electricity") => {
  try {
    console.log("📡 Fetching real-time CO₂ data...");
    console.log("🔹 Energy:", energy, unit, "Activity:", activity);
    let response;
    if (API_KEY) {
      try {
        const activityIds = {
          electricity: "electricity-supply_grid-source_residual_mix",
          car: "passenger_vehicle-vehicle_type_car-fuel_source_gasoline-distance_na-engine_size_na",
          flight: "flight-type_na-distance_na-class_na-rf_included",
        };
        const emissionFactor = activityIds[activity] || activityIds.electricity;
        response = await axios.post(
          "https://api.climatiq.io/data/v1/estimate",
          {
            emission_factor: {
              activity_id: emissionFactor,
              data_version: "^6",
            },
            parameters: {
              energy: Number(energy),
              energy_unit: unit,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ External API Response:", response.data);
        // Prepare data for saving to database
        const co2Data = {
          energy: Number(energy),
          energy_unit: unit,
          co2e: response.data.co2e,
          co2e_unit: response.data.co2e_unit || "kg",
          activity_type: activity,
        };
        // Save the result to the database
        try {
          await saveCO2Estimate(co2Data);
          console.log("✅ CO₂ data saved to database");
        } catch (saveError) {
          console.error("⚠️ Could not save CO₂ data to database:", saveError);
        }
        return response.data;
      } catch (apiError) {
        console.warn("⚠️ External API failed, falling back to local calculation");
        const localResult = await calculateLocalCO2(energy, unit, activity);
        const co2Data = {
          energy: Number(energy),
          energy_unit: unit,
          co2e: localResult.co2e,
          co2e_unit: localResult.co2e_unit || "kg",
          activity_type: activity,
        };
        try {
          await saveCO2Estimate(co2Data);
          console.log("✅ Local CO₂ data saved to database");
        } catch (saveError) {
          console.error("⚠️ Could not save local CO₂ data to database:", saveError);
        }
        return localResult;
      }
    } else {
      console.log("📡 No API key, using local calculation");
      const localResult = await calculateLocalCO2(energy, unit, activity);
      const co2Data = {
        energy: Number(energy),
        energy_unit: unit,
        co2e: localResult.co2e,
        co2e_unit: localResult.co2e_unit || "kg",
        activity_type: activity,
      };
      try {
        await saveCO2Estimate(co2Data);
        console.log("✅ Local CO₂ data saved to database");
      } catch (saveError) {
        console.error("⚠️ Could not save local CO₂ data to database:", saveError);
      }
      return localResult;
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getFilteredCO2Data = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.minEmission) queryParams.append("minEmission", filters.minEmission);
    if (filters.maxEmission) queryParams.append("maxEmission", filters.maxEmission);
    if (filters.minTemp) queryParams.append("minTemp", filters.minTemp);
    if (filters.maxTemp) queryParams.append("maxTemp", filters.maxTemp);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.activityType) queryParams.append("activityType", filters.activityType);

    const response = await axios.get(
      `${API_URL}/estimates/filter?${queryParams.toString()}`
    );
    // Transform data properly for CO2TrendChart component
    const transformedData = response.data.map((record) => ({
      id: record.id,
      date: new Date(record.created_at).toLocaleDateString(),
      co2_level: record.co2e,
      co2e: record.co2e,
      energy: record.energy,
      energy_unit: record.energy_unit,
      co2e_unit: record.co2e_unit || "kg",
      temperature: record.temperature || "N/A",
      location: record.location || "Unknown",
      activity: record.activity_type || "electricity",
      activity_type: record.activity_type || "electricity",
    }));
    return transformedData;
  } catch (error) {
    console.error("❌ Error fetching filtered CO2 data:", error);
    return [];
  }
};

// ==============================
// Save CO₂ Goal for User
// ==============================
export const saveUserGoal = async (goal) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    "http://localhost:5000/api/auth/save-goal",
    { goal },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// ==============================
// Save Theme Preference for User
// ==============================
export const saveUserTheme = async (theme) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    "http://localhost:5000/api/auth/save-theme",
    { theme },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
