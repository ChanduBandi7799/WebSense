import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MobileFriendlyTab = ({ 
  mobileFriendlyData, 
  mobileFriendlyAnalysisStatus, 
  mobileFriendlyError 
}) => {
  const renderIssue = (issue, index) => (
    <div key={index} className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <span className="text-red-800 font-medium">{issue}</span>
    </div>
  );

  const renderScreenshot = (screenshot, index) => (
    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h5 className="font-medium text-gray-800 mb-2">{screenshot.description}</h5>
      <img 
        src={`data:${screenshot.mimeType};base64,${screenshot.data}`} 
        alt="Mobile view screenshot"
        className="w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-sm"
      />
    </div>
  );

  return (
    <>
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="text-orange-800 font-medium mb-2">Mobile-Friendly Test</h4>
        <p className="text-orange-700 text-sm">
          Test if a website is mobile-friendly by analyzing viewport settings, responsive design, 
          text readability, and other mobile-specific factors using Google's Mobile-Friendly Test API.
        </p>
      </div>
      
      {mobileFriendlyAnalysisStatus === 'loading' ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Mobile Friendliness...</h3>
          <p className="text-gray-500">Please wait while we check if this website is mobile-friendly.</p>
        </div>
      ) : mobileFriendlyAnalysisStatus === 'success' && mobileFriendlyData ? (
        <div className="space-y-6">
          {mobileFriendlyData.success ? (
            <MobileFriendlyDisplay data={mobileFriendlyData} />
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
              <p className="text-gray-500 mb-4">
                {mobileFriendlyResult.message}
              </p>
              <button
                onClick={handleAnalyzeMobileFriendly}
                disabled={isAnalyzingMobileFriendly}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isAnalyzingMobileFriendly ? 'Analyzing...' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Click Mobile-Friendly Tab to Analyze</h3>
          <p className="text-gray-500">Switch to the Mobile-Friendly tab to automatically analyze mobile-friendliness.</p>
        </div>
      )}
    </>
  );
};

// Mobile-Friendly Display Component
const MobileFriendlyDisplay = ({ data }) => {
  const renderIssue = (issue, index) => (
    <div key={index} className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <span className="text-red-800 font-medium">{issue}</span>
    </div>
  );

  const renderScreenshot = (screenshot, index) => (
    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h5 className="font-medium text-gray-800 mb-2">{screenshot.description}</h5>
      <img 
        src={`data:${screenshot.mimeType};base64,${screenshot.data}`} 
        alt="Mobile view screenshot"
        className="w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mobile-Friendliness Verdict */}
      <div className={`border rounded-lg p-6 ${
        data.verdict === 'MOBILE_FRIENDLY' 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
      }`}>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/3 mb-4 md:mb-0 flex justify-center">
            <MobileFriendlyGauge isMobileFriendly={data.verdict === 'MOBILE_FRIENDLY'} />
          </div>
          <div className="w-full md:w-2/3 pl-0 md:pl-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mobile-Friendliness Verdict</h3>
            <div className={`text-xl font-bold mb-2 ${data.verdict === 'MOBILE_FRIENDLY' ? 'text-green-600' : 'text-red-600'}`}>
              {data.verdict === 'MOBILE_FRIENDLY' ? 'Mobile-Friendly' : 'Not Mobile-Friendly'}
            </div>
            <p className="text-gray-600 mb-3">
              {data.verdict === 'MOBILE_FRIENDLY' 
                ? 'Great job! Your website is optimized for mobile devices.'
                : 'Your website needs improvements to be fully mobile-friendly.'}
            </p>
            <div className="text-sm text-gray-600">
              <p>Mobile-friendly websites provide better user experience on smartphones and tablets, and may rank higher in mobile search results.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {data.issues && data.issues.length > 0 && (
        <div className="border rounded-lg p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Issues Found</h3>
          <div className="space-y-4">
            {data.issues.map((issue, index) => {
              // Determine issue type and provide detailed explanation
              let explanation = '';
              let icon = '⚠️';
              
              if (issue.includes('viewport')) {
                explanation = 'The viewport meta tag controls how your page is displayed on mobile devices. Without proper viewport settings, your page may appear too small or require horizontal scrolling.';
                icon = '📱';
              } else if (issue.includes('text too small')) {
                explanation = 'Small text is difficult to read on mobile devices. Users should not have to zoom to read your content. Use a minimum font size of 16px for body text.';
                icon = '🔍';
              } else if (issue.includes('clickable elements')) {
                explanation = 'Touch targets (buttons, links) should be at least 48px by 48px and have adequate spacing to prevent accidental taps on the wrong element.';
                icon = '👆';
              } else if (issue.includes('content wider')) {
                explanation = 'Content that extends beyond the viewport forces users to scroll horizontally, creating a poor mobile experience. Ensure all content fits within the viewport width.';
                icon = '↔️';
              } else if (issue.includes('Flash')) {
                explanation = 'Flash content is not supported on most mobile devices and should be replaced with HTML5 alternatives.';
                icon = '⚡';
              } else if (issue.includes('font')) {
                explanation = 'Custom fonts may not display correctly on all mobile devices. Ensure you provide fallback fonts and test on multiple devices.';
                icon = '🔤';
              } else if (issue.includes('plugin')) {
                explanation = 'Mobile browsers often don\'t support plugins like Java or Silverlight. Use standard web technologies instead.';
                icon = '🔌';
              }
              
              return (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                  <div className="flex items-start">
                    <div className="text-xl mr-3">{icon}</div>
                    <div>
                      <p className="font-medium text-gray-800">{issue}</p>
                      {explanation && (
                        <p className="text-gray-600 mt-1 text-sm">{explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {data.screenshots && data.screenshots.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Mobile View Screenshots</h4>
          <div className="space-y-4">
            {data.screenshots.map((screenshot, index) => renderScreenshot(screenshot, index))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
        <div className="space-y-4">
          {data.verdict === 'MOBILE_FRIENDLY' ? (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <span className="text-green-500 mr-2">✓</span> Your website is mobile-friendly!
              </h4>
              <p className="text-gray-700 mt-2">
                Continue to monitor and test as you make updates. Here are some additional tips to maintain and improve your mobile experience:
              </p>
              <ul className="mt-3 space-y-2 pl-6 list-disc text-gray-700">
                <li>Regularly test on various mobile devices and screen sizes</li>
                <li>Consider implementing Accelerated Mobile Pages (AMP) for even faster loading</li>
                <li>Optimize images further to reduce loading times on mobile networks</li>
                <li>Ensure touch targets remain large enough (at least 48px × 48px)</li>
                <li>Test your site's performance using tools like Google PageSpeed Insights</li>
              </ul>
            </div>
          ) : (
            <div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 mb-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <span className="text-amber-500 mr-2">⚠️</span> Priority Fixes
                </h4>
                <p className="text-gray-700 mt-2">
                  Address these issues first to significantly improve your mobile experience:
                </p>
                <ul className="mt-3 space-y-2 pl-6 list-disc text-gray-700">
                  <li><strong>Configure the viewport</strong> - Add <code className="bg-gray-100 px-2 py-1 rounded text-sm">{'<meta name="viewport" content="width=device-width, initial-scale=1">'}</code> to your HTML head</li>
                  <li><strong>Size content to viewport</strong> - Use relative width values (%, vw) instead of fixed pixel widths</li>
                  <li><strong>Use readable font sizes</strong> - Minimum 16px for body text without requiring zoom</li>
                  <li><strong>Size tap targets appropriately</strong> - Make buttons and links at least 48px × 48px with adequate spacing</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <span className="text-blue-500 mr-2">💡</span> Additional Recommendations
                </h4>
                <ul className="mt-3 space-y-2 pl-6 list-disc text-gray-700">
                  <li>Implement responsive design principles throughout your site</li>
                  <li>Test on multiple devices and browsers to ensure compatibility</li>
                  <li>Optimize images for mobile to reduce loading times</li>
                  <li>Consider a mobile-first approach for future development</li>
                  <li>Use Google's <a href="https://search.google.com/test/mobile-friendly" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mobile-Friendly Test</a> regularly to monitor improvements</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-blue-100">
            <p>
              <strong>Note:</strong> Mobile-friendliness is a ranking factor for Google's mobile search results. Improving your mobile experience can help with SEO and user engagement metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Details Breakdown */}
      {data.details && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.details).map(([key, value]) => (
              <div key={key} className={`p-3 rounded-lg border ${
                value ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className={`text-sm font-medium ${
                    value ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {value ? 'Issue Found' : 'Passed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile-Friendly Gauge Component
const MobileFriendlyGauge = ({ isMobileFriendly }) => {
  // Colors based on mobile-friendliness
  const color = isMobileFriendly ? '#10B981' : '#EF4444'; // green or red
  
  // Create gauge chart data
  const gaugeData = [
    { name: 'Score', value: 1 },
  ];

  return (
    <div className="w-full" style={{ height: '180px' }}>
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
            <Cell fill={color} />
          </Pie>
          {/* Icon in the center */}
          <svg x="37.5%" y="25%" width="25%" height="50%" viewBox="0 0 24 24">
            {isMobileFriendly ? (
              // Mobile phone with checkmark
              <g>
                <path fill={color} d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
                <path fill={color} d="M12,18A1.5,1.5 0 0,1 10.5,16.5A1.5,1.5 0 0,1 12,15A1.5,1.5 0 0,1 13.5,16.5A1.5,1.5 0 0,1 12,18M12,6A1,1 0 0,1 11,5A1,1 0 0,1 12,4A1,1 0 0,1 13,5A1,1 0 0,1 12,6" />
                <circle fill="white" cx="15" cy="10" r="6" />
                <path fill={color} d="M15,4A6,6 0 0,1 21,10A6,6 0 0,1 15,16A6,6 0 0,1 9,10A6,6 0 0,1 15,4M15,6A4,4 0 0,0 11,10A4,4 0 0,0 15,14A4,4 0 0,0 19,10A4,4 0 0,0 15,6M14.3,8.7L15.7,10.1L18,7.8L19.4,9.2L15.7,12.9L12.9,10.1L14.3,8.7Z" />
              </g>
            ) : (
              // Mobile phone with X mark
              <g>
                <path fill={color} d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
                <path fill={color} d="M12,18A1.5,1.5 0 0,1 10.5,16.5A1.5,1.5 0 0,1 12,15A1.5,1.5 0 0,1 13.5,16.5A1.5,1.5 0 0,1 12,18M12,6A1,1 0 0,1 11,5A1,1 0 0,1 12,4A1,1 0 0,1 13,5A1,1 0 0,1 12,6" />
                <circle fill="white" cx="15" cy="10" r="6" />
                <path fill={color} d="M15,4A6,6 0 0,1 21,10A6,6 0 0,1 15,16A6,6 0 0,1 9,10A6,6 0 0,1 15,4M15,6A4,4 0 0,0 11,10A4,4 0 0,0 15,14A4,4 0 0,0 19,10A4,4 0 0,0 15,6M12.59,13.41L15,11L17.41,13.41L18.83,12L16.41,9.59L18.83,7.17L17.41,5.76L15,8.17L12.59,5.76L11.17,7.17L13.59,9.59L11.17,12L12.59,13.41Z" />
              </g>
            )}
          </svg>
          {/* Status text below icon */}
          <text
            x="50%"
            y="75%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium"
            fill={color}
          >
            {isMobileFriendly ? 'PASSED' : 'FAILED'}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MobileFriendlyTab;