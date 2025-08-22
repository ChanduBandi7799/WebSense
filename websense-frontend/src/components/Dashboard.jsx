import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for website monitoring
  const websites = [
    { id: 1, name: 'example.com', status: 'Online', responseTime: '120ms', lastChecked: '5 min ago' },
    { id: 2, name: 'testsite.org', status: 'Online', responseTime: '95ms', lastChecked: '10 min ago' },
    { id: 3, name: 'devproject.net', status: 'Offline', responseTime: '-', lastChecked: '15 min ago' },
  ];
  
  // Mock statistics
  const stats = [
    { label: 'Websites', value: '10+', color: 'blue' },
    { label: 'Audits', value: '500+', color: 'indigo' },
    { label: 'Uptime', value: '99.9%', color: 'green' },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-green-600">Website</span> <span className="text-blue-600">Intelligence</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Monitor, analyze, and improve your web presence
        </p>
        <Link to="/add-website" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md">
          Add New Website
        </Link>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
            <div className={`text-3xl font-bold mb-2 text-${stat.color}-600`}>{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* Websites Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Monitored Websites</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {websites.map((site) => (
                <tr key={site.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{site.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${site.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{site.responseTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{site.lastChecked}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900 mr-3">Audit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Backend Status */}
      {dashboardData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {dashboardData.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;