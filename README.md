# 🌳 Eco Dash: CO2 & Greenhouse Gas Analyzer 🌍

Eco Dash is a web application designed to help users track and analyze their carbon footprint. It provides a live dashboard to visualize CO2 levels, integrates with third-party APIs for real-time emission data, and uses a MySQL database to store and manage this information.

## 🎥 Demo

Here is a short screen recording of the Eco Dash application in action:

https://github.com/user-attachments/assets/8d36b84f-45fd-4928-89d5-a2fc5d208ea1

## ✨ Key Features

* **📊 Live Dashboard:** Visualizes carbon levels with charts and statistics, providing real-time insights into a user's carbon footprint.
* **⚡ Real-Time Data:** Integrates with the Climatiq API to fetch real-time CO2 emission data.
* **➗ CO2 Calculator:** Allows users to calculate their CO2 emissions based on various activities like electricity usage, car travel, and flights.
* **🔐 User Authentication:** Secure user registration and login functionality.
* **👤 User Profiles:** Users can set CO2 reduction goals and customize their theme preferences.
* **🔍 Data Filtering:** Provides options to filter CO2 data by location, emission range, temperature, date, and activity type.
* **💾 Data Persistence:** Utilizes a MySQL database to store user data and emission records.

## 🛠️ Technologies Used

* **Frontend:**
    * React
    * Tailwind CSS
    * Recharts for data visualization
    * Axios for API requests
* **Backend:**
    * Express.js
    * MySQL
* **APIs:**
    * Climatiq API for real-time CO2 emission data

## 🚀 Deployment

This project is deployed using the following services:
* **Frontend:** Vercel
* **Backend:** Render
* **Database:** Railway

**Note:** The backend is hosted on Render's free tier, which may cause the server to "sleep" after a period of inactivity. The first request might take a moment to wake the server up. 😴

## 🗃️ Database Schema

Here are some screenshots of the MySQL database schema used for this project:

*(Your database schema screenshots will be displayed here)*

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js and npm (or yarn)
* MySQL

### Installation & Setup

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/rahilkotwal02/co2-analyser.git
    ```
2.  **Backend Setup:**
    * Navigate to the `backend` directory.
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Create a `.env` file and add your database credentials and JWT secret.
    * Start the backend server:
        ```sh
        npm start
        ```
3.  **Frontend Setup:**
    * Navigate to the `frontend` directory.
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Create a `.env` file and add your Climatiq API key.
    * Start the frontend development server:
        ```sh
        npm run dev
        ```

### 🔑 Environment Variables

There are two `.env` files that need to be configured:

* **`backend/.env`**:
    ```
    # MySQL Database Configuration
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_database_password
    DB_NAME=co2_analyzer
    DB_PORT=3306 # Default MySQL port, change if necessary
    JWT_SECRET=your_jwt_secret
    ```

* **`frontend/.env`**:
    ```
    VITE_CLIMATIQ_API_KEY=your_climatiq_api_key
    VITE_CLIMATIQ_BASE_URL=[https://api.climatiq.io/data/v1](https://api.climatiq.io/data/v1)
    