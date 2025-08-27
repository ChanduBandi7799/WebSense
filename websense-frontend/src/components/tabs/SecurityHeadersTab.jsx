import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SecurityHeadersTab = ({ 
  securityHeadersData, 
  securityHeadersAnalysisStatus, 
  securityHeadersError 
}) => {
  return (
    <>
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-red-800 font-medium mb-2">Security Headers Analysis</h4>
        <p className="text-red-700 text-sm">
          Check if a website has essential HTTP security headers to protect against various attacks 
          like XSS, clickjacking, and downgrade attacks.
        </p>
      </div>
      
      {securityHeadersAnalysisStatus === 'loading' ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Security Headers...</h3>
          <p className="text-gray-500">Please wait while we analyze the security headers.</p>
        </div>
      ) : securityHeadersAnalysisStatus === 'success' && securityHeadersData ? (
        <div className="space-y-6">
          {securityHeadersData.success ? (
            <SecurityHeadersDisplay data={securityHeadersData} />
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
              <p className="text-gray-500 mb-4">
                {securityHeadersData.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Click Security Headers Tab to Analyze</h3>
              <p className="text-gray-500">Switch to the Security Headers tab to automatically analyze the security headers.</p>
            </div>
          )}
        </>
      )};
      const SecurityHeadersDisplay = ({ data }) => {
  const renderHeaderStatus = (header, title, description) => {
    const isPresent = header.present;
    const statusIcon = isPresent ? '✓' : '✗';
    
    return (
      <div className={`p-4 rounded-lg border ${
        isPresent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <h5 className={`font-medium ${isPresent ? 'text-green-800' : 'text-red-800'}`}>
            {title}
          </h5>
          <span className={`text-lg font-bold ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
            {statusIcon}
          </span>
        </div>
        <p className={`text-sm mb-2 ${isPresent ? 'text-green-700' : 'text-red-700'}`}>
          {header.description}
        </p>
        {header.value && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-1">Header Value:</p>
            <code className="text-xs bg-gray-100 p-2 rounded block break-all">
              {header.value}
            </code>
          </div>
        )}
        <p className={`text-xs mt-2 ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
          {header.recommendation}
        </p>
      </div>
    );
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSecurityScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Security Score Summary */}
      <div className={`p-4 rounded-lg border ${getSecurityScoreBg(data.summary.securityScore)}`}>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <SecurityScoreGauge score={data.summary.securityScore} status={data.summary.overallStatus} />
          </div>
          <div className="w-full md:w-2/3 pl-0 md:pl-6">
            <h4 className="font-medium text-gray-800 mb-3">Security Score</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Score:</span>
                <span className={`text-xl font-bold ${getSecurityScoreColor(data.summary.securityScore)}`}>
                  {data.summary.securityScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Security Headers:</span>
                <span className="font-medium">
                  {data.summary.totalHeaders} of 6 present
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${getSecurityScoreColor(data.summary.securityScore)}`}>
                  {data.summary.overallStatus}
                </span>
              </div>
              <div className="pt-2 text-sm text-gray-600">
                <p>Security headers protect your website from common web vulnerabilities and attacks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HTTPS Status */}
      <div className={`p-4 rounded-lg border ${
        data.https.enabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`font-medium ${data.https.enabled ? 'text-green-800' : 'text-red-800'}`}>
            HTTPS / SSL
          </h4>
          <span className={`text-lg font-bold ${data.https.enabled ? 'text-green-600' : 'text-red-600'}`}>
            {data.https.enabled ? '✓' : '✗'}
          </span>
        </div>
        <p className={`text-sm ${data.https.enabled ? 'text-green-700' : 'text-red-700'}`}>
          {data.https.description}
        </p>
      </div>

      {/* Security Headers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderHeaderStatus(data.hsts, 'Strict-Transport-Security (HSTS)', 'Prevents downgrade attacks')}
        {renderHeaderStatus(data.csp, 'Content-Security-Policy (CSP)', 'Prevents XSS attacks')}
        {renderHeaderStatus(data.xFrameOptions, 'X-Frame-Options', 'Prevents clickjacking')}
        {renderHeaderStatus(data.xContentTypeOptions, 'X-Content-Type-Options', 'Blocks MIME sniffing')}
        {renderHeaderStatus(data.referrerPolicy, 'Referrer-Policy', 'Protects sensitive referral data')}
        {renderHeaderStatus(data.permissionsPolicy, 'Permissions-Policy', 'Restricts features like camera/microphone')}
      </div>

      {/* Recommendations */}
      {data.summary.recommendations.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-3">Security Recommendations</h4>
          <div className="space-y-4">
            {!data.hsts.present && (
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">Add Strict-Transport-Security Header</h5>
                <p className="text-sm text-yellow-700 mb-2">HSTS prevents downgrade attacks by telling browsers to always use HTTPS.</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
                </code>
              </div>
            )}
            
            {!data.csp.present && (
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">Add Content-Security-Policy Header</h5>
                <p className="text-sm text-yellow-700 mb-2">CSP helps prevent XSS attacks by controlling which resources can be loaded.</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  Content-Security-Policy: default-src 'self'; script-src 'self' trusted-scripts.com; img-src *
                </code>
              </div>
            )}
            
            {!data.xFrameOptions.present && (
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">Add X-Frame-Options Header</h5>
                <p className="text-sm text-yellow-700 mb-2">Prevents clickjacking attacks by controlling if a page can be displayed in frames.</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  X-Frame-Options: DENY
                </code>
              </div>
            )}
            
            {!data.xContentTypeOptions.present && (
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">Add X-Content-Type-Options Header</h5>
                <p className="text-sm text-yellow-700 mb-2">Prevents MIME type sniffing which can lead to security vulnerabilities.</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  X-Content-Type-Options: nosniff
                </code>
              </div>
            )}
            
            {!data.referrerPolicy.present && (
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">Add Referrer-Policy Header</h5>
                <p className="text-sm text-yellow-700 mb-2">Controls how much referrer information is included with requests.</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  Referrer-Policy: strict-origin-when-cross-origin
                </code>
              </div>
            )}
            
            {!data.permissionsPolicy.present && (
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">Add Permissions-Policy Header</h5>
                <p className="text-sm text-yellow-700 mb-2">Controls which browser features and APIs can be used on your site.</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Analysis Summary</h4>
        <div className="text-sm text-gray-600">
          <p>Analysis completed at: {new Date(data.timestamp).toLocaleString()}</p>
          <p>Website URL: {data.url}</p>
          <p>Overall Security Status: <span className="font-medium">{data.summary.overallStatus}</span></p>
        </div>
      </div>
    </div>
  );
};
// Security Score Gauge Component
const SecurityScoreGauge = ({ score, status }) => {
  // Colors for different score ranges
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#FBBF24'; // yellow
    if (score >= 40) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  // Create gauge chart data
  const createGaugeData = (score) => {
    return [
      { name: 'Score', value: score },
      { name: 'Remaining', value: 100 - score }
    ];
  };

  const gaugeData = createGaugeData(score);
  const scoreColor = getScoreColor(score);

  return (
    <div className="w-full" style={{ height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            cornerRadius={5}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell key="score" fill={scoreColor} />
            <Cell key="remaining" fill="#E5E7EB" /> {/* light gray */}
          </Pie>
          <Tooltip content={<></>} /> {/* Empty tooltip */}
          {/* Score text in the center */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            fill={scoreColor}
          >
            {score}
          </text>
          {/* Status text below score */}
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs"
            fill="#6B7280" // gray-500
          >
            {status}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SecurityHeadersTab;