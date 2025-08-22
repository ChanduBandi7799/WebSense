import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-green-600">Web</span>
          <span className="text-2xl font-bold text-blue-600">Sense</span>
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="px-4 py-2 text-gray-700 hover:text-gray-900">Dashboard</Link>
          <Link to="/add-website" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add Website</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;