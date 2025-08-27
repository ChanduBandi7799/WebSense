import React from 'react';

const LighthouseTab = ({ report }) => {
  const ScoreCard = ({ title, score, color }) => {
    const getColorClass = () => {
      switch (color) {
        case 'blue': return 'text-blue-600 border-blue-200 bg-blue-50';
        case 'green': return 'text-green-600 border-green-200 bg-green-50';
        case 'yellow': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
        case 'purple': return 'text-purple-600 border-purple-200 bg-purple-50';
        case 'red': return 'text-red-600 border-red-200 bg-red-50';
        default: return 'text-gray-600 border-gray-200 bg-gray-50';
      }
    };
    
    const getScoreColor = () => {
      if (score === null || score === undefined) return 'text-gray-500';
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-yellow-600';
      return 'text-red-600';
    };
    
    const displayScore = score !== null && score !== undefined ? `${score}/100` : 'N/A';
    
    return (
      <div className={`border rounded-lg p-4 ${getColorClass()}`}>
        <h3 className="text-lg font-medium">{title}</h3>
        <div className={`text-3xl font-bold mt-2 ${getScoreColor()}`}>
          {displayScore}
        </div>
      </div>
    );
  };

  const MetricItem = ({ label, value }) => (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {report.performance.error ? (
          <div className="text-red-500">Performance Analysis Failed</div>
        ) : (
          <>
            {console.log('Rendering scores with data:', {
              performance: report.performance.categories?.performance || report.performance.score,
              accessibility: report.performance.categories?.accessibility,
              bestPractices: report.performance.categories?.['best-practices'],
              seo: report.performance.categories?.seo,
              pwa: report.performance.categories?.pwa
            })}
            <ScoreCard title="Performance" score={report.performance.categories?.performance || report.performance.score} color="blue" />
            <ScoreCard title="Accessibility" score={report.performance.categories?.accessibility} color="green" />
            <ScoreCard title="Best Practices" score={report.performance.categories?.['best-practices']} color="yellow" />
            <ScoreCard title="SEO" score={report.performance.categories?.seo} color="purple" />
            <ScoreCard title="PWA" score={report.performance.categories?.pwa} color="indigo" />
          </>
        )}
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
        {report.performance.error ? (
          <div className="text-red-500">Performance Analysis Failed</div>
        ) : report.performance.firstContentfulPaint ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.performance.screenshots.map((screenshot, index) => {
                // Debug the screenshot data
                console.log(`Screenshot ${index + 1}:`, {
                  id: screenshot.id,
                  dataLength: screenshot.data ? screenshot.data.length : 0,
                  dataPreview: screenshot.data ? screenshot.data.substring(0, 50) + '...' : 'No data',
                  width: screenshot.width,
                  height: screenshot.height
                });
                
                // Validate base64 data
                const isValidBase64 = screenshot.data && 
                  typeof screenshot.data === 'string' && 
                  screenshot.data.length > 0 &&
                  /^[A-Za-z0-9+/]*={0,2}$/.test(screenshot.data);
                
                // Try to detect image format from base64 data
                let detectedFormat = 'png'; // default
                if (screenshot.data) {
                  try {
                    const binaryString = atob(screenshot.data.substring(0, 20));
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // Check PNG signature
                    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                      detectedFormat = 'png';
                    }
                    // Check JPEG signature
                    else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                      detectedFormat = 'jpeg';
                    }
                    // Check WebP signature
                    else if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
                      detectedFormat = 'webp';
                    }
                  } catch (e) {
                    console.log('Could not detect image format, using PNG as default');
                  }
                }
                
                console.log(`Screenshot ${index + 1}:`, {
                  base64Valid: isValidBase64,
                  detectedFormat: detectedFormat,
                  dataLength: screenshot.data ? screenshot.data.length : 0
                });
                
                // Get phase color
                const getPhaseColor = (phase) => {
                  switch (phase) {
                    case 'initial': return 'bg-red-100 border-red-300 text-red-800';
                    case 'early': return 'bg-orange-100 border-orange-300 text-orange-800';
                    case 'loading': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
                    case 'late': return 'bg-blue-100 border-blue-300 text-blue-800';
                    case 'complete': return 'bg-green-100 border-green-300 text-green-800';
                    default: return 'bg-gray-100 border-gray-300 text-gray-800';
                  }
                };
                
                const seconds = (screenshot.timestamp / 1000).toFixed(1);
                
                return (
                  <div key={screenshot.id} className="bg-white rounded-lg border overflow-hidden">
                    <div className="p-3 bg-gray-100 border-b">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm text-gray-800">
                          {screenshot.description}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPhaseColor(screenshot.phase)}`}>
                          {screenshot.phase}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {screenshot.width} × {screenshot.height} • {seconds}s
                      </p>
                      <p className="text-xs text-gray-400">
                        Data length: {screenshot.data ? screenshot.data.length : 0} chars
                      </p>
                      <p className={`text-xs ${isValidBase64 ? 'text-green-600' : 'text-red-600'}`}>
                        Base64 valid: {isValidBase64 ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-blue-600">
                        Detected format: {detectedFormat.toUpperCase()}
                      </p>
                    </div>
                    <div className="p-2">
                      {screenshot.data && screenshot.data.length > 0 ? (
                        <>
                          {/* Try detected format first */}
                          <img 
                            src={`data:image/${detectedFormat};base64,${screenshot.data}`}
                            alt={`Screenshot ${index + 1} (${detectedFormat.toUpperCase()})`}
                            className="w-full h-auto rounded border"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                            onError={(e) => {
                              console.log(`${detectedFormat.toUpperCase()} format failed, trying other formats...`);
                              // Hide detected format image and show fallback
                              e.target.style.display = 'none';
                              const fallbackImg = e.target.nextElementSibling;
                              if (fallbackImg) fallbackImg.style.display = 'block';
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded screenshot ${index + 1} as ${detectedFormat.toUpperCase()}`);
                            }}
                          />
                          {/* Try JPEG as fallback */}
                          <img 
                            src={`data:image/jpeg;base64,${screenshot.data}`}
                            alt={`Screenshot ${index + 1} (JPEG)`}
                            className="w-full h-auto rounded border"
                            style={{ maxHeight: '200px', objectFit: 'contain', display: 'none' }}
                            onError={(e) => {
                              console.log('JPEG format also failed, trying WebP...');
                              // Hide JPEG image and show WebP fallback
                              e.target.style.display = 'none';
                              const webpImg = e.target.nextElementSibling;
                              if (webpImg) webpImg.style.display = 'block';
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded screenshot ${index + 1} as JPEG`);
                            }}
                          />
                          {/* Try WebP as final fallback */}
                          <img 
                            src={`data:image/webp;base64,${screenshot.data}`}
                            alt={`Screenshot ${index + 1} (WebP)`}
                            className="w-full h-auto rounded border"
                            style={{ maxHeight: '200px', objectFit: 'contain', display: 'none' }}
                            onError={(e) => {
                              console.error('All image formats failed for screenshot:', screenshot.id);
                              console.error('Base64 data preview:', screenshot.data ? screenshot.data.substring(0, 100) : 'No data');
                              // Hide WebP image and show error fallback
                              e.target.style.display = 'none';
                              const errorDiv = e.target.parentElement.querySelector('.error-fallback');
                              if (errorDiv) errorDiv.style.display = 'block';
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded screenshot ${index + 1} as WebP`);
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-32 bg-red-50 border border-red-200 rounded flex items-center justify-center text-red-500 text-sm">
                          <div className="text-center">
                            <div className="text-2xl mb-1">❌</div>
                            <div>No Image Data</div>
                            <div className="text-xs text-red-400 mt-1">
                              Screenshot data is empty
                            </div>
                          </div>
                        </div>
                      )}
                      <div 
                        className="error-fallback w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">🖼️</div>
                          <div>Screenshot {index + 1}</div>
                          <div className="text-xs text-gray-400">
                            {screenshot.width} × {screenshot.height}
                          </div>
                          <div className="text-xs text-red-400 mt-1">
                            All image formats failed
                          </div>
                          <div className="text-xs text-blue-400 mt-1">
                            {!isValidBase64 ? 'Invalid base64 format' : 'Valid base64, unknown format'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricItem label="First Contentful Paint" value={report.performance.firstContentfulPaint || 'N/A'} />
              <MetricItem label="Speed Index" value={report.performance.speedIndex || 'N/A'} />
              <MetricItem label="Largest Contentful Paint" value={report.performance.largestContentfulPaint || 'N/A'} />
              <MetricItem label="Time to Interactive" value={report.performance.timeToInteractive || 'N/A'} />
              <MetricItem label="Total Blocking Time" value={report.performance.totalBlockingTime || 'N/A'} />
              <MetricItem label="Cumulative Layout Shift" value={report.performance.cumulativeLayoutShift || 'N/A'} />
              <MetricItem label="Max Potential FID" value={report.performance.maxPotentialFID || 'N/A'} />
              <MetricItem label="Server Response Time" value={report.performance.serverResponseTime || 'N/A'} />
              <MetricItem label="Render Blocking Resources" value={report.performance.renderBlockingResources || 'N/A'} />
            </div>
          </div>
        ) : (
          <p>No performance metrics available.</p>
        )}
      </div>

      {/* Resource Analysis */}
      {report.performance.resources && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Resource Analysis</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricItem label="Total Requests" value={report.performance.resources.totalRequests || 'N/A'} />
              <MetricItem label="Total Size" value={report.performance.resources.totalSize || 'N/A'} />
              <MetricItem label="Images" value={report.performance.resources.imageCount || 'N/A'} />
              <MetricItem label="Scripts" value={report.performance.resources.scriptCount || 'N/A'} />
              <MetricItem label="Stylesheets" value={report.performance.resources.stylesheetCount || 'N/A'} />
              <MetricItem label="Fonts" value={report.performance.resources.fontCount || 'N/A'} />
            </div>
          </div>
        </div>
      )}

      {/* Additional Performance Metrics */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Optimization Opportunities</h3>
        {report.performance.error ? (
          <div className="text-red-500">Performance Analysis Failed</div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricItem label="Unused CSS" value={report.performance.unusedCSS || 'N/A'} />
              <MetricItem label="Unused JavaScript" value={report.performance.unusedJavaScript || 'N/A'} />
              <MetricItem label="Modern Image Formats" value={report.performance.modernImageFormats || 'N/A'} />
              <MetricItem label="Image Optimization" value={report.performance.imageOptimization || 'N/A'} />
            </div>
          </div>
        )}
      </div>
      
      {report.performance.suggestions && report.performance.suggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Performance Suggestions</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-3">
              {report.performance.suggestions.map((suggestion, index) => (
                <li key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">{suggestion.title || suggestion}</h4>
                  {suggestion.description && (
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  )}
                  {suggestion.savings && (
                    <p className="text-sm text-green-600 mt-1">Potential savings: {suggestion.savings}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Accessibility Issues */}
      {report.performance.accessibilityIssues && report.performance.accessibilityIssues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Accessibility Issues</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-3">
              {report.performance.accessibilityIssues.map((issue, index) => (
                <li key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-medium">{issue.title}</h4>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                  <p className="text-sm text-green-600 mt-1">Score: {issue.score}/100</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Best Practices Issues */}
      {report.performance.bestPracticesIssues && report.performance.bestPracticesIssues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Best Practices Issues</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-3">
              {report.performance.bestPracticesIssues.map((issue, index) => (
                <li key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h4 className="font-medium">{issue.title}</h4>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                  <p className="text-sm text-yellow-600 mt-1">Score: {issue.score}/100</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SEO Issues */}
      {report.performance.seoIssues && report.performance.seoIssues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">SEO Issues</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-3">
              {report.performance.seoIssues.map((issue, index) => (
                <li key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-medium">{issue.title}</h4>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                  <p className="text-sm text-purple-600 mt-1">Score: {issue.score}/100</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Screenshots - Loading Sequence */}
      {report.performance.screenshots && report.performance.screenshots.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Loading Sequence Screenshots</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Visual loading sequence captured during Lighthouse analysis. Screenshots show the page loading progress over time.
            </p>
            
            {/* Loading Sequence Summary */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Loading Sequence Information</h4>
              <div className="text-sm text-blue-700">
                <p>Total screenshots captured: {report.performance.screenshots.length}</p>
                {report.performance.screenshots.length === 1 ? (
                  <>
                    <p className="text-orange-700 font-medium mt-2">⚠️ Single Screenshot Mode</p>
                    <p>Only one screenshot was captured. This might be because:</p>
                    <ul className="ml-4 mt-1 list-disc">
                      <li>Website loads very quickly</li>
                      <li>Lighthouse captured only the final state</li>
                      <li>Progressive loading wasn't detected</li>
                    </ul>
                    <p className="mt-2">Screenshot shows: <strong>{report.performance.screenshots.map(s => s.phase).join(', ')}</strong> state</p>
                  </>
                ) : (
                  <>
                    <p>Loading phases: {[...new Set(report.performance.screenshots.map(s => s.phase))].join(', ')}</p>
                    <p>Time range: {((report.performance.screenshots[report.performance.screenshots.length - 1]?.timestamp || 0) / 1000).toFixed(1)}s</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Timeline visualization for single screenshot */}
            {report.performance.screenshots.length === 1 && (
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Loading Timeline Context</h4>
                <div className="space-y-2">
                  {report.performance.screenshots[0].timelineContext && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {report.performance.screenshots[0].timelineContext.firstContentfulPaint && (
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="font-medium text-blue-800">First Contentful Paint</div>
                          <div className="text-blue-600">{(report.performance.screenshots[0].timelineContext.firstContentfulPaint / 1000).toFixed(2)}s</div>
                        </div>
                      )}
                      {report.performance.screenshots[0].timelineContext.largestContentfulPaint && (
                        <div className="bg-green-50 p-2 rounded">
                          <div className="font-medium text-green-800">Largest Contentful Paint</div>
                          <div className="text-green-600">{(report.performance.screenshots[0].timelineContext.largestContentfulPaint / 1000).toFixed(2)}s</div>
                        </div>
                      )}
                      {report.performance.screenshots[0].timelineContext.speedIndex && (
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="font-medium text-yellow-800">Speed Index</div>
                          <div className="text-yellow-600">{(report.performance.screenshots[0].timelineContext.speedIndex / 1000).toFixed(2)}s</div>
                        </div>
                      )}
                      {report.performance.screenshots[0].timelineContext.timeToInteractive && (
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="font-medium text-purple-800">Time to Interactive</div>
                          <div className="text-purple-600">{(report.performance.screenshots[0].timelineContext.timeToInteractive / 1000).toFixed(2)}s</div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    📸 Screenshot captured at: <strong>{((report.performance.screenshots[0].timestamp || 0) / 1000).toFixed(2)}s</strong>
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {report.performance.screenshots.map((screenshot, index) => {
                            // Debug the screenshot data
                            console.log(`Screenshot ${index + 1}:`, {
                              id: screenshot.id,
                              dataLength: screenshot.data ? screenshot.data.length : 0,
                              dataPreview: screenshot.data ? screenshot.data.substring(0, 50) + '...' : 'No data',
                              width: screenshot.width,
                              height: screenshot.height
                            });
                            
                            // Validate base64 data
                            const isValidBase64 = screenshot.data && 
                              typeof screenshot.data === 'string' && 
                              screenshot.data.length > 0 &&
                              /^[A-Za-z0-9+/]*={0,2}$/.test(screenshot.data);
                            
                            // Try to detect image format from base64 data
                            let detectedFormat = 'png'; // default
                            if (screenshot.data) {
                              try {
                                const binaryString = atob(screenshot.data.substring(0, 20));
                                const bytes = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                  bytes[i] = binaryString.charCodeAt(i);
                                }
                                
                                // Check PNG signature
                                if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                                  detectedFormat = 'png';
                                }
                                // Check JPEG signature
                                else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                                  detectedFormat = 'jpeg';
                                }
                                // Check WebP signature
                                else if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
                                  detectedFormat = 'webp';
                                }
                              } catch (e) {
                                console.log('Could not detect image format, using PNG as default');
                              }
                            }
                            
                            console.log(`Screenshot ${index + 1}:`, {
                              base64Valid: isValidBase64,
                              detectedFormat: detectedFormat,
                              dataLength: screenshot.data ? screenshot.data.length : 0
                            });
                            
                            // Get phase color
                            const getPhaseColor = (phase) => {
                              switch (phase) {
                                case 'initial': return 'bg-red-100 border-red-300 text-red-800';
                                case 'early': return 'bg-orange-100 border-orange-300 text-orange-800';
                                case 'loading': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
                                case 'late': return 'bg-blue-100 border-blue-300 text-blue-800';
                                case 'complete': return 'bg-green-100 border-green-300 text-green-800';
                                default: return 'bg-gray-100 border-gray-300 text-gray-800';
                              }
                            };
                            
                            const seconds = (screenshot.timestamp / 1000).toFixed(1);
                            
                            return (
                              <div key={screenshot.id} className="bg-white rounded-lg border overflow-hidden">
                                <div className="p-3 bg-gray-100 border-b">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm text-gray-800">
                                      {screenshot.description}
                                    </h4>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPhaseColor(screenshot.phase)}`}>
                                      {screenshot.phase}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {screenshot.width} × {screenshot.height} • {seconds}s
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Data length: {screenshot.data ? screenshot.data.length : 0} chars
                                  </p>
                                  <p className={`text-xs ${isValidBase64 ? 'text-green-600' : 'text-red-600'}`}>
                                    Base64 valid: {isValidBase64 ? 'Yes' : 'No'}
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    Detected format: {detectedFormat.toUpperCase()}
                                  </p>
                                </div>
                                <div className="p-2">
                                  {screenshot.data && screenshot.data.length > 0 ? (
                                    <>
                                      {/* Try detected format first */}
                                      <img 
                                        src={`data:image/${detectedFormat};base64,${screenshot.data}`}
                                        alt={`Screenshot ${index + 1} (${detectedFormat.toUpperCase()})`}
                                        className="w-full h-auto rounded border"
                                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                                        onError={(e) => {
                                          console.log(`${detectedFormat.toUpperCase()} format failed, trying other formats...`);
                                          // Hide detected format image and show fallback
                                          e.target.style.display = 'none';
                                          const fallbackImg = e.target.nextElementSibling;
                                          if (fallbackImg) fallbackImg.style.display = 'block';
                                        }}
                                        onLoad={() => {
                                          console.log(`Successfully loaded screenshot ${index + 1} as ${detectedFormat.toUpperCase()}`);
                                        }}
                                      />
                                      {/* Try JPEG as fallback */}
                                      <img 
                                        src={`data:image/jpeg;base64,${screenshot.data}`}
                                        alt={`Screenshot ${index + 1} (JPEG)`}
                                        className="w-full h-auto rounded border"
                                        style={{ maxHeight: '200px', objectFit: 'contain', display: 'none' }}
                                        onError={(e) => {
                                          console.log('JPEG format also failed, trying WebP...');
                                          // Hide JPEG image and show WebP fallback
                                          e.target.style.display = 'none';
                                          const webpImg = e.target.nextElementSibling;
                                          if (webpImg) webpImg.style.display = 'block';
                                        }}
                                        onLoad={() => {
                                          console.log(`Successfully loaded screenshot ${index + 1} as JPEG`);
                                        }}
                                      />
                                      {/* Try WebP as final fallback */}
                                      <img 
                                        src={`data:image/webp;base64,${screenshot.data}`}
                                        alt={`Screenshot ${index + 1} (WebP)`}
                                        className="w-full h-auto rounded border"
                                        style={{ maxHeight: '200px', objectFit: 'contain', display: 'none' }}
                                        onError={(e) => {
                                          console.error('All image formats failed for screenshot:', screenshot.id);
                                          console.error('Base64 data preview:', screenshot.data ? screenshot.data.substring(0, 100) : 'No data');
                                          // Hide WebP image and show error fallback
                                          e.target.style.display = 'none';
                                          const errorDiv = e.target.parentElement.querySelector('.error-fallback');
                                          if (errorDiv) errorDiv.style.display = 'block';
                                        }}
                                        onLoad={() => {
                                          console.log(`Successfully loaded screenshot ${index + 1} as WebP`);
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <div className="w-full h-32 bg-red-50 border border-red-200 rounded flex items-center justify-center text-red-500 text-sm">
                                      <div className="text-center">
                                        <div className="text-2xl mb-1">❌</div>
                                        <div>No Image Data</div>
                                        <div className="text-xs text-red-400 mt-1">
                                          Screenshot data is empty
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div 
                                    className="error-fallback w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm"
                                    style={{ display: 'none' }}
                                  >
                                    <div className="text-center">
                                      <div className="text-2xl mb-1">🖼️</div>
                                      <div>Screenshot {index + 1}</div>
                                      <div className="text-xs text-gray-400">
                                        {screenshot.width} × {screenshot.height}
                                      </div>
                                      <div className="text-xs text-red-400 mt-1">
                                        All image formats failed
                                      </div>
                                      <div className="text-xs text-blue-400 mt-1">
                                        {!isValidBase64 ? 'Invalid base64 format' : 'Valid base64, unknown format'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Loading Sequence Screenshots</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          No screenshots were captured during this Lighthouse analysis. This may be due to:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                          <li>Website loading too quickly</li>
                          <li>Screenshot capture disabled</li>
                          <li>Browser compatibility issues</li>
                          <li>Analysis completed before screenshots could be captured</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {(!report.performance.firstContentfulPaint && (!report.performance.suggestions || report.performance.suggestions.length === 0)) && (
                    <div className="text-center text-gray-500 py-8">
                      <p>Performance metrics could not be retrieved. This may be due to:</p>
                      <ul className="mt-2 text-sm">
                        <li>• Website is not accessible or down</li>
                        <li>• Chrome security restrictions (interstitial error)</li>
                        <li>• Network connectivity issues</li>
                        <li>• Website is blocking automated analysis</li>
                        <li>• Invalid or redirecting URL</li>
                      </ul>
                      {report.performance.message && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm font-medium">Error Details:</p>
                          <p className="text-red-600 text-sm">{report.performance.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
export default LighthouseTab;