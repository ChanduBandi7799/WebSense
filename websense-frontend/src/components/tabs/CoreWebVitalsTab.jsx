import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Activity, Sparkles, Monitor, Smartphone, Tablet, AlertTriangle, CheckCircle, Eye, TrendingUp, Clock, Target } from 'lucide-react';

const CoreWebVitalsTab = ({ 
  isAnalyzingCoreWebVitals, 
  coreWebVitalsResult, 
  handleAnalyzeCoreWebVitals 
}) => {
  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

  // Calculate overall score for visualization
  const calculateOverallScore = (data) => {
    if (!data || !data.formFactors) return { score: 0, metrics: {} };
    
    const formFactors = ['mobile', 'desktop', 'tablet'];
    const metrics = ['lcp', 'cls', 'inp', 'fid', 'ttfb'];
    
    const scores = {};
    let totalScore = 0;
    let totalMetrics = 0;
    
    formFactors.forEach(formFactor => {
      if (data.formFactors[formFactor]) {
        metrics.forEach(metric => {
          if (data.formFactors[formFactor][metric] && data.formFactors[formFactor][metric].total > 0) {
            const goodPercentage = Math.round((data.formFactors[formFactor][metric].good / data.formFactors[formFactor][metric].total) * 100);
            if (!scores[metric]) scores[metric] = { total: 0, count: 0 };
            scores[metric].total += goodPercentage;
            scores[metric].count += 1;
            totalScore += goodPercentage;
            totalMetrics += 1;
          }
        });
      }
    });
    
    // Calculate average scores per metric
    const metricScores = {};
    Object.keys(scores).forEach(metric => {
      metricScores[metric] = Math.round(scores[metric].total / scores[metric].count);
    });
    
    return {
      score: totalMetrics > 0 ? Math.round(totalScore / totalMetrics) : 0,
      metrics: metricScores
    };
  };
  
  // Render a summary chart to display the overall Core Web Vitals score
  const renderSummaryChart = (data) => {
    if (!data || !data.success) return null;
    
    const overallScore = calculateOverallScore(data);
    
    // Define colors based on score ranges
    const getScoreColor = (score) => {
      if (score >= 75) return '#10B981'; // green
      if (score >= 50) return '#F59E0B'; // yellow
      return '#EF4444'; // red
    };
    
    const overallColor = getScoreColor(overallScore.score);
    
    // Prepare data for the metrics bar chart
    const metricLabels = {
      lcp: 'Largest Contentful Paint',
      cls: 'Cumulative Layout Shift',
      inp: 'Interaction to Next Paint',
      fid: 'First Input Delay',
      ttfb: 'Time to First Byte'
    };
    
    const metricScores = Object.entries(overallScore.metrics).map(([key, value]) => ({
      name: metricLabels[key] || key.toUpperCase(),
      shortName: key.toUpperCase(),
      score: value,
      color: getScoreColor(value)
    }));
    
    return (
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-100 mb-2">Performance Overview</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">REAL USER METRICS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-2" style={{ color: overallColor }}>
                {overallScore.score}
              </div>
              <div className="text-sm text-slate-400 font-medium">Overall Score</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {data.recordCount ? Math.floor(data.recordCount / 1000) + 'K' : '0'}
              </div>
              <div className="text-sm text-slate-400 font-medium">User Samples</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {Object.keys(overallScore.metrics).length}
              </div>
              <div className="text-sm text-slate-400 font-medium">Metrics Analyzed</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">28</div>
              <div className="text-sm text-slate-400 font-medium">Days Period</div>
            </div>
          </div>

          {/* Metrics Performance Chart */}
          <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
            <h4 className="text-xl font-bold text-slate-100 mb-6">Core Metrics Performance</h4>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricScores} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="shortName" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#e2e8f0',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                    formatter={(value, name, props) => [
                      `${value}% Good`, 
                      props.payload.name
                    ]}
                  />
                  <Bar 
                    dataKey="score" 
                    radius={[4, 4, 0, 0]}
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-950" style={{ backgroundColor: '#020617', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="mb-12 p-8 bg-gradient-to-br from-blue-950/30 via-slate-900/40 to-slate-950/30 border border-blue-800/30 rounded-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-100 mb-2">Core Web Vitals Intelligence</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950/50 rounded-full border border-blue-700/30">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-semibold tracking-wide">CHROME UX REPORT ANALYSIS</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
              Real user performance metrics from Chrome UX Report providing comprehensive insights into loading performance, 
              interactivity, and visual stability across all devices and network conditions.
            </p>
          </div>
        </div>

        {isAnalyzingCoreWebVitals ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-spin opacity-20"></div>
                <div className="absolute inset-2 rounded-full bg-slate-950"></div>
                <div className="absolute inset-6 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-blue-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Analyzing Core Web Vitals...</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Fetching real user performance data from Chrome UX Report across mobile, desktop, and tablet devices
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : coreWebVitalsResult ? (
          <div className="space-y-8">
            {coreWebVitalsResult.success ? (
              <>
                {renderSummaryChart(coreWebVitalsResult)}
                <CoreWebVitalsDisplay data={coreWebVitalsResult} />
              </>
            ) : (
              <div className="text-center py-20">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-2xl border border-red-800/30 flex items-center justify-center">
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-4">Core Web Vitals Analysis Failed</h3>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  {coreWebVitalsResult.message || 'Unable to fetch performance data from Chrome UX Report. The website may not have sufficient traffic data.'}
                </p>
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-slate-600 rounded-xl blur opacity-60"></div>
                  <button
                    onClick={handleAnalyzeCoreWebVitals}
                    disabled={isAnalyzingCoreWebVitals}
                    className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-slate-700 text-white text-lg font-bold rounded-xl hover:from-blue-500 hover:to-slate-600 transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-5 h-5 inline mr-2" />
                    {isAnalyzingCoreWebVitals ? 'Analyzing...' : 'Retry Analysis'}
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
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Ready for Performance Analysis</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Switch to the Core Web Vitals tab to begin comprehensive analysis of real user performance metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Core Web Vitals Display Component with Bar Charts
const CoreWebVitalsDisplay = ({ data }) => {
  const renderMetricCard = (title, metric, color = 'blue', unit = 'ms') => {
    if (!metric || metric.total === 0) return null;
    
    const goodPercentage = Math.round((metric.good / metric.total) * 100);
    const needsImprovementPercentage = Math.round((metric.needsImprovement / metric.total) * 100);
    const poorPercentage = Math.round((metric.poor / metric.total) * 100);
    
    const getScoreColor = (percentage) => {
      if (percentage >= 75) return '#10B981'; // green
      if (percentage >= 50) return '#F59E0B'; // yellow
      return '#EF4444'; // red
    };

    const scoreColor = getScoreColor(goodPercentage);
    
    // Prepare data for horizontal bar chart
    const chartData = [
      { name: 'Good', value: goodPercentage, color: '#10B981' },
      { name: 'Needs Improvement', value: needsImprovementPercentage, color: '#F59E0B' },
      { name: 'Poor', value: poorPercentage, color: '#EF4444' }
    ].filter(item => item.value > 0);

    const colorClasses = {
      blue: 'from-blue-950/30 to-slate-900/40 border-blue-800/30',
      green: 'from-green-950/30 to-slate-900/40 border-green-800/30',
      purple: 'from-purple-950/30 to-slate-900/40 border-purple-800/30',
      yellow: 'from-yellow-950/30 to-slate-900/40 border-yellow-800/30',
      red: 'from-red-950/30 to-slate-900/40 border-red-800/30'
    };

    const iconComponents = {
      'Largest Contentful Paint (LCP)': <Clock className="w-6 h-6" />,
      'Cumulative Layout Shift (CLS)': <Target className="w-6 h-6" />,
      'Interaction to Next Paint (INP)': <Activity className="w-6 h-6" />,
      'First Input Delay (FID)': <Zap className="w-6 h-6" />,
      'Time to First Byte (TTFB)': <TrendingUp className="w-6 h-6" />
    };

    return (
      <div className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md hover:scale-105 transition-all duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : color === 'green' ? 'bg-green-500/10 border-green-500/20 text-green-400' : color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {iconComponents[title] || <Activity className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-100">{title}</h4>
                <p className="text-sm text-slate-400">{metric.p75.toFixed(0)}{unit} (75th percentile)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1" style={{ color: scoreColor }}>
                {goodPercentage}%
              </div>
              <div className="text-xs text-slate-400">Good</div>
            </div>
          </div>
          
          {/* Horizontal Bar Chart */}
          <div className="mb-4">
            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`${value}%`, 'Percentage']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Bar key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Performance Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40 text-center">
              <div className="text-lg font-bold text-green-400">{goodPercentage}%</div>
              <div className="text-xs text-slate-400">Good</div>
            </div>
            <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40 text-center">
              <div className="text-lg font-bold text-yellow-400">{needsImprovementPercentage}%</div>
              <div className="text-xs text-slate-400">Needs Work</div>
            </div>
            <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40 text-center">
              <div className="text-lg font-bold text-red-400">{poorPercentage}%</div>
              <div className="text-xs text-slate-400">Poor</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFormFactorSection = (title, metrics, icon, description) => {
    if (!metrics) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {icon}
            <h3 className="text-3xl font-bold text-slate-100">{title}</h3>
          </div>
          <p className="text-xl text-slate-400">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderMetricCard('Largest Contentful Paint (LCP)', metrics.lcp, 'blue', 'ms')}
          {renderMetricCard('Cumulative Layout Shift (CLS)', metrics.cls, 'purple', '')}
          {renderMetricCard('Interaction to Next Paint (INP)', metrics.inp, 'green', 'ms')}
          {renderMetricCard('First Input Delay (FID)', metrics.fid, 'yellow', 'ms')}
          {renderMetricCard('Time to First Byte (TTFB)', metrics.ttfb, 'red', 'ms')}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Overall Score */}
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Core Web Vitals Assessment</h3>
              <p className="text-slate-400">Based on {data.recordCount?.toLocaleString()} real user sessions from Chrome UX Report</p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold mb-2 ${
                data.summary?.overallScore >= 90 ? 'text-green-400' : 
                data.summary?.overallScore >= 75 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {data.summary?.overallScore || 0}
              </div>
              <div className="text-sm text-slate-400">
                {data.summary?.status || 'Unknown'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Coverage Period</span>
                <span className="font-semibold text-slate-200">28 Days</span>
              </div>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Data Source</span>
                <span className="font-semibold text-slate-200">Chrome UX Report</span>
              </div>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Analysis Date</span>
                <span className="font-semibold text-slate-200">{new Date(data.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Performance */}
      {renderFormFactorSection(
        'Mobile Performance Analysis',
        data.formFactors?.mobile,
        <Smartphone className="w-8 h-8 text-blue-400" />,
        'Performance metrics from mobile device users - the primary focus for Core Web Vitals'
      )}

      {/* Desktop Performance */}
      {renderFormFactorSection(
        'Desktop Performance Analysis',
        data.formFactors?.desktop,
        <Monitor className="w-8 h-8 text-green-400" />,
        'Performance metrics from desktop users with typically faster connections and processing power'
      )}

      {/* Tablet Performance */}
      {renderFormFactorSection(
        'Tablet Performance Analysis',
        data.formFactors?.tablet,
        <Tablet className="w-8 h-8 text-purple-400" />,
        'Performance metrics from tablet users representing mid-range device capabilities'
      )}

      {/* Recommendations */}
      {data.summary?.recommendations && data.summary.recommendations.length > 0 && (
        <div className="group relative p-8 bg-gradient-to-br from-green-950/30 to-slate-900/40 rounded-2xl border border-green-800/30 backdrop-blur-md hover:border-green-700/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative">
            <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              Performance Recommendations
            </h3>
            
            <div className="space-y-4">
              {data.summary.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium mb-1">Optimization Opportunity</p>
                    <p className="text-slate-400 text-sm">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Information */}
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Analysis Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Time Period</span>
                <span className="text-slate-200 font-medium">Last 28 Days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Origin Coverage</span>
                <span className="text-slate-200 font-medium">{data.origin || data.url || 'Website'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Analysis Timestamp</span>
                <span className="text-slate-200 font-medium">{new Date(data.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">User Sessions</span>
                <span className="text-slate-200 font-medium">{data.recordCount?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-950/20 rounded-xl border border-blue-800/30">
            <h4 className="text-lg font-bold text-blue-200 mb-3">About Chrome UX Report Data</h4>
            <div className="text-sm text-slate-300 space-y-2">
              <p>• Real user metrics collected from Chrome browsers with user consent</p>
              <p>• Data aggregated across all users visiting your site over the last 28 days</p>
              <p>• Form factors include mobile, desktop, and tablet devices</p>
              <p>• Metrics represent actual user experience, not synthetic lab tests</p>
              <p>• Data is updated monthly and may have a delay of 1-2 weeks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreWebVitalsTab;