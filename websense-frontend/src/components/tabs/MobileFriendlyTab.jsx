import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Smartphone, Monitor, AlertTriangle, CheckCircle, Eye, Shield, Zap, Activity, Sparkles, Settings } from 'lucide-react';

const MobileFriendlyTab = ({ 
  mobileFriendlyData, 
  mobileFriendlyAnalysisStatus, 
  mobileFriendlyError 
}) => {
  const [analyzing, setAnalyzing] = useState(false);

  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

  const handleAnalyzeMobileFriendly = async () => {
    setAnalyzing(true);
    try {
      // Your mobile analysis logic here
    } catch (error) {
      console.error('Mobile analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const isAnalyzingMobileFriendly = () => {
    return analyzing;
  };

  return (
    <div className="min-h-screen bg-slate-950" style={{ backgroundColor: '#020617', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="mb-12 p-8 bg-gradient-to-br from-green-950/30 via-slate-900/40 to-slate-950/30 border border-green-800/30 rounded-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <Smartphone className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-100 mb-2">Mobile Friendly Intelligence</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-950/50 rounded-full border border-green-700/30">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-semibold tracking-wide">RESPONSIVE DESIGN ANALYSIS</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
              Comprehensive analysis of mobile responsiveness, user experience optimization, and cross-device compatibility. 
              Get detailed insights into viewport configuration, touch targets, and mobile-specific performance metrics.
            </p>
          </div>
        </div>

        {mobileFriendlyAnalysisStatus === 'loading' ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-spin opacity-20"></div>
                <div className="absolute inset-2 rounded-full bg-slate-950"></div>
                <div className="absolute inset-6 flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-green-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Analyzing Mobile Friendliness...</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Scanning responsive design patterns and mobile optimization techniques across all device breakpoints
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : mobileFriendlyAnalysisStatus === 'success' && mobileFriendlyData ? (
          <div className="space-y-6">
            {mobileFriendlyData.success ? (
              <MobileFriendlyDisplay data={mobileFriendlyData} />
            ) : (
              <div className="text-center py-20">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-2xl border border-red-800/30 flex items-center justify-center">
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-4">Mobile Analysis Failed</h3>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  {mobileFriendlyError || 'Unable to complete mobile friendliness analysis. Please verify the website is accessible and try again.'}
                </p>
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-slate-600 rounded-xl blur opacity-60"></div>
                  <button
                    onClick={handleAnalyzeMobileFriendly}
                    disabled={analyzing}
                    className="relative px-8 py-4 bg-gradient-to-r from-green-600 to-slate-700 text-white text-lg font-bold rounded-xl hover:from-green-500 hover:to-slate-600 transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-5 h-5 inline mr-2" />
                    {analyzing ? 'Analyzing...' : 'Retry Analysis'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-950/40 to-slate-900/40 rounded-2xl border border-green-800/30 flex items-center justify-center">
                <Eye className="w-16 h-16 text-green-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Ready for Mobile Analysis</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Switch to the Mobile-Friendly tab to begin comprehensive analysis of responsive design and mobile optimization
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile-Friendly Display Component
const MobileFriendlyDisplay = ({ data }) => {
  const renderScreenshot = (screenshot, index) => (
    <div key={index} className="group relative p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md hover:border-slate-600/50 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative">
        <h5 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-400" />
          {screenshot.description}
        </h5>
        <div className="bg-slate-900/30 rounded-xl border border-slate-800/40 p-4">
          <img 
            src={`data:${screenshot.mimeType};base64,${screenshot.data}`} 
            alt="Mobile view screenshot"
            className="w-full max-w-md mx-auto border border-slate-700/40 rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Mobile-Friendliness Verdict */}
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-100 mb-2">Mobile Optimization Status</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">RESPONSIVENESS CHECK</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-slate-100">Mobile Status</span>
                {data.verdict === 'MOBILE_FRIENDLY' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className={`text-2xl font-bold mb-2 ${data.verdict === 'MOBILE_FRIENDLY' ? 'text-green-400' : 'text-red-400'}`}>
                {data.verdict === 'MOBILE_FRIENDLY' ? 'Optimized' : 'Needs Work'}
              </div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {data.issues ? data.issues.length : 0}
              </div>
              <div className="text-sm text-slate-400 font-medium">Issues Detected</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {data.screenshots ? data.screenshots.length : 0}
              </div>
              <div className="text-sm text-slate-400 font-medium">Screenshots</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <MobileFriendlyGauge isMobileFriendly={data.verdict === 'MOBILE_FRIENDLY'} />
            </div>
            <div className="w-full md:w-2/3">
              <p className="text-xl text-slate-300 mb-4">
                {data.verdict === 'MOBILE_FRIENDLY' 
                  ? 'Your website demonstrates excellent mobile optimization with responsive design principles and user-friendly mobile experience.'
                  : 'Your website requires mobile optimization improvements to provide better user experience across mobile devices and tablets.'}
              </p>
              <div className="text-sm text-slate-400 p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                <p>Mobile-friendly websites improve user engagement, reduce bounce rates, and perform better in mobile search rankings. Google prioritizes mobile-optimized sites in search results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Analysis */}
      {data.issues && data.issues.length > 0 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Issues & Recommendations</h3>
            <p className="text-xl text-slate-400">Critical mobile optimization issues that need attention</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.issues.map((issue, index) => {
              let explanation = '';
              let icon = <AlertTriangle className="w-6 h-6" />;
              let priority = 'medium';
              
              if (issue.includes('viewport')) {
                explanation = 'The viewport meta tag controls how your page is displayed on mobile devices. Without proper viewport settings, your page may appear too small or require horizontal scrolling.';
                icon = <Smartphone className="w-6 h-6" />;
                priority = 'high';
              } else if (issue.includes('text too small')) {
                explanation = 'Small text is difficult to read on mobile devices. Users should not have to zoom to read your content. Use a minimum font size of 16px for body text.';
                icon = <Eye className="w-6 h-6" />;
                priority = 'high';
              } else if (issue.includes('clickable elements')) {
                explanation = 'Touch targets (buttons, links) should be at least 48px by 48px and have adequate spacing to prevent accidental taps on the wrong element.';
                icon = <Settings className="w-6 h-6" />;
                priority = 'medium';
              } else if (issue.includes('content wider')) {
                explanation = 'Content that extends beyond the viewport forces users to scroll horizontally, creating a poor mobile experience. Ensure all content fits within the viewport width.';
                icon = <Monitor className="w-6 h-6" />;
                priority = 'high';
              }

              const priorityColors = {
                high: 'from-red-950/30 to-slate-900/40 border-red-800/30',
                medium: 'from-orange-950/30 to-slate-900/40 border-orange-800/30',
                low: 'from-yellow-950/30 to-slate-900/40 border-yellow-800/30'
              };

              const iconColors = {
                high: 'bg-red-500/10 border-red-500/20 text-red-400',
                medium: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                low: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              };
              
              return (
                <div key={index} className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${priorityColors[priority]} backdrop-blur-md hover:scale-105 transition-all duration-500`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl border ${iconColors[priority]}`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="text-lg font-bold text-slate-100">{issue}</h5>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priority === 'high' ? 'bg-red-500/20 text-red-300' : priority === 'medium' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {priority.toUpperCase()}
                          </span>
                        </div>
                        {explanation && (
                          <p className="text-slate-400 text-sm leading-relaxed">{explanation}</p>
                        )}
                      </div>
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
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Mobile View Screenshots</h3>
            <p className="text-xl text-slate-400">Visual representation of how your website appears on mobile devices</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.screenshots.map((screenshot, index) => renderScreenshot(screenshot, index))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="group relative p-8 bg-gradient-to-br from-blue-950/30 to-slate-900/40 rounded-2xl border border-blue-800/30 backdrop-blur-md hover:border-blue-700/50 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            Optimization Recommendations
          </h3>
          
          <div className="space-y-6">
            {data.verdict === 'MOBILE_FRIENDLY' ? (
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
                <h4 className="text-xl font-semibold text-green-400 flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6" /> Mobile Optimization Complete
                </h4>
                <p className="text-slate-300 mb-4">
                  Your website demonstrates excellent mobile optimization. Continue monitoring and testing to maintain this high standard.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800/40">
                    <h5 className="font-semibold text-slate-200 mb-2">Performance Monitoring</h5>
                    <p className="text-sm text-slate-400">Regular testing across devices and screen sizes</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800/40">
                    <h5 className="font-semibold text-slate-200 mb-2">Speed Optimization</h5>
                    <p className="text-sm text-slate-400">Consider implementing AMP or PWA features</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
                  <h4 className="text-xl font-semibold text-orange-400 flex items-center gap-2 mb-4">
                    <Settings className="w-6 h-6" /> Priority Actions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-slate-200 font-medium">Configure Viewport Meta Tag</p>
                        <p className="text-sm text-slate-400">Add proper viewport meta tag to control mobile rendering</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-slate-200 font-medium">Optimize Touch Targets</p>
                        <p className="text-sm text-slate-400">Ensure buttons and links are at least 48px in size</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-slate-200 font-medium">Implement Responsive Design</p>
                        <p className="text-sm text-slate-400">Use flexible layouts and media queries</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-slate-400 p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
              <p className="font-medium text-slate-300 mb-2">Impact on SEO & User Experience</p>
              <p>Mobile-friendliness is a critical ranking factor for Google's mobile search results. Improving your mobile experience can significantly boost SEO performance, reduce bounce rates, and increase user engagement and conversions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Breakdown */}
      {data.details && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Technical Analysis</h3>
            <p className="text-xl text-slate-400">Detailed breakdown of mobile optimization factors</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.details).map(([key, value]) => (
              <div key={key} className={`group relative p-4 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                value ? 'bg-gradient-to-br from-red-950/30 to-slate-900/40 border-red-800/30' : 'bg-gradient-to-br from-green-950/30 to-slate-900/40 border-green-800/30'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center justify-between">
                  <span className="font-medium text-slate-200 text-sm">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      value ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {value ? 'Issue' : 'Pass'}
                    </span>
                  </div>
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
  const color = isMobileFriendly ? '#10B981' : '#EF4444';
  
  const gaugeData = [
    { name: 'Score', value: 1 },
  ];

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
            outerRadius="85%"
            cornerRadius={8}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
          </Pie>
          <svg x="37.5%" y="20%" width="25%" height="60%" viewBox="0 0 24 24">
            {isMobileFriendly ? (
              <g>
                <path fill={color} d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
                <circle fill="white" cx="15" cy="10" r="6" />
                <path fill={color} d="M15,4A6,6 0 0,1 21,10A6,6 0 0,1 15,16A6,6 0 0,1 9,10A6,6 0 0,1 15,4M15,6A4,4 0 0,0 11,10A4,4 0 0,0 15,14A4,4 0 0,0 19,10A4,4 0 0,0 15,6M14.3,8.7L15.7,10.1L18,7.8L19.4,9.2L15.7,12.9L12.9,10.1L14.3,8.7Z" />
              </g>
            ) : (
              <g>
                <path fill={color} d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
                <circle fill="white" cx="15" cy="10" r="6" />
                <path fill={color} d="M15,4A6,6 0 0,1 21,10A6,6 0 0,1 15,16A6,6 0 0,1 9,10A6,6 0 0,1 15,4M15,6A4,4 0 0,0 11,10A4,4 0 0,0 15,14A4,4 0 0,0 19,10A4,4 0 0,0 15,6M12.59,13.41L15,11L17.41,13.41L18.83,12L16.41,9.59L18.83,7.17L17.41,5.76L15,8.17L12.59,5.76L11.17,7.17L13.59,9.59L11.17,12L12.59,13.41Z" />
              </g>
            )}
          </svg>
          <text
            x="50%"
            y="80%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-bold"
            fill={color}
          >
            {isMobileFriendly ? 'OPTIMIZED' : 'NEEDS WORK'}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MobileFriendlyTab;