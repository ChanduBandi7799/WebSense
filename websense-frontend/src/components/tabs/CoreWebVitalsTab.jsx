import React from 'react';

const CoreWebVitalsTab = ({ 
  isAnalyzingCoreWebVitals, 
  coreWebVitalsResult, 
  handleAnalyzeCoreWebVitals 
}) => {
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
      lcp: 'LCP',
      cls: 'CLS',
      inp: 'INP',
      fid: 'FID',
      ttfb: 'TTFB'
    };
    
    const metricScores = Object.entries(overallScore.metrics).map(([key, value]) => ({
      name: metricLabels[key] || key.toUpperCase(),
      score: value,
      color: getScoreColor(value)
    }));
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Performance Summary</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          {/* Overall score gauge */}
          <div className="relative w-40 h-40 mb-4 md:mb-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              
              {/* Score arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={overallColor}
                strokeWidth="10"
                strokeDasharray={`${overallScore.score * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              
              {/* Score text */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill={overallColor}
              >
                {overallScore.score}
              </text>
              
              <text
                x="50"
                y="65"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#6b7280"
              >
                Score
              </text>
            </svg>
          </div>
          
          {/* Metrics bar chart */}
          <div className="flex-1 ml-0 md:ml-8">
            <div className="space-y-4">
              {metricScores.map(metric => (
                <div key={metric.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{metric.name}</span>
                    <span className="font-medium" style={{ color: metric.color }}>{metric.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ width: `${metric.score}%`, backgroundColor: metric.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Good (75-100%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Needs Improvement (50-74%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Poor (0-49%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-green-800 font-medium mb-2">Core Web Vitals (CrUX)</h4>
        <p className="text-green-700 text-sm">
          Real user performance metrics from Chrome UX Report. Shows how your site performs for actual users across devices, networks, and locations.
        </p>
      </div>
      
      {isAnalyzingCoreWebVitals ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Core Web Vitals...</h3>
          <p className="text-gray-500">Please wait while we fetch real user performance data from Chrome UX Report.</p>
        </div>
      ) : coreWebVitalsResult ? (
        <div className="space-y-6">
          {coreWebVitalsResult.success ? (
            <>
              {renderSummaryChart(coreWebVitalsResult)}
              <CoreWebVitalsDisplay data={coreWebVitalsResult} />
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
              <p className="text-gray-500 mb-4">
                {coreWebVitalsResult.message}
              </p>
              <button
                onClick={handleAnalyzeCoreWebVitals}
                disabled={isAnalyzingCoreWebVitals}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isAnalyzingCoreWebVitals ? 'Analyzing...' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Click Core Web Vitals Tab to Analyze</h3>
          <p className="text-gray-500">Switch to the Core Web Vitals tab to automatically analyze real user performance metrics.</p>
        </div>
      )}
    </>
  );
};

// Core Web Vitals Display Component
const CoreWebVitalsDisplay = ({ data }) => {
  const renderMetricCard = (title, metric, color = 'blue', unit = 'ms') => {
    if (!metric || metric.total === 0) return null;
    
    const goodPercentage = Math.round((metric.good / metric.total) * 100);
    const needsImprovementPercentage = Math.round((metric.needsImprovement / metric.total) * 100);
    const poorPercentage = Math.round((metric.poor / metric.total) * 100);
    
    const getScoreColor = (percentage) => {
      if (percentage >= 75) return 'text-green-600';
      if (percentage >= 50) return 'text-yellow-600';
      return 'text-red-600';
    };

    // Data for pie chart
    const chartData = [
      { name: 'Good', value: goodPercentage, color: '#10B981' },
      { name: 'Needs Improvement', value: needsImprovementPercentage, color: '#F59E0B' },
      { name: 'Poor', value: poorPercentage, color: '#EF4444' }
    ];

    return (
      <div className={`border rounded-lg p-4 bg-${color}-50 border-${color}-200`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800">{title}</h4>
          <span className={`text-lg font-bold ${getScoreColor(goodPercentage)}`}>
            {goodPercentage}%
          </span>
        </div>
        
        {/* Pie Chart Visualization */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-24 h-24 relative">
            {chartData.map((segment, index) => {
              // Calculate the segment angles for the pie chart
              const total = chartData.reduce((sum, item) => sum + item.value, 0);
              const startAngle = chartData.slice(0, index).reduce((sum, item) => sum + (item.value / total) * 360, 0);
              const endAngle = startAngle + (segment.value / total) * 360;
              
              // Skip segments with 0 value
              if (segment.value === 0) return null;
              
              return (
                <div 
                  key={segment.name}
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(${segment.color} ${startAngle}deg, ${segment.color} ${endAngle}deg, transparent ${endAngle}deg)`,
                    clipPath: 'circle(50%)',
                  }}
                />
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-xs font-medium">{metric.p75.toFixed(0)}{unit}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {chartData.map(segment => (
              <div key={segment.name} className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: segment.color }}></div>
                <span className="text-xs">{segment.name}: {segment.value}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Good: {goodPercentage}%</span>
            <span>{metric.p75.toFixed(0)}{unit} (75th percentile)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${goodPercentage}%` }}></div>
            <div className="bg-yellow-500 h-2 rounded-full -mt-2" style={{ width: `${needsImprovementPercentage}%`, marginLeft: `${goodPercentage}%` }}></div>
            <div className="bg-red-500 h-2 rounded-full -mt-2" style={{ width: `${poorPercentage}%`, marginLeft: `${goodPercentage + needsImprovementPercentage}%` }}></div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Needs Improvement: {needsImprovementPercentage}%</span>
            <span>Poor: {poorPercentage}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFormFactorSection = (title, metrics, icon) => {
    if (!metrics) return null;
    
    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          {icon}
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={`border rounded-lg p-6 ${
        data.summary.overallScore >= 90 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : data.summary.overallScore >= 75
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
          : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Core Web Vitals Score</h3>
            <p className="text-gray-600">Based on real user data from Chrome UX Report</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${
              data.summary.overallScore >= 90 ? 'text-green-600' : 
              data.summary.overallScore >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {data.summary.overallScore}/100
            </div>
            <div className="text-sm text-gray-600">
              {data.summary.status}
            </div>
          </div>
        </div>
      </div>

      {/* Data Coverage */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Data Coverage</h4>
        <p className="text-blue-700 text-sm">
          Analysis based on {data.recordCount.toLocaleString()} real user page views from Chrome users over the last 28 days.
        </p>
      </div>

      {/* Mobile Metrics (Primary) */}
      {renderFormFactorSection(
        'Mobile Performance (Primary)',
        data.formFactors.mobile,
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      )}

      {/* Desktop Metrics */}
      {renderFormFactorSection(
        'Desktop Performance',
        data.formFactors.desktop,
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      )}

      {/* Tablet Metrics */}
      {renderFormFactorSection(
        'Tablet Performance',
        data.formFactors.tablet,
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      )}

      {/* Recommendations */}
      {data.summary.recommendations && data.summary.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <ul className="space-y-2">
              {data.summary.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-green-800">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Analysis Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Analysis Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Data source: Chrome UX Report (CrUX) - Real user metrics</p>
          <p>• Time period: Last 28 days</p>
          <p>• Coverage: {data.origin || data.url}</p>
          <p>• Analysis timestamp: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default CoreWebVitalsTab;