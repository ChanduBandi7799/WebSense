import React, { useState, useRef } from 'react';
import { analyzeWebsite, analyzeCoreWebVitals, testWebsiteAccessibility, analyzeTechStack, analyzeSecurityHeaders, analyzeMobileFriendly } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AddWebsite = () => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('lighthouse');
  const [isTestingAccessibility, setIsTestingAccessibility] = useState(false);
  const [accessibilityResult, setAccessibilityResult] = useState(null);
  const [isAnalyzingTechStack, setIsAnalyzingTechStack] = useState(false);
  const [techStackResult, setTechStackResult] = useState(null);
  const [isAnalyzingSecurityHeaders, setIsAnalyzingSecurityHeaders] = useState(false);
  const [securityHeadersResult, setSecurityHeadersResult] = useState(null);
  const [isAnalyzingMobileFriendly, setIsAnalyzingMobileFriendly] = useState(false);
  const [mobileFriendlyResult, setMobileFriendlyResult] = useState(null);
  const [isAnalyzingCoreWebVitals, setIsAnalyzingCoreWebVitals] = useState(false);
  const [coreWebVitalsResult, setCoreWebVitalsResult] = useState(null);
  const reportRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setReport(null);

    try {
      // Run Lighthouse analysis only (Core Web Vitals is handled separately in tabs)
      const lighthouseResult = await analyzeWebsite(url).catch(error => {
        console.error('Lighthouse analysis failed:', error);
        return { error: true, message: error.message };
      });

      // Debug: Log the received data
      console.log('Lighthouse result received:', lighthouseResult);
      console.log('Lighthouse result keys:', Object.keys(lighthouseResult));
      
      // Debug screenshots
      if (lighthouseResult.screenshots) {
        console.log('Screenshots found in Lighthouse result:', lighthouseResult.screenshots.length);
        console.log('All screenshots:', lighthouseResult.screenshots);
        lighthouseResult.screenshots.forEach((screenshot, index) => {
          console.log(`Screenshot ${index + 1}:`, {
            id: screenshot.id,
            description: screenshot.description,
            phase: screenshot.phase,
            timestamp: screenshot.timestamp,
            dataLength: screenshot.data ? screenshot.data.length : 0
          });
        });
      } else {
        console.log('No screenshots found in Lighthouse result');
      }

      // Set the complete report
      setReport({
        url,
        performance: lighthouseResult
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAccessibility = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setIsTestingAccessibility(true);
    setError(null);
    setAccessibilityResult(null);

    try {
      const result = await testWebsiteAccessibility(url);
      setAccessibilityResult(result);
    } catch (error) {
      console.error('Accessibility test failed:', error);
      setError(error.message);
    } finally {
      setIsTestingAccessibility(false);
    }
  };

  const handleAnalyzeTechStack = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setIsAnalyzingTechStack(true);
    setError(null);
    setTechStackResult(null);

    try {
      const result = await analyzeTechStack(url);
      setTechStackResult(result);
    } catch (error) {
      console.error('Tech stack analysis failed:', error);
      setError(error.message);
    } finally {
      setIsAnalyzingTechStack(false);
    }
  };

  const handleAnalyzeSecurityHeaders = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setIsAnalyzingSecurityHeaders(true);
    setError(null);
    setSecurityHeadersResult(null);

    try {
      const result = await analyzeSecurityHeaders(url);
      setSecurityHeadersResult(result);
    } catch (error) {
      console.error('Security headers analysis failed:', error);
      setError(error.message);
    } finally {
      setIsAnalyzingSecurityHeaders(false);
    }
  };

  const handleAnalyzeMobileFriendly = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setIsAnalyzingMobileFriendly(true);
    setError(null);
    setMobileFriendlyResult(null);

    try {
      const result = await analyzeMobileFriendly(url);
      setMobileFriendlyResult(result);
    } catch (error) {
      console.error('Mobile-friendly analysis failed:', error);
      setError(error.message);
    } finally {
      setIsAnalyzingMobileFriendly(false);
    }
  };

  const handleAnalyzeCoreWebVitals = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setIsAnalyzingCoreWebVitals(true);
    setError(null);
    setCoreWebVitalsResult(null);

    try {
      const result = await analyzeCoreWebVitals(url);
      setCoreWebVitalsResult(result);
    } catch (error) {
      console.error('Core Web Vitals analysis failed:', error);
      setError(error.message);
    } finally {
      setIsAnalyzingCoreWebVitals(false);
    }
  };

  const handleTabChange = async (tabName) => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setActiveTab(tabName);
    setError(null);

    // Automatically trigger analysis based on the tab
    switch (tabName) {
      case 'lighthouse':
        // Lighthouse analysis is already handled by the main form submit
        break;
      case 'corewebvitals':
        if (!coreWebVitalsResult) {
          await handleAnalyzeCoreWebVitals();
        }
        break;
      case 'techstack':
        if (!techStackResult) {
          await handleAnalyzeTechStack();
        }
        break;
      case 'security':
        if (!securityHeadersResult) {
          await handleAnalyzeSecurityHeaders();
        }
        break;
      case 'mobile':
        if (!mobileFriendlyResult) {
          await handleAnalyzeMobileFriendly();
        }
        break;
      default:
        break;
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const reportElement = reportRef.current;
      
      // Get the dimensions of the report element
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the report image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      const filename = `${report.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}-report.pdf`;
      pdf.save(filename);
      console.log(`PDF generated successfully: ${filename}`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please check the console for details and try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        <span className="text-green-600">Analyze</span> <span className="text-blue-600">Website</span>
      </h1>
      
      {!report ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-gray-700 font-medium mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestAccessibility}
                  disabled={isTestingAccessibility || !url.trim()}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {isTestingAccessibility ? 'Testing...' : 'Test Accessibility'}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !url.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Analyzing...' : 'Analyze Website'}
                </button>
              </div>
              
              {/* Accessibility Test Result */}
              {accessibilityResult && (
                <div className={`p-4 rounded-lg border ${
                  accessibilityResult.accessible 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    accessibilityResult.accessible ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Website Accessibility Test Result
                  </h4>
                  <p className={`text-sm ${
                    accessibilityResult.accessible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {accessibilityResult.message}
                  </p>
                  {accessibilityResult.statusCode && (
                    <p className={`text-sm mt-1 ${
                      accessibilityResult.accessible ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Status Code: {accessibilityResult.statusCode}
                    </p>
                  )}
                </div>
              )}


            </div>
          </form>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Analysis Error:</p>
              <p>{error}</p>
              <p className="text-sm mt-2">Please check the browser console for more details.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div ref={reportRef}>
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Report for {report.url}</h2>
              <p className="text-sm text-gray-600 mt-1">Generated on {new Date().toLocaleString()}</p>
            </div>
            
            {/* Tab Navigation - Lighthouse, Core Web Vitals, Tech Stack, Security Headers, and Mobile-Friendly */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('lighthouse')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'lighthouse'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lighthouse
                </button>
                <button
                  onClick={() => handleTabChange('corewebvitals')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'corewebvitals'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Core Web Vitals
                </button>
                <button
                  onClick={() => handleTabChange('techstack')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'techstack'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tech Stack
                </button>
                <button
                  onClick={() => handleTabChange('security')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Security Headers
                </button>
                <button
                  onClick={() => handleTabChange('mobile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'mobile'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mobile-Friendly
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {/* Lighthouse Tab */}
              {activeTab === 'lighthouse' && (
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
              
              {/* Core Web Vitals Tab */}
              {activeTab === 'corewebvitals' && (
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
                        <CoreWebVitalsDisplay data={coreWebVitalsResult} />
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
              )}
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <button 
              onClick={() => {
                setReport(null);
                setError(null);
                console.log('Cleared report and ready for new analysis');
              }}
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Analyze Another Website
            </button>
            
            <button 
              onClick={generatePDF}
              disabled={isGeneratingPdf}
              className="bg-purple-500 text-white py-2 px-6 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center"
            >
              {isGeneratingPdf ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF Report
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Tech Stack Tab */}
      {activeTab === 'techstack' && (
        <>
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-purple-800 font-medium mb-2">Tech Stack Analysis</h4>
            <p className="text-purple-700 text-sm">
              Analyze the technology stack of any website using Wappalyzer. This will detect frameworks, 
              libraries, CMS platforms, hosting providers, and more.
            </p>
          </div>
          
          {isAnalyzingTechStack ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="animate-spin mx-auto h-12 w-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Tech Stack...</h3>
              <p className="text-gray-500">Please wait while we analyze the technology stack.</p>
            </div>
          ) : techStackResult ? (
            <div className="space-y-6">
              {techStackResult.success ? (
                <TechStackDisplay data={techStackResult} />
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
                  <p className="text-gray-500 mb-4">
                    {techStackResult.message}
                  </p>
                  <button
                    onClick={handleAnalyzeTechStack}
                    disabled={isAnalyzingTechStack}
                    className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {isAnalyzingTechStack ? 'Analyzing...' : 'Try Again'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Click Tech Stack Tab to Analyze</h3>
              <p className="text-gray-500">Switch to the Tech Stack tab to automatically analyze the technology stack.</p>
            </div>
          )}
        </>
      )}
      
      {/* Security Headers Tab */}
      {activeTab === 'security' && (
        <>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-medium mb-2">Security Headers Analysis</h4>
            <p className="text-red-700 text-sm">
              Check if a website has essential HTTP security headers to protect against various attacks 
              like XSS, clickjacking, and downgrade attacks.
            </p>
          </div>
          
          {isAnalyzingSecurityHeaders ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="animate-spin mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Security Headers...</h3>
              <p className="text-gray-500">Please wait while we analyze the security headers.</p>
            </div>
          ) : securityHeadersResult ? (
            <div className="space-y-6">
              {securityHeadersResult.success ? (
                <SecurityHeadersDisplay data={securityHeadersResult} />
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
                  <p className="text-gray-500 mb-4">
                    {securityHeadersResult.message}
                  </p>
                  <button
                    onClick={handleAnalyzeSecurityHeaders}
                    disabled={isAnalyzingSecurityHeaders}
                    className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isAnalyzingSecurityHeaders ? 'Analyzing...' : 'Try Again'}
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
      )}
      
      {/* Mobile-Friendly Tab */}
      {activeTab === 'mobile' && (
        <>
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-orange-800 font-medium mb-2">Mobile-Friendly Test</h4>
            <p className="text-orange-700 text-sm">
              Test if a website is mobile-friendly by analyzing viewport settings, responsive design, 
              text readability, and other mobile-specific factors using Google's Mobile-Friendly Test API.
            </p>
          </div>
          
          {isAnalyzingMobileFriendly ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="animate-spin mx-auto h-12 w-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Mobile-Friendliness...</h3>
              <p className="text-gray-500">Please wait while we analyze the mobile-friendliness of this website.</p>
            </div>
          ) : mobileFriendlyResult ? (
            <div className="space-y-6">
              {mobileFriendlyResult.success ? (
                <MobileFriendlyDisplay data={mobileFriendlyResult} />
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
      )}
    </div>
  );
};

// Helper components for the report view
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

// Tech Stack Display Component
const TechStackDisplay = ({ data }) => {
  const renderTechList = (techs, title, color = 'blue') => {
    if (!techs || techs.length === 0) return null;
    
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    return (
      <div className={`p-3 rounded-lg border ${colorClasses[color]} mb-3`}>
        <h5 className="font-medium mb-2">{title}</h5>
        <div className="space-y-1">
          {techs.map((tech, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="font-medium">{tech.name}</span>
              <div className="flex items-center space-x-2">
                {tech.version && tech.version !== 'Unknown' && (
                  <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                    v{tech.version}
                  </span>
                )}
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                  {tech.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tech Stack */}
      {data.techStack && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Technology Stack</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderTechList(data.techStack.frontend, 'Frontend', 'blue')}
            {renderTechList(data.techStack.backend, 'Backend', 'green')}
            {renderTechList(data.techStack.databases, 'Databases', 'purple')}
            {renderTechList(data.techStack.programmingLanguages, 'Programming Languages', 'orange')}
            {renderTechList(data.techStack.frameworks, 'Frameworks', 'red')}
            {renderTechList(data.techStack.libraries, 'Libraries', 'yellow')}
          </div>
        </div>
      )}

      {/* CMS */}
      {renderTechList(data.cms, 'Content Management Systems', 'green')}

      {/* E-commerce */}
      {renderTechList(data.ecommerce, 'E-commerce Platforms', 'purple')}

      {/* Analytics */}
      {renderTechList(data.analytics, 'Analytics & Tracking', 'blue')}

      {/* DevOps */}
      {data.devops && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">DevOps & Infrastructure</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderTechList(data.devops.webServers, 'Web Servers', 'blue')}
            {renderTechList(data.devops.cdn, 'CDN', 'green')}
            {renderTechList(data.devops.hosting, 'Hosting', 'purple')}
            {renderTechList(data.devops.cloudServices, 'Cloud Services', 'orange')}
          </div>
        </div>
      )}

      {/* Security */}
      {renderTechList(data.security, 'Security Tools', 'red')}

      {/* Competitor Analysis */}
      {data.competitor && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Competitor Insights</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderTechList(data.competitor.paymentProcessors, 'Payment Processors', 'green')}
            {renderTechList(data.competitor.advertisingNetworks, 'Advertising Networks', 'purple')}
            {renderTechList(data.competitor.abTesting, 'A/B Testing Tools', 'blue')}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2">Analysis Summary</h5>
        <div className="text-sm text-gray-600">
          <p>Analysis completed at: {new Date(data.timestamp).toLocaleString()}</p>
          <p>Total technologies detected: {
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
            (data.competitor?.abTesting?.length || 0)
          }</p>
        </div>
      </div>
    </div>
  );
};

// Security Headers Display Component
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-800">Security Score</h4>
          <span className={`text-2xl font-bold ${getSecurityScoreColor(data.summary.securityScore)}`}>
            {data.summary.securityScore}/100
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {data.summary.totalHeaders} of 6 security headers present
          </span>
          <span className={`font-medium ${getSecurityScoreColor(data.summary.securityScore)}`}>
            {data.summary.overallStatus}
          </span>
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
          <ul className="space-y-2">
            {data.summary.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span className="text-sm text-yellow-700">{recommendation}</span>
              </li>
            ))}
          </ul>
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Mobile-Friendliness Verdict</h3>
            <p className="text-gray-600">Based on Google's Mobile-Friendly Test</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              data.verdict === 'MOBILE_FRIENDLY' ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.verdict === 'MOBILE_FRIENDLY' ? '✅ Mobile-Friendly' : '❌ Not Mobile-Friendly'}
            </div>
            <div className="text-sm text-gray-600">
              {data.verdict === 'MOBILE_FRIENDLY' ? 'Great job!' : 'Needs improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {data.issues && data.issues.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Issues Found</h4>
          <div className="space-y-3">
            {data.issues.map((issue, index) => renderIssue(issue, index))}
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
      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h4>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <ul className="space-y-2">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-orange-800">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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

// Core Web Vitals Display Component
const CoreWebVitalsDisplay = ({ data }) => {
  const renderMetricCard = (title, metric, color = 'blue') => {
    if (!metric || metric.total === 0) return null;
    
    const goodPercentage = Math.round((metric.good / metric.total) * 100);
    const needsImprovementPercentage = Math.round((metric.needsImprovement / metric.total) * 100);
    const poorPercentage = Math.round((metric.poor / metric.total) * 100);
    
    const getScoreColor = (percentage) => {
      if (percentage >= 75) return 'text-green-600';
      if (percentage >= 50) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className={`border rounded-lg p-4 bg-${color}-50 border-${color}-200`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800">{title}</h4>
          <span className={`text-lg font-bold ${getScoreColor(goodPercentage)}`}>
            {goodPercentage}%
          </span>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Good: {goodPercentage}%</span>
            <span>{metric.p75.toFixed(0)}ms (75th percentile)</span>
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
          {renderMetricCard('Largest Contentful Paint (LCP)', metrics.lcp, 'blue')}
          {renderMetricCard('Cumulative Layout Shift (CLS)', metrics.cls, 'purple')}
          {renderMetricCard('Interaction to Next Paint (INP)', metrics.inp, 'green')}
          {renderMetricCard('First Input Delay (FID)', metrics.fid, 'yellow')}
          {renderMetricCard('Time to First Byte (TTFB)', metrics.ttfb, 'red')}
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

export default AddWebsite;