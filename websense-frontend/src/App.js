import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AddWebsite from './components/AddWebsite';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        
        <main >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-website" element={<AddWebsite />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
