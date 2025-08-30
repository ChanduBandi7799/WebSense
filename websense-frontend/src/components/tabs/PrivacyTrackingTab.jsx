import React from 'react';
import { Shield, Eye, AlertTriangle, CheckCircle, Info, Search, Activity, BarChart3, Globe, Lock, PieChart, Database, FileText, Cpu, Network } from 'lucide-react';

const PrivacyTrackingTab = ({ 
  isAnalyzingPrivacy, 
  privacyResult, 
  handleAnalyzePrivacy 
}) => {
  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);



  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return 'text-red-400 bg-red-950/30 border-red-800/50';
      case 'Medium': return 'text-yellow-400 bg-yellow-950/30 border-yellow-800/50';
      case 'Low': return 'text-green-400 bg-green-950/30 border-green-800/50';
      default: return 'text-slate-400 bg-slate-950/30 border-slate-800/50';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Analytics': return 'text-blue-400 bg-blue-950/30 border-blue-800/50';
      case 'Ads': return 'text-orange-400 bg-orange-950/30 border-orange-800/50';
      case 'Tracker': return 'text-purple-400 bg-purple-950/30 border-purple-800/50';
      case 'Other': return 'text-slate-400 bg-slate-950/30 border-slate-800/50';
      default: return 'text-slate-400 bg-slate-950/30 border-slate-800/50';
    }
  };

  const PieChartComponent = ({ data, title, colors }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
      return (
        <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm text-center">
          <PieChart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <div className="text-sm text-slate-400">No data available</div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
        <h4 className="text-lg font-semibold text-slate-100 mb-4 text-center">{title}</h4>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSummaryBox = (data) => {
    const trackers = data.trackers || [];
    const summary = data.summary || {};
    
    return (
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Privacy & Tracking Summary</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/30">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300 font-semibold tracking-wide">TRACKER ANALYSIS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {summary.totalTrackers || trackers.length}
              </div>
              <div className="text-sm text-slate-400 font-medium">Total Trackers</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {summary.analyticsCount || 0}
              </div>
              <div className="text-sm text-slate-400 font-medium">Analytics Scripts</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {summary.adsCount || 0}
              </div>
              <div className="text-sm text-slate-400 font-medium">Ad Services</div>
            </div>
            
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {summary.suspiciousCount || 0}
              </div>
              <div className="text-sm text-slate-400 font-medium">High Risk Trackers</div>
            </div>
          </div>

          {/* Pie Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <PieChartComponent
              title="Tracker Types Distribution"
              data={[
                { label: 'Analytics', value: summary.analyticsCount || 0 },
                { label: 'Ads', value: summary.adsCount || 0 },
                { label: 'Trackers', value: summary.trackerCount || 0 },
                { label: 'Other', value: (summary.totalTrackers || 0) - (summary.analyticsCount || 0) - (summary.adsCount || 0) - (summary.trackerCount || 0) }
              ]}
              colors={['#3B82F6', '#F97316', '#8B5CF6', '#64748B']}
            />
            
            <PieChartComponent
              title="Risk Level Distribution"
              data={[
                { label: 'High Risk', value: summary.suspiciousCount || 0 },
                { label: 'Medium Risk', value: trackers.filter(t => t.riskLevel === 'Medium').length },
                { label: 'Low Risk', value: trackers.filter(t => t.riskLevel === 'Low').length }
              ]}
              colors={['#EF4444', '#F59E0B', '#10B981']}
            />
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-950/20 rounded-xl border border-blue-800/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                This analysis shows potential trackers and ads based on third-party domains. It does not block them.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrackersTable = (data) => {
    const trackers = data.trackers || [];
    return (
      <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Detected Trackers & Services</h3>
              <p className="text-slate-400">Third-party domains and scripts found on the website</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Service / Script</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Type</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Domain</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {trackers.map((tracker, index) => (
                  <tr key={index} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-slate-100">{tracker.service}</div>
                        <div className="text-sm text-slate-400">{tracker.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(tracker.type)}`}>
                        {tracker.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-200 font-mono text-sm">{tracker.domain}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(tracker.riskLevel)}`}>
                        {tracker.riskLevel === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {tracker.riskLevel === 'Medium' && <Activity className="w-3 h-3 mr-1" />}
                        {tracker.riskLevel === 'Low' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {tracker.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAdditionalData = (data) => {
    return (
      <div className="space-y-8">
        {/* External Resources Section */}
        {data.externalResources && data.externalResources.length > 0 && (
          <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <Network className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">External Resources</h3>
                  <p className="text-slate-400">Third-party resources loaded by the website</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Type</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Category</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Domain</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.externalResources.slice(0, 20).map((resource, index) => (
                      <tr key={index} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors duration-200">
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800/50 border border-slate-700/30 text-slate-300">
                            {resource.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-200">{resource.category}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-200 font-mono text-sm">{resource.domain}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-400 text-sm truncate max-w-xs block">{resource.url}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.externalResources.length > 20 && (
                  <div className="mt-4 text-center text-slate-400 text-sm">
                    Showing first 20 of {data.externalResources.length} external resources
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Data Section */}
        {data.performanceData && (
          <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <Cpu className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Performance Analysis</h3>
                  <p className="text-slate-400">Resource usage and performance metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{data.performanceData.images}</div>
                  <div className="text-xs text-slate-400">Images</div>
                </div>
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="text-2xl font-bold text-green-400 mb-1">{data.performanceData.scripts}</div>
                  <div className="text-xs text-slate-400">Scripts</div>
                </div>
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{data.performanceData.stylesheets}</div>
                  <div className="text-xs text-slate-400">Stylesheets</div>
                </div>
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{data.performanceData.externalResources}</div>
                  <div className="text-xs text-slate-400">External URLs</div>
                </div>
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="text-2xl font-bold text-red-400 mb-1">{data.performanceData.inlineScripts}</div>
                  <div className="text-xs text-slate-400">Inline Scripts</div>
                </div>
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{data.performanceData.inlineStyles}</div>
                  <div className="text-xs text-slate-400">Inline Styles</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meta Data Section */}
        {data.metaData && data.metaData.length > 0 && (
          <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <FileText className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Meta Tags Analysis</h3>
                  <p className="text-slate-400">SEO and metadata information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.metaData.slice(0, 12).map((meta, index) => (
                  <div key={index} className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                    <div className="text-sm font-semibold text-slate-300 mb-1">{meta.name}</div>
                    <div className="text-xs text-slate-400 truncate">{meta.content}</div>
                  </div>
                ))}
              </div>
              {data.metaData.length > 12 && (
                <div className="mt-4 text-center text-slate-400 text-sm">
                  Showing first 12 of {data.metaData.length} meta tags
                </div>
              )}
            </div>
          </div>
        )}

        {/* Structured Data Section */}
        {data.structuredData && data.structuredData.length > 0 && (
          <div className="group relative p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/30 rounded-2xl border border-slate-700/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <Database className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Structured Data</h3>
                  <p className="text-slate-400">JSON-LD and microdata found on the page</p>
                </div>
              </div>

              <div className="space-y-4">
                {data.structuredData.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-300">{item.type}</span>
                      {item['@type'] && (
                        <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                          {item['@type']}
                        </span>
                      )}
                    </div>
                    {item.schema && (
                      <div className="text-xs text-slate-400">{item.schema}</div>
                    )}
                  </div>
                ))}
              </div>
              {data.structuredData.length > 5 && (
                <div className="mt-4 text-center text-slate-400 text-sm">
                  Showing first 5 of {data.structuredData.length} structured data items
                </div>
              )}
            </div>
          </div>
        )}
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
                      <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 overflow-hidden">
            <img 
              src="/image.png" 
              alt="WebSense Logo" 
              className="w-9 h-9 object-cover rounded-xl"
            />
          </div>
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-100 mb-2">Privacy & Tracking Analysis</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950/50 rounded-full border border-blue-700/30">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-semibold tracking-wide">THIRD-PARTY TRACKER DETECTION</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
              Comprehensive analysis of third-party trackers, analytics scripts, and advertising services that may be collecting user data. 
              Identify potential privacy concerns and understand what data is being shared with external services.
            </p>
          </div>
        </div>

        {isAnalyzingPrivacy ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-spin opacity-20"></div>
                <div className="absolute inset-2 rounded-full bg-slate-950"></div>
                <div className="absolute inset-6 flex items-center justify-center">
                  <Search className="w-12 h-12 text-blue-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Analyzing Privacy & Tracking...</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Scanning website for third-party trackers, analytics scripts, and advertising services
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
        ) : privacyResult ? (
          <div className="space-y-8">
            {privacyResult.success ? (
              <>
                {renderSummaryBox(privacyResult)}
                {renderTrackersTable(privacyResult)}
                {renderAdditionalData(privacyResult)}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-2xl border border-red-800/30 flex items-center justify-center">
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-4">Privacy Analysis Failed</h3>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  {privacyResult.message || 'Unable to analyze privacy and tracking data. The website may be inaccessible or blocked.'}
                </p>
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-slate-600 rounded-xl blur opacity-60"></div>
                  <button
                    onClick={handleAnalyzePrivacy}
                    disabled={isAnalyzingPrivacy}
                    className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-slate-700 text-white text-lg font-bold rounded-xl hover:from-blue-500 hover:to-slate-600 transition-all duration-300 hover:scale-105"
                  >
                    <Search className="w-5 h-5 inline mr-2" />
                    {isAnalyzingPrivacy ? 'Analyzing...' : 'Retry Analysis'}
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
            <h3 className="text-3xl font-bold text-slate-100 mb-4">Ready for Privacy Analysis</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Switch to the Privacy & Tracking tab to begin comprehensive analysis of third-party trackers and privacy concerns
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyTrackingTab;
