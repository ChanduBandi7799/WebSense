import React from 'react';
import { 
  Zap, 
  Activity, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Tablet, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  TrendingUp, 
  Clock, 
  Target,
  Image,
  Code,
  Palette,
  Search,
  Shield,
  Camera,
  Gauge,
  FileText,
  Layers
} from 'lucide-react';

const LighthouseTab = ({ report }) => {
  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

  const ScoreCard = ({ title, score, color, icon }) => {
    const getColorClasses = () => {
      switch (color) {
        case 'blue': return 'from-blue-950/30 to-slate-900/40 border-blue-800/30';
        case 'green': return 'from-green-950/30 to-slate-900/40 border-green-800/30';
        case 'yellow': return 'from-yellow-950/30 to-slate-900/40 border-yellow-800/30';
        case 'purple': return 'from-purple-950/30 to-slate-900/40 border-purple-800/30';
        case 'red': return 'from-red-950/30 to-slate-900/40 border-red-800/30';
        default: return 'from-slate-950/30 to-slate-900/40 border-slate-800/30';
      }
    };
    
    const getScoreColor = () => {
      if (score === null || score === undefined) return '#64748b';
      if (score >= 90) return '#10B981';
      if (score >= 70) return '#F59E0B';
      return '#EF4444';
    };

    const getIconColor = () => {
      switch (color) {
        case 'blue': return 'text-blue-400';
        case 'green': return 'text-green-400';
        case 'yellow': return 'text-yellow-400';
        case 'purple': return 'text-purple-400';
        case 'red': return 'text-red-400';
        default: return 'text-slate-400';
      }
    };
    
    const displayScore = score !== null && score !== undefined ? score : 'N/A';
    const scoreColor = getScoreColor();
    
    return (
      <div className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${getColorClasses()} backdrop-blur-md hover:scale-105 transition-all duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${color === 'blue' ? 'bg-blue-500/10 border-blue-500/20' : color === 'green' ? 'bg-green-500/10 border-green-500/20' : color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20' : color === 'purple' ? 'bg-purple-500/10 border-purple-500/20' : color === 'red' ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                <div className={getIconColor()}>
                  {icon}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{title}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1" style={{ color: scoreColor }}>
                {displayScore !== 'N/A' ? displayScore : 'N/A'}
              </div>
              {displayScore !== 'N/A' && (
                <div className="text-xs text-slate-400">out of 100</div>
              )}
            </div>
          </div>
          
          {/* Score visualization */}
          {displayScore !== 'N/A' && (
            <div className="w-full bg-slate-800/40 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.max(score, 5)}%`,
                  backgroundColor: scoreColor 
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const MetricItem = ({ label, value, icon }) => (
    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-700/30">
            {icon}
          </div>
        )}
        <span className="text-slate-300 font-medium">{label}</span>
      </div>
      <span className="text-slate-100 font-bold">{value}</span>
    </div>
  );

  const renderScreenshots = () => {
    if (!report.performance.screenshots || report.performance.screenshots.length === 0) {
      return (
        <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/40 rounded-2xl border border-slate-700/30 flex items-center justify-center">
              <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">No Screenshots Available</h3>
            <p className="text-slate-400">Screenshots were not captured during this analysis</p>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <Camera className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Loading Sequence Screenshots</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">VISUAL LOADING PROGRESSION</span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-950/20 rounded-xl border border-blue-800/30">
            <p className="text-blue-200 text-sm">
              Captured {report.performance.screenshots.length} screenshots showing the page loading sequence over time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.performance.screenshots.map((screenshot, index) => {
              const isValidBase64 = screenshot.data && 
                typeof screenshot.data === 'string' && 
                screenshot.data.length > 0 &&
                /^[A-Za-z0-9+/]*={0,2}$/.test(screenshot.data);

              let detectedFormat = 'png';
              if (screenshot.data) {
                try {
                  const binaryString = atob(screenshot.data.substring(0, 20));
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  
                  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                    detectedFormat = 'png';
                  } else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                    detectedFormat = 'jpeg';
                  } else if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
                    detectedFormat = 'webp';
                  }
                } catch (e) {
                  // Use default PNG
                }
              }

              const getPhaseColor = (phase) => {
                switch (phase) {
                  case 'initial': return 'bg-red-500/20 border-red-500/30 text-red-300';
                  case 'early': return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
                  case 'loading': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
                  case 'late': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
                  case 'complete': return 'bg-green-500/20 border-green-500/30 text-green-300';
                  default: return 'bg-slate-500/20 border-slate-500/30 text-slate-300';
                }
              };

              const seconds = (screenshot.timestamp / 1000).toFixed(1);

              return (
                <div key={screenshot.id} className="bg-slate-900/30 rounded-2xl border border-slate-800/40 overflow-hidden hover:border-slate-700/50 transition-all duration-300">
                  <div className="p-4 bg-slate-800/30 border-b border-slate-700/40">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-slate-100 text-sm">
                        {screenshot.description || `Screenshot ${index + 1}`}
                      </h4>
                      <span className={`text-xs px-3 py-1 rounded-full border ${getPhaseColor(screenshot.phase)}`}>
                        {screenshot.phase}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div>Resolution: {screenshot.width} × {screenshot.height}</div>
                      <div>Timestamp: {seconds}s</div>
                      <div className={isValidBase64 ? 'text-green-400' : 'text-red-400'}>
                        Base64: {isValidBase64 ? 'Valid' : 'Invalid'}
                      </div>
                      <div className="text-blue-400">
                        Format: {detectedFormat.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {screenshot.data && screenshot.data.length > 0 ? (
                      <div className="relative">
                        <img 
                          src={`data:image/${detectedFormat};base64,${screenshot.data}`}
                          alt={`Loading sequence screenshot ${index + 1}`}
                          className="w-full h-auto rounded-xl border border-slate-700/30"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log(`Screenshot ${index + 1} loaded successfully`);
                          }}
                        />
                        <div 
                          className="w-full h-48 bg-slate-800/40 rounded-xl border border-slate-700/30 flex items-center justify-center text-slate-400"
                          style={{ display: 'none' }}
                        >
                          <div className="text-center">
                            <Camera className="w-12 h-12 mx-auto mb-2" />
                            <div className="text-sm">Screenshot {index + 1}</div>
                            <div className="text-xs text-slate-500 mt-1">Image failed to load</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-red-950/20 border border-red-800/30 rounded-xl flex items-center justify-center text-red-400">
                        <div className="text-center">
                          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                          <div className="text-sm">No Image Data</div>
                          <div className="text-xs text-red-500 mt-1">Screenshot data unavailable</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMetricsSection = () => {
    const metrics = [
      { label: 'First Contentful Paint', value: report.performance.firstContentfulPaint || 'N/A', icon: <Clock className="w-4 h-4 text-blue-400" /> },
      { label: 'Speed Index', value: report.performance.speedIndex || 'N/A', icon: <Gauge className="w-4 h-4 text-green-400" /> },
      { label: 'Largest Contentful Paint', value: report.performance.largestContentfulPaint || 'N/A', icon: <Target className="w-4 h-4 text-purple-400" /> },
      { label: 'Time to Interactive', value: report.performance.timeToInteractive || 'N/A', icon: <Activity className="w-4 h-4 text-yellow-400" /> },
      { label: 'Total Blocking Time', value: report.performance.totalBlockingTime || 'N/A', icon: <Zap className="w-4 h-4 text-red-400" /> },
      { label: 'Cumulative Layout Shift', value: report.performance.cumulativeLayoutShift || 'N/A', icon: <Layers className="w-4 h-4 text-cyan-400" /> }
    ];

    return (
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Core Performance Metrics</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">LIGHTHOUSE ANALYSIS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <MetricItem 
                key={index}
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResourceAnalysis = () => {
    if (!report.performance.resources) return null;

    const resources = [
      { label: 'Total Requests', value: report.performance.resources.totalRequests || 'N/A', icon: <FileText className="w-4 h-4 text-blue-400" /> },
      { label: 'Total Size', value: report.performance.resources.totalSize || 'N/A', icon: <Monitor className="w-4 h-4 text-green-400" /> },
      { label: 'Images', value: report.performance.resources.imageCount || 'N/A', icon: <Image className="w-4 h-4 text-purple-400" /> },
      { label: 'Scripts', value: report.performance.resources.scriptCount || 'N/A', icon: <Code className="w-4 h-4 text-yellow-400" /> },
      { label: 'Stylesheets', value: report.performance.resources.stylesheetCount || 'N/A', icon: <Palette className="w-4 h-4 text-red-400" /> },
      { label: 'Fonts', value: report.performance.resources.fontCount || 'N/A', icon: <FileText className="w-4 h-4 text-cyan-400" /> }
    ];

    return (
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <Layers className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100">Resource Analysis</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource, index) => (
              <MetricItem 
                key={index}
                label={resource.label}
                value={resource.value}
                icon={resource.icon}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!report.performance.suggestions || report.performance.suggestions.length === 0) return null;

    return (
      <div className="group relative p-8 bg-gradient-to-br from-green-950/30 to-slate-900/40 rounded-2xl border border-green-800/30 backdrop-blur-md">
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100">Performance Recommendations</h3>
            </div>
          </div>

          <div className="space-y-4">
            {report.performance.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-200 font-semibold mb-1">
                    {typeof suggestion === 'string' ? suggestion : suggestion.title}
                  </h4>
                  {suggestion.description && (
                    <p className="text-slate-400 text-sm mb-2">{suggestion.description}</p>
                  )}
                  {suggestion.savings && (
                    <p className="text-green-400 text-sm">Potential savings: {suggestion.savings}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950" style={{ backgroundColor: '#020617', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="mb-12 p-8 bg-gradient-to-br from-orange-950/30 via-slate-900/40 to-slate-950/30 border border-orange-800/30 rounded-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Gauge className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-100 mb-2">Lighthouse Performance Audit</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-950/50 rounded-full border border-orange-700/30">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-300 font-semibold tracking-wide">COMPREHENSIVE WEBSITE ANALYSIS</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
              Comprehensive website performance analysis using Google Lighthouse. Evaluates performance, accessibility, 
              best practices, SEO, and Progressive Web App capabilities with actionable recommendations.
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {report.performance.error ? (
            <div className="col-span-full p-8 bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-2xl border border-red-800/30 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-100 mb-2">Performance Analysis Failed</h3>
              <p className="text-slate-400">Unable to complete Lighthouse analysis</p>
            </div>
          ) : (
            <>
              <ScoreCard 
                title="Performance" 
                score={report.performance.categories?.performance || report.performance.score} 
                color="blue" 
                icon={<Gauge className="w-6 h-6" />}
              />
              <ScoreCard 
                title="Accessibility" 
                score={report.performance.categories?.accessibility} 
                color="green" 
                icon={<Eye className="w-6 h-6" />}
              />
              <ScoreCard 
                title="Best Practices" 
                score={report.performance.categories?.['best-practices']} 
                color="yellow" 
                icon={<Shield className="w-6 h-6" />}
              />
              <ScoreCard 
                title="SEO" 
                score={report.performance.categories?.seo} 
                color="purple" 
                icon={<Search className="w-6 h-6" />}
              />
              <ScoreCard 
                title="PWA" 
                score={report.performance.categories?.pwa} 
                color="red" 
                icon={<Smartphone className="w-6 h-6" />}
              />
            </>
          )}
        </div>

        {/* Performance Metrics */}
        {!report.performance.error && report.performance.firstContentfulPaint && renderMetricsSection()}

        {/* Screenshots */}
        {!report.performance.error && renderScreenshots()}

        {/* Resource Analysis */}
        {!report.performance.error && renderResourceAnalysis()}

        {/* Optimization Opportunities */}
        {!report.performance.error && (
          <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <Target className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100">Optimization Opportunities</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricItem 
                  label="Unused CSS" 
                  value={report.performance.unusedCSS || 'N/A'} 
                  icon={<Palette className="w-4 h-4 text-red-400" />}
                />
                <MetricItem 
                  label="Unused JavaScript" 
                  value={report.performance.unusedJavaScript || 'N/A'} 
                  icon={<Code className="w-4 h-4 text-yellow-400" />}
                />
                <MetricItem 
                  label="Modern Image Formats" 
                  value={report.performance.modernImageFormats || 'N/A'} 
                  icon={<Image className="w-4 h-4 text-green-400" />}
                />
                <MetricItem 
                  label="Image Optimization" 
                  value={report.performance.imageOptimization || 'N/A'} 
                  icon={<Camera className="w-4 h-4 text-blue-400" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Performance Suggestions */}
        {!report.performance.error && renderSuggestions()}

        {/* Error State */}
        {(!report.performance.firstContentfulPaint && (!report.performance.suggestions || report.performance.suggestions.length === 0) && !report.performance.error) && (
          <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/40 rounded-2xl border border-slate-700/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-4">No Performance Data Available</h3>
            <div className="text-slate-400 space-y-2">
              <p>Performance metrics could not be retrieved. This may be due to:</p>
              <ul className="text-sm mt-4 space-y-1">
                <li>• Website is not accessible or down</li>
                <li>• Chrome security restrictions</li>
                <li>• Network connectivity issues</li>
                <li>• Website blocking automated analysis</li>
                <li>• Invalid or redirecting URL</li>
              </ul>
            </div>
            {report.performance.message && (
              <div className="mt-6 p-4 bg-red-950/20 border border-red-800/30 rounded-xl">
                <p className="text-red-300 font-semibold text-sm">Error Details:</p>
                <p className="text-red-400 text-sm mt-1">{report.performance.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LighthouseTab;