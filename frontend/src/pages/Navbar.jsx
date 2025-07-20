import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 text-green-300 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">CO2 Analyzer</h1>
        <div className="space-x-6">
          <Link to="/" className="hover:text-green-400 transition">Home</Link>
          <Link to="/dashboard" className="hover:text-green-400 transition">Dashboard</Link>
          <Link to="/user" className="hover:text-green-400 transition">Profile</Link>
          <Link to="/co2-calculator" className="hover:text-green-400 transition">CO₂ Calculator</Link>
          <Link to="/logout" className="text-red-500 hover:underline ml-4">Logout</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
