import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const TechStackTab = ({ 
  techStackData, 
  techStackAnalysisStatus, 
  techStackError 
}) => {
  return (
    <>
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-purple-800 font-medium mb-2">Technology Stack Analysis</h4>
        <p className="text-purple-700 text-sm">
          Identify the technologies, frameworks, and libraries used by a website.
        </p>
      </div>
      
      {techStackAnalysisStatus === 'loading' ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Technology Stack...</h3>
          <p className="text-gray-500">Please wait while we identify the technologies used by this website.</p>
        </div>
      ) : techStackAnalysisStatus === 'success' && techStackData ? (
        <TechStackDisplay data={techStackData} />
      ) : (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Unable to analyze technology stack</h3>
          <p className="text-gray-500 mb-4">{techStackError || 'An error occurred while analyzing the technology stack.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Try Again
          </button>
        </div>
      )}
    </>
  );
};

const TechDistributionChart = ({ data }) => {
  // Prepare data for the pie chart
  const prepareChartData = () => {
    const categories = [
      { name: 'Frontend', count: data.techStack?.frontend?.length || 0, color: '#3B82F6' }, // blue
      { name: 'Backend', count: data.techStack?.backend?.length || 0, color: '#10B981' }, // green
      { name: 'Databases', count: data.techStack?.databases?.length || 0, color: '#8B5CF6' }, // purple
      { name: 'Languages', count: data.techStack?.programmingLanguages?.length || 0, color: '#F59E0B' }, // orange
      { name: 'Frameworks', count: data.techStack?.frameworks?.length || 0, color: '#EF4444' }, // red
      { name: 'Libraries', count: data.techStack?.libraries?.length || 0, color: '#F59E0B' }, // yellow
      { name: 'CMS', count: data.cms?.length || 0, color: '#10B981' }, // green
      { name: 'E-commerce', count: data.ecommerce?.length || 0, color: '#8B5CF6' }, // purple
      { name: 'Analytics', count: data.analytics?.length || 0, color: '#3B82F6' }, // blue
      { name: 'Security', count: data.security?.length || 0, color: '#EF4444' } // red
    ];
    
    // Filter out categories with count 0
    return categories.filter(category => category.count > 0);
  };

  const chartData = prepareChartData();
  
  // If no data, show a message
  if (chartData.length === 0) {
    return <div className="text-center text-gray-500 py-4">No technology data available for visualization</div>;
  }

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} technologies`, name]}
            contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TechStackTab;

const TechStackDisplay = ({ data }) => {
  const renderTechList = (techs, title, color = 'blue', description = '') => {
    if (!techs || techs.length === 0) return null;
    
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    // Technology category descriptions
    const categoryDescriptions = {
      'Frontend': 'Technologies that run in the browser and create the user interface.',
      'Backend': 'Server-side technologies that handle business logic and data processing.',
      'Databases': 'Systems used for storing, retrieving, and managing data.',
      'Programming Languages': 'Core languages used to build the application.',
      'Frameworks': 'Structured platforms that provide foundation for development.',
      'Libraries': 'Reusable code collections that provide specific functionality.',
      'Content Management Systems': 'Platforms for creating and managing digital content.',
      'E-commerce Platforms': 'Solutions for online selling and transactions.',
      'Analytics & Tracking': 'Tools for measuring user behavior and site performance.',
      'Web Servers': 'Software that serves web content to users.',
      'CDN': 'Content delivery networks that distribute content globally.',
      'Hosting': 'Services that host the website or application.',
      'Cloud Services': 'Cloud-based infrastructure and platform services.',
      'Security Tools': 'Technologies that protect the website and user data.',
      'Payment Processors': 'Services that handle online payments.',
      'Advertising Networks': 'Platforms for displaying advertisements.',
      'A/B Testing Tools': 'Solutions for testing different versions of content.'
    };

    // Use provided description or get from the mapping
    const displayDescription = description || categoryDescriptions[title] || '';

    return (
      <div className={`p-3 rounded-lg border ${colorClasses[color]} mb-3`}>
        <h5 className="font-medium mb-1">{title}</h5>
        {displayDescription && (
          <p className="text-xs mb-2 opacity-80">{displayDescription}</p>
        )}
        <div className="space-y-1">
          {techs.map((tech, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="font-medium">{tech.name}</span>
              <div className="flex items-center space-x-2">
                {tech.version && tech.version !== 'Unknown' && (
                  <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                    v{tech.version}
                  </span>
                )}
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                  {tech.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tech Stack */}
      {data.techStack && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Technology Stack</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderTechList(data.techStack.frontend, 'Frontend', 'blue')}
            {renderTechList(data.techStack.backend, 'Backend', 'green')}
            {renderTechList(data.techStack.databases, 'Databases', 'purple')}
            {renderTechList(data.techStack.programmingLanguages, 'Programming Languages', 'orange')}
            {renderTechList(data.techStack.frameworks, 'Frameworks', 'red')}
            {renderTechList(data.techStack.libraries, 'Libraries', 'yellow')}
          </div>
        </div>
      )}

      {/* CMS */}
      {renderTechList(data.cms, 'Content Management Systems', 'green')}

      {/* E-commerce */}
      {renderTechList(data.ecommerce, 'E-commerce Platforms', 'purple')}

      {/* Analytics */}
      {renderTechList(data.analytics, 'Analytics & Tracking', 'blue')}

      {/* DevOps */}
      {data.devops && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">DevOps & Infrastructure</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderTechList(data.devops.webServers, 'Web Servers', 'blue')}
            {renderTechList(data.devops.cdn, 'CDN', 'green')}
            {renderTechList(data.devops.hosting, 'Hosting', 'purple')}
            {renderTechList(data.devops.cloudServices, 'Cloud Services', 'orange')}
          </div>
        </div>
      )}

      {/* Security */}
      {renderTechList(data.security, 'Security Tools', 'red')}

      {/* Competitor Analysis */}
      {data.competitor && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Competitor Insights</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderTechList(data.competitor.paymentProcessors, 'Payment Processors', 'green')}
            {renderTechList(data.competitor.advertisingNetworks, 'Advertising Networks', 'purple')}
            {renderTechList(data.competitor.abTesting, 'A/B Testing Tools', 'blue')}
          </div>
        </div>
      )}

      {/* Technology Distribution Chart */}
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h5 className="font-medium text-gray-800 mb-4">Technology Distribution</h5>
        <TechDistributionChart data={data} />
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2">Analysis Summary</h5>
        <div className="text-sm text-gray-600">
          <p>Analysis completed at: {new Date(data.timestamp).toLocaleString()}</p>
          <p>Total technologies detected: {
            (data.techStack?.frontend?.length || 0) +
            (data.techStack?.backend?.length || 0) +
            (data.techStack?.databases?.length || 0) +
            (data.techStack?.programmingLanguages?.length || 0) +
            (data.techStack?.frameworks?.length || 0) +
            (data.techStack?.libraries?.length || 0) +
            (data.cms?.length || 0) +
            (data.ecommerce?.length || 0) +
            (data.analytics?.length || 0) +
            (data.devops?.webServers?.length || 0) +
            (data.devops?.cdn?.length || 0) +
            (data.devops?.hosting?.length || 0) +
            (data.devops?.cloudServices?.length || 0) +
            (data.security?.length || 0) +
            (data.competitor?.paymentProcessors?.length || 0) +
            (data.competitor?.advertisingNetworks?.length || 0) +
            (data.competitor?.abTesting?.length || 0)
          }</p>
        </div>
      </div>
    </div>
  );
};
