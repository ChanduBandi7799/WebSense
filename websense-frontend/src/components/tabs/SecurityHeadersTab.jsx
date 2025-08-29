import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadialBarChart, RadialBar } from 'recharts';
import { Shield, Lock, Eye, Zap, AlertTriangle, CheckCircle, Globe, Activity, Sparkles } from 'lucide-react';

const SecurityHeadersTab = ({ 
  securityHeadersData, 
  securityHeadersAnalysisStatus, 
  securityHeadersError 
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
        <div className="absolute top-0 -left-4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="mb-12 p-8 bg-gradient-to-br from-red-950/30 via-slate-900/40 to-slate-950/30 border border-red-800/30 rounded-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-100 mb-2">Security Headers Intelligence</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/50 rounded-full border border-red-700/30">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300 font-semibold tracking-wide">ADVANCED SECURITY ANALYSIS</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
              Comprehensive analysis of HTTP security headers to protect against XSS attacks, clickjacking, 
              downgrade attacks, and other web vulnerabilities. Get enterprise-grade security insights instantly.
            </p>
          </div>
        </div>
        
        {securityHeadersAnalysisStatus === 'loading' ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-blue-500 animate-spin opacity-20"></div>
                <div className="absolute inset-2 rounded-full bg-slate-950"></div>
                <div className="absolute inset-6 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-red-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Analyzing Security Headers...</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Scanning your website's HTTP security headers and generating comprehensive vulnerability analysis
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-red-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : securityHeadersAnalysisStatus === 'success' && securityHeadersData ? (
          <div className="space-y-8">
            {securityHeadersData.success ? (
              <SecurityHeadersDisplay data={securityHeadersData} />
            ) : (
              <div className="text-center py-20">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-2xl border border-red-800/30 flex items-center justify-center">
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-4">Analysis Failed</h3>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  {securityHeadersData.message}
                </p>
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-slate-600 rounded-xl blur opacity-60"></div>
                  <button
                    onClick={() => window.location.reload()}
                    className="relative px-8 py-4 bg-gradient-to-r from-red-600 to-slate-700 text-white text-lg font-bold rounded-xl hover:from-red-500 hover:to-slate-600 transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-5 h-5 inline mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-950/40 to-slate-900/40 rounded-2xl border border-blue-800/30 flex items-center justify-center">
                <Eye className="w-16 h-16 text-blue-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Ready to Analyze Security Headers</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Switch to the Security Headers tab to automatically start comprehensive security analysis of your website
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SecurityHeadersDisplay = ({ data }) => {
  const renderHeaderStatus = (header, title, description, icon) => {
    const isPresent = header.present;
    
    return (
      <div className={`group relative p-6 rounded-2xl border transition-all duration-500 hover:scale-105 backdrop-blur-sm overflow-hidden ${
        isPresent 
          ? 'bg-gradient-to-br from-green-950/30 to-slate-900/40 border-green-800/30 hover:border-green-700/50' 
          : 'bg-gradient-to-br from-red-950/30 to-slate-900/40 border-red-800/30 hover:border-red-700/50'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${
                isPresent 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {icon}
              </div>
              <div>
                <h5 className={`text-xl font-bold ${isPresent ? 'text-green-100' : 'text-red-100'}`}>
                  {title}
                </h5>
                <p className="text-sm text-slate-400 mt-1">{description}</p>
              </div>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
              isPresent 
                ? 'bg-green-500/20 border-2 border-green-500/40' 
                : 'bg-red-500/20 border-2 border-red-500/40'
            }`}>
              {isPresent ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>
          
          <p className={`text-sm mb-4 leading-relaxed ${isPresent ? 'text-green-200' : 'text-red-200'}`}>
            {header.description}
          </p>
          
          {header.value && (
            <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800/40">
              <p className="text-xs text-slate-400 mb-2 font-semibold">Header Value:</p>
              <code className="text-sm text-slate-200 bg-slate-800/50 p-3 rounded-lg block break-all border border-slate-700/30">
                {header.value}
              </code>
            </div>
          )}
          
          <div className={`mt-4 p-3 rounded-lg ${
            isPresent 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <p className={`text-sm font-medium ${isPresent ? 'text-green-300' : 'text-red-300'}`}>
              {header.recommendation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#FBBF24'; // yellow
    if (score >= 40) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  const getSecurityScoreBg = (score) => {
    if (score >= 80) return 'from-green-950/30 to-slate-900/40 border-green-800/30';
    if (score >= 60) return 'from-yellow-950/30 to-slate-900/40 border-yellow-800/30';
    if (score >= 40) return 'from-orange-950/30 to-slate-900/40 border-orange-800/30';
    return 'from-red-950/30 to-slate-900/40 border-red-800/30';
  };

  // Enhanced data for charts
  const securityHeadersData = [
    { name: 'HSTS', present: data.hsts.present, icon: <Lock className="w-5 h-5" /> },
    { name: 'CSP', present: data.csp.present, icon: <Shield className="w-5 h-5" /> },
    { name: 'X-Frame-Options', present: data.xFrameOptions.present, icon: <Eye className="w-5 h-5" /> },
    { name: 'X-Content-Type-Options', present: data.xContentTypeOptions.present, icon: <Activity className="w-5 h-5" /> },
    { name: 'Referrer-Policy', present: data.referrerPolicy.present, icon: <Globe className="w-5 h-5" /> },
    { name: 'Permissions-Policy', present: data.permissionsPolicy.present, icon: <Zap className="w-5 h-5" /> }
  ];

  const pieChartData = [
    { name: 'Secure', value: data.summary.totalHeaders, color: '#10B981' },
    { name: 'Missing', value: 6 - data.summary.totalHeaders, color: '#EF4444' }
  ];

  const barChartData = securityHeadersData.map(header => ({
    name: header.name,
    status: header.present ? 100 : 0,
    color: header.present ? '#10B981' : '#EF4444'
  }));

  return (
    <div className="space-y-8">
      {/* Security Score Dashboard */}
      <div className={`group relative p-8 rounded-2xl border bg-gradient-to-br ${getSecurityScoreBg(data.summary.securityScore)} backdrop-blur-md overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/30">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h4 className="text-3xl font-bold text-slate-100 mb-2">Security Score Dashboard</h4>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">COMPREHENSIVE ANALYSIS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score Gauge */}
            <div className="lg:col-span-1">
              <SecurityScoreGauge score={data.summary.securityScore} status={data.summary.overallStatus} />
            </div>
            
            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
                <div className="text-3xl font-bold text-slate-100 mb-2">
                  {data.summary.securityScore}/100
                </div>
                <div className="text-sm text-slate-400 font-medium">Overall Security Score</div>
              </div>
              
              <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {data.summary.totalHeaders}/6
                </div>
                <div className="text-sm text-slate-400 font-medium">Security Headers Present</div>
              </div>
              
              <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
                <div className={`text-3xl font-bold mb-2 ${
                  data.https.enabled ? 'text-green-400' : 'text-red-400'
                }`}>
                  {data.https.enabled ? 'YES' : 'NO'}
                </div>
                <div className="text-sm text-slate-400 font-medium">HTTPS Enabled</div>
              </div>
              
              <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
                <div className={`text-3xl font-bold mb-2 ${getSecurityScoreColor(data.summary.securityScore) === '#10B981' ? 'text-green-400' : getSecurityScoreColor(data.summary.securityScore) === '#FBBF24' ? 'text-yellow-400' : getSecurityScoreColor(data.summary.securityScore) === '#F59E0B' ? 'text-orange-400' : 'text-red-400'}`}>
                  {data.summary.overallStatus}
                </div>
                <div className="text-sm text-slate-400 font-medium">Security Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="group relative p-8 bg-gradient-to-br from-blue-950/30 to-slate-900/40 rounded-2xl border border-blue-800/30 backdrop-blur-md hover:border-blue-700/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative">
            <h4 className="text-2xl font-bold text-slate-100 mb-6">Security Headers Distribution</h4>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="group relative p-8 bg-gradient-to-br from-indigo-950/30 to-slate-900/40 rounded-2xl border border-indigo-800/30 backdrop-blur-md hover:border-indigo-700/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative">
            <h4 className="text-2xl font-bold text-slate-100 mb-6">Header Status Overview</h4>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [value === 100 ? 'Present' : 'Missing', 'Status']}
                  />
                  <Bar 
                    dataKey="status" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* HTTPS Status */}
      <div className={`group relative p-8 rounded-2xl border transition-all duration-500 hover:scale-[1.02] backdrop-blur-md overflow-hidden ${
        data.https.enabled 
          ? 'bg-gradient-to-br from-green-950/30 to-slate-900/40 border-green-800/30 hover:border-green-700/50' 
          : 'bg-gradient-to-br from-red-950/30 to-slate-900/40 border-red-800/30 hover:border-red-700/50'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-xl border ${
              data.https.enabled 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <Lock className={`w-8 h-8 ${data.https.enabled ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <h4 className={`text-2xl font-bold ${data.https.enabled ? 'text-green-100' : 'text-red-100'}`}>
                HTTPS / SSL Certificate
              </h4>
              <p className={`text-lg mt-2 ${data.https.enabled ? 'text-green-200' : 'text-red-200'}`}>
                {data.https.description}
              </p>
            </div>
          </div>
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
            data.https.enabled 
              ? 'bg-green-500/20 border-2 border-green-500/40' 
              : 'bg-red-500/20 border-2 border-red-500/40'
          }`}>
            {data.https.enabled ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Security Headers Grid */}
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-slate-100 mb-4">Detailed Security Headers Analysis</h3>
          <p className="text-xl text-slate-400">Comprehensive breakdown of each security header and its protection level</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderHeaderStatus(data.hsts, 'Strict-Transport-Security (HSTS)', 'Prevents downgrade attacks and enforces HTTPS', <Lock className="w-6 h-6" />)}
          {renderHeaderStatus(data.csp, 'Content-Security-Policy (CSP)', 'Prevents XSS attacks and code injection', <Shield className="w-6 h-6" />)}
          {renderHeaderStatus(data.xFrameOptions, 'X-Frame-Options', 'Prevents clickjacking attacks', <Eye className="w-6 h-6" />)}
          {renderHeaderStatus(data.xContentTypeOptions, 'X-Content-Type-Options', 'Blocks MIME type sniffing attacks', <Activity className="w-6 h-6" />)}
          {renderHeaderStatus(data.referrerPolicy, 'Referrer-Policy', 'Protects sensitive referral information', <Globe className="w-6 h-6" />)}
          {renderHeaderStatus(data.permissionsPolicy, 'Permissions-Policy', 'Controls browser features and APIs', <Zap className="w-6 h-6" />)}
        </div>
      </div>

      {/* Recommendations Section */}
      {data.summary.recommendations.length > 0 && (
        <div className="group relative p-8 bg-gradient-to-br from-yellow-950/30 to-slate-900/40 rounded-2xl border border-yellow-800/30 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-yellow-100 mb-2">Security Recommendations</h4>
                <p className="text-yellow-200">Expert recommendations to improve your website's security posture</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {!data.hsts.present && (
                <RecommendationCard
                  title="Add Strict-Transport-Security Header"
                  description="HSTS prevents downgrade attacks by telling browsers to always use HTTPS connections."
                  code="Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
                  icon={<Lock className="w-6 h-6" />}
                />
              )}
              
              {!data.csp.present && (
                <RecommendationCard
                  title="Add Content-Security-Policy Header"
                  description="CSP helps prevent XSS attacks by controlling which resources can be loaded on your website."
                  code="Content-Security-Policy: default-src 'self'; script-src 'self' trusted-scripts.com; img-src *"
                  icon={<Shield className="w-6 h-6" />}
                />
              )}
              
              {!data.xFrameOptions.present && (
                <RecommendationCard
                  title="Add X-Frame-Options Header"
                  description="Prevents clickjacking attacks by controlling whether your page can be displayed in frames."
                  code="X-Frame-Options: DENY"
                  icon={<Eye className="w-6 h-6" />}
                />
              )}
              
              {!data.xContentTypeOptions.present && (
                <RecommendationCard
                  title="Add X-Content-Type-Options Header"
                  description="Prevents MIME type sniffing which can lead to security vulnerabilities."
                  code="X-Content-Type-Options: nosniff"
                  icon={<Activity className="w-6 h-6" />}
                />
              )}
              
              {!data.referrerPolicy.present && (
                <RecommendationCard
                  title="Add Referrer-Policy Header"
                  description="Controls how much referrer information is included with requests to protect sensitive data."
                  code="Referrer-Policy: strict-origin-when-cross-origin"
                  icon={<Globe className="w-6 h-6" />}
                />
              )}
              
              {!data.permissionsPolicy.present && (
                <RecommendationCard
                  title="Add Permissions-Policy Header"
                  description="Controls which browser features and APIs can be used on your website."
                  code="Permissions-Policy: camera=(), microphone=(), geolocation=(self)"
                  icon={<Zap className="w-6 h-6" />}
                />
              )}
            </div>
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
              <div className="text-sm text-slate-400 mb-2">Website URL</div>
              <div className="text-lg font-semibold text-slate-200 break-all">{data.url}</div>
            </div>
            
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="text-sm text-slate-400 mb-2">Overall Security Status</div>
              <div className={`text-lg font-semibold ${
                data.summary.securityScore >= 80 ? 'text-green-400' : 
                data.summary.securityScore >= 60 ? 'text-yellow-400' : 
                data.summary.securityScore >= 40 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {data.summary.overallStatus}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ title, description, code, icon }) => {
  return (
    <div className="group relative p-6 bg-slate-900/40 rounded-xl border border-slate-800/40 backdrop-blur-sm hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-400">
          {icon}
        </div>
        <div className="flex-1">
          <h5 className="text-xl font-bold text-yellow-100 mb-2">{title}</h5>
          <p className="text-yellow-200 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Recommended Header</span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
          >
            Copy
          </button>
        </div>
        <code className="text-sm text-slate-200 block break-all leading-relaxed">
          {code}
        </code>
      </div>
    </div>
  );
};

// Enhanced Security Score Gauge Component
const SecurityScoreGauge = ({ score, status }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#FBBF24'; // yellow
    if (score >= 40) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  const scoreColor = getScoreColor(score);

  // Create radial bar data for a more sophisticated gauge
  const radialData = [
    {
      name: 'Security Score',
      value: score,
      fill: scoreColor
    }
  ];

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <h5 className="text-xl font-bold text-slate-100 mb-2">Security Score</h5>
        <p className="text-slate-400">Overall security rating</p>
      </div>
      
      <div className="w-full" style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="60%" 
            outerRadius="90%" 
            barSize={20} 
            data={radialData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={10}
              fill={scoreColor}
              background={{ fill: '#374151' }}
            />
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-4xl font-bold"
              fill={scoreColor}
            >
              {score}
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-semibold"
              fill="#94a3b8"
            >
              /100
            </text>
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm"
              fill="#64748b"
            >
              {status}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Score indicators */}
      <div className="flex justify-between text-xs text-slate-500 mt-4">
        <span>Poor</span>
        <span>Fair</span>
        <span>Good</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

export default SecurityHeadersTab;