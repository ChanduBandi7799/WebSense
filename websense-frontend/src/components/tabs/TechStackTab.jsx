import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Code, Layers, Database, Globe, Shield, Zap, Activity, Sparkles, Server, Cloud, Cpu, Monitor, Package, Settings, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

const TechStackTab = ({ 
  techStackData, 
  techStackAnalysisStatus, 
  techStackError 
}) => {
  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950" style={{ backgroundColor: '#020617', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="mb-12 p-8 bg-gradient-to-br from-purple-950/30 via-slate-900/40 to-slate-950/30 border border-purple-800/30 rounded-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Code className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-100 mb-2">Technology Stack Intelligence</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-950/50 rounded-full border border-purple-700/30">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300 font-semibold tracking-wide">COMPREHENSIVE TECH ANALYSIS</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
              Advanced detection of technologies, frameworks, libraries, and infrastructure powering your website. 
              Get deep insights into the complete technology ecosystem with confidence scores and version details.
            </p>
          </div>
        </div>
        
        {techStackAnalysisStatus === 'loading' ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-spin opacity-20"></div>
                <div className="absolute inset-2 rounded-full bg-slate-950"></div>
                <div className="absolute inset-6 flex items-center justify-center">
                  <Code className="w-12 h-12 text-purple-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Analyzing Technology Stack...</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Scanning website infrastructure and identifying all technologies, frameworks, and libraries in use
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : techStackAnalysisStatus === 'success' && techStackData ? (
          <TechStackDisplay data={techStackData} />
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-2xl border border-red-800/30 flex items-center justify-center">
                <AlertTriangle className="w-16 h-16 text-red-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Unable to Analyze Technology Stack</h3>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              {techStackError || 'An error occurred while analyzing the technology stack. Please try again.'}
            </p>
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-slate-600 rounded-xl blur opacity-60"></div>
              <button
                onClick={() => window.location.reload()}
                className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-slate-700 text-white text-lg font-bold rounded-xl hover:from-purple-500 hover:to-slate-600 transition-all duration-300 hover:scale-105"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TechStackDisplay = ({ data }) => {
  const renderTechList = (techs, title, color = 'blue', description = '', icon) => {
    if (!techs || techs.length === 0) return null;
    
    const colorClasses = {
      blue: 'from-blue-950/30 to-slate-900/40 border-blue-800/30 text-blue-100',
      green: 'from-green-950/30 to-slate-900/40 border-green-800/30 text-green-100',
      purple: 'from-purple-950/30 to-slate-900/40 border-purple-800/30 text-purple-100',
      orange: 'from-orange-950/30 to-slate-900/40 border-orange-800/30 text-orange-100',
      red: 'from-red-950/30 to-slate-900/40 border-red-800/30 text-red-100',
      yellow: 'from-yellow-950/30 to-slate-900/40 border-yellow-800/30 text-yellow-100',
      indigo: 'from-indigo-950/30 to-slate-900/40 border-indigo-800/30 text-indigo-100'
    };

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

    const displayDescription = description || categoryDescriptions[title] || '';

    return (
      <div className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md overflow-hidden hover:scale-105 transition-all duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl border ${color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : color === 'green' ? 'bg-green-500/10 border-green-500/20 text-green-400' : color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-400' : color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
              {icon}
            </div>
            <div className="flex-1">
              <h5 className="text-xl font-bold mb-1">{title}</h5>
              <p className="text-sm text-slate-400">{displayDescription}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color === 'blue' ? 'bg-blue-500/20 text-blue-300' : color === 'green' ? 'bg-green-500/20 text-green-300' : color === 'purple' ? 'bg-purple-500/20 text-purple-300' : color === 'orange' ? 'bg-orange-500/20 text-orange-300' : color === 'red' ? 'bg-red-500/20 text-red-300' : color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
              {techs.length} found
            </div>
          </div>
          
          <div className="space-y-3">
            {techs.map((tech, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800/40 hover:bg-slate-800/40 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="font-semibold text-slate-200">{tech.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {tech.version && tech.version !== 'Unknown' && (
                    <span className="px-3 py-1 text-xs font-medium bg-slate-800/50 text-slate-300 rounded-lg border border-slate-700/40">
                      v{tech.version}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${color === 'blue' ? 'bg-blue-400' : color === 'green' ? 'bg-green-400' : color === 'purple' ? 'bg-purple-400' : color === 'orange' ? 'bg-orange-400' : color === 'red' ? 'bg-red-400' : color === 'yellow' ? 'bg-yellow-400' : 'bg-indigo-400'}`}
                        style={{ width: `${tech.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 min-w-[3ch]">
                      {tech.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Calculate total technologies for overview
  const totalTechnologies = 
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
    (data.competitor?.abTesting?.length || 0);

  return (
    <div className="space-y-8">
      {/* Overview Dashboard */}
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h4 className="text-3xl font-bold text-slate-100 mb-2">Technology Overview</h4>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">STACK ANALYSIS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-400 mb-2">{totalTechnologies}</div>
              <div className="text-sm text-slate-400 font-medium">Total Technologies</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {(data.techStack?.frontend?.length || 0) + (data.techStack?.frameworks?.length || 0)}
              </div>
              <div className="text-sm text-slate-400 font-medium">Frontend Stack</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {(data.techStack?.backend?.length || 0) + (data.techStack?.databases?.length || 0)}
              </div>
              <div className="text-sm text-slate-400 font-medium">Backend Stack</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {(data.devops?.webServers?.length || 0) + (data.devops?.hosting?.length || 0) + (data.devops?.cloudServices?.length || 0)}
              </div>
              <div className="text-sm text-slate-400 font-medium">Infrastructure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TechDistributionChart data={data} />
        <TechCategoryBarChart data={data} />
      </div>

      {/* Tech Stack Categories */}
      {data.techStack && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Core Technology Stack</h3>
            <p className="text-xl text-slate-400">Essential technologies powering the application</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderTechList(data.techStack.frontend, 'Frontend Technologies', 'blue', '', <Monitor className="w-6 h-6" />)}
            {renderTechList(data.techStack.backend, 'Backend Technologies', 'green', '', <Server className="w-6 h-6" />)}
            {renderTechList(data.techStack.databases, 'Database Systems', 'purple', '', <Database className="w-6 h-6" />)}
            {renderTechList(data.techStack.programmingLanguages, 'Programming Languages', 'orange', '', <Code className="w-6 h-6" />)}
            {renderTechList(data.techStack.frameworks, 'Frameworks', 'red', '', <Layers className="w-6 h-6" />)}
            {renderTechList(data.techStack.libraries, 'Libraries', 'yellow', '', <Package className="w-6 h-6" />)}
          </div>
        </div>
      )}

      {/* Platform Services */}
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-slate-100 mb-4">Platform Services</h3>
          <p className="text-xl text-slate-400">Content management, e-commerce, and analytics platforms</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTechList(data.cms, 'Content Management Systems', 'green', '', <Globe className="w-6 h-6" />)}
          {renderTechList(data.ecommerce, 'E-commerce Platforms', 'purple', '', <Package className="w-6 h-6" />)}
          {renderTechList(data.analytics, 'Analytics & Tracking', 'blue', '', <Activity className="w-6 h-6" />)}
          {renderTechList(data.security, 'Security Tools', 'red', '', <Shield className="w-6 h-6" />)}
        </div>
      </div>

      {/* DevOps & Infrastructure */}
      {data.devops && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">DevOps & Infrastructure</h3>
            <p className="text-xl text-slate-400">Hosting, servers, and cloud infrastructure</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderTechList(data.devops.webServers, 'Web Servers', 'blue', '', <Server className="w-6 h-6" />)}
            {renderTechList(data.devops.cdn, 'Content Delivery Networks', 'green', '', <Globe className="w-6 h-6" />)}
            {renderTechList(data.devops.hosting, 'Hosting Services', 'purple', '', <Cloud className="w-6 h-6" />)}
            {renderTechList(data.devops.cloudServices, 'Cloud Services', 'orange', '', <Cpu className="w-6 h-6" />)}
          </div>
        </div>
      )}

      {/* Business Intelligence */}
      {data.competitor && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Business Intelligence</h3>
            <p className="text-xl text-slate-400">Payment processing, advertising, and optimization tools</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderTechList(data.competitor.paymentProcessors, 'Payment Processors', 'green', '', <Settings className="w-6 h-6" />)}
            {renderTechList(data.competitor.advertisingNetworks, 'Advertising Networks', 'purple', '', <Zap className="w-6 h-6" />)}
            {renderTechList(data.competitor.abTesting, 'A/B Testing Tools', 'blue', '', <Activity className="w-6 h-6" />)}
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md hover:border-slate-600/50 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <h4 className="text-2xl font-bold text-slate-100 mb-6">Analysis Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="text-sm text-slate-400 mb-2">Analysis Completed</div>
              <div className="text-lg font-semibold text-slate-200">{new Date(data.timestamp).toLocaleString()}</div>
            </div>
            
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="text-sm text-slate-400 mb-2">Technologies Detected</div>
              <div className="text-lg font-semibold text-blue-400">{totalTechnologies} Technologies</div>
            </div>
            
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="text-sm text-slate-400 mb-2">Analysis Status</div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-lg font-semibold text-green-400">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Distribution Chart Component
const TechDistributionChart = ({ data }) => {
  const prepareChartData = () => {
    const categories = [
      { name: 'Frontend', count: data.techStack?.frontend?.length || 0, color: '#3B82F6' },
      { name: 'Backend', count: data.techStack?.backend?.length || 0, color: '#10B981' },
      { name: 'Databases', count: data.techStack?.databases?.length || 0, color: '#8B5CF6' },
      { name: 'Languages', count: data.techStack?.programmingLanguages?.length || 0, color: '#F59E0B' },
      { name: 'Frameworks', count: data.techStack?.frameworks?.length || 0, color: '#EF4444' },
      { name: 'Libraries', count: data.techStack?.libraries?.length || 0, color: '#FBBF24' },
      { name: 'CMS', count: data.cms?.length || 0, color: '#10B981' },
      { name: 'E-commerce', count: data.ecommerce?.length || 0, color: '#8B5CF6' },
      { name: 'Analytics', count: data.analytics?.length || 0, color: '#3B82F6' },
      { name: 'Security', count: data.security?.length || 0, color: '#EF4444' }
    ];
    
    return categories.filter(category => category.count > 0);
  };

  const chartData = prepareChartData();
  
  if (chartData.length === 0) {
    return (
      <div className="group relative p-8 bg-gradient-to-br from-blue-950/30 to-slate-900/40 rounded-2xl border border-blue-800/30 backdrop-blur-md">
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No technology data available for visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative p-8 bg-gradient-to-br from-blue-950/30 to-slate-900/40 rounded-2xl border border-blue-800/30 backdrop-blur-md hover:border-blue-700/50 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <h4 className="text-2xl font-bold text-slate-100 mb-6">Technology Distribution</h4>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={130}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} technologies`, name]}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#e2e8f0' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// New Bar Chart Component
const TechCategoryBarChart = ({ data }) => {
  const prepareBarData = () => {
    return [
      { name: 'Frontend', count: data.techStack?.frontend?.length || 0, color: '#3B82F6' },
      { name: 'Backend', count: data.techStack?.backend?.length || 0, color: '#10B981' },
      { name: 'Database', count: data.techStack?.databases?.length || 0, color: '#8B5CF6' },
      { name: 'Languages', count: data.techStack?.programmingLanguages?.length || 0, color: '#F59E0B' },
      { name: 'Analytics', count: data.analytics?.length || 0, color: '#EF4444' },
      { name: 'Security', count: data.security?.length || 0, color: '#FBBF24' }
    ].filter(item => item.count > 0);
  };

  const barData = prepareBarData();

  return (
    <div className="group relative p-8 bg-gradient-to-br from-indigo-950/30 to-slate-900/40 rounded-2xl border border-indigo-800/30 backdrop-blur-md hover:border-indigo-700/50 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <h4 className="text-2xl font-bold text-slate-100 mb-6">Category Breakdown</h4>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
                formatter={(value, name) => [`${value} technologies`, 'Count']}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TechStackTab;