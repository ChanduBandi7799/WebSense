import React, { useState, useRef } from 'react';
import { analyzeWebsite, analyzeWebsiteWithPageSpeed, analyzeSecurity, analyzeSEO, analyzeTechStack } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AddWebsite = () => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const reportRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log(`Starting analysis for: ${url}`);
      
      // Call all API endpoints in parallel
      const [performanceData, securityData, seoData, techStackData] = await Promise.allSettled([
        analyzeWebsiteWithPageSpeed(url),
        analyzeSecurity(url),
        analyzeSEO(url),
        analyzeTechStack(url)
      ]);
      
      // Handle performance data
      let performanceResult = null;
      if (performanceData.status === 'fulfilled' && !performanceData.value.error) {
        performanceResult = performanceData.value;
      } else {
        console.error('Performance analysis failed:', 
          performanceData.status === 'fulfilled' ? performanceData.value.errorMessage : performanceData.reason
        );
        setError(performanceData.status === 'fulfilled' 
          ? performanceData.value.errorMessage 
          : 'Performance analysis failed: ' + performanceData.reason?.message
        );
        setIsSubmitting(false);
        return;
      }
      
      // Handle security data
      let securityResult = { checks: {} };
      if (securityData.status === 'fulfilled' && !securityData.value.error) {
        securityResult = securityData.value;
      } else {
        console.error('Security analysis failed:', 
          securityData.status === 'fulfilled' ? securityData.value.errorMessage : securityData.reason
        );
        // Continue with empty security data instead of failing completely
      }
      
      // Handle SEO data
      let seoResult = { checks: {} };
      if (seoData.status === 'fulfilled' && !seoData.value.error) {
        seoResult = seoData.value;
      } else {
        console.error('SEO analysis failed:', 
          seoData.status === 'fulfilled' ? seoData.value.errorMessage : seoData.reason
        );
        // Continue with empty SEO data instead of failing completely
      }
      
      // Handle tech stack data
      let techStackResult = { technologies: [] };
      if (techStackData.status === 'fulfilled' && !techStackData.value.error) {
        techStackResult = techStackData.value;
      } else {
        console.error('Tech stack analysis failed:', 
          techStackData.status === 'fulfilled' ? techStackData.value.errorMessage : techStackData.reason
        );
        // Continue with empty tech stack data instead of failing completely
      }
      
      // Combine all data into a single report object
      setReport({
        url: url,
        performance: performanceResult.performance || {},
        seo: {
          ...performanceResult.seo || {},
          advancedChecks: seoResult.checks || {}
        },
        accessibility: performanceResult.accessibility || {},
        bestPractices: performanceResult.bestPractices || {},
        technologies: techStackResult.technologies || [],
        security: securityResult.checks || {},
        suggestions: performanceResult.suggestions || []
      });
      
      console.log('Analysis completed successfully');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Analysis failed with error:', err);
      setError('Failed to analyze website. Please check the console for details and try again.');
      setIsSubmitting(false);
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
            <div className="mb-4">
              <label htmlFor="url" className="block text-gray-700 font-medium mb-2">Website URL</label>
              <input
                type="url"
                id="url"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Analyzing... (This may take a minute)' : 'Analyze Website'}
            </button>
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
            
            {/* Tab Navigation */}
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`px-4 py-3 font-medium ${activeTab === 'performance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-4 py-3 font-medium ${activeTab === 'seo' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
                >
                  SEO
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-3 font-medium ${activeTab === 'security' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('tech')}
                  className={`px-4 py-3 font-medium ${activeTab === 'tech' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
                >
                  Tech Stack
                </button>
                <button
                  onClick={() => setActiveTab('accessibility')}
                  className={`px-4 py-3 font-medium ${activeTab === 'accessibility' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
                >
                  Accessibility
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <ScoreCard title="Performance" score={report.performance.score || 0} color="blue" />
                    <ScoreCard title="SEO" score={report.seo.score || 0} color="green" />
                    <ScoreCard title="Accessibility" score={report.accessibility.score || 0} color="yellow" />
                    <ScoreCard title="Best Practices" score={report.bestPractices.score || 0} color="purple" />
                  </div>
                  
                  {report.performance.firstContentfulPaint && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <MetricItem label="First Contentful Paint" value={report.performance.firstContentfulPaint || 'N/A'} />
                          <MetricItem label="Speed Index" value={report.performance.speedIndex || 'N/A'} />
                          <MetricItem label="Largest Contentful Paint" value={report.performance.largestContentfulPaint || 'N/A'} />
                          <MetricItem label="Time to Interactive" value={report.performance.timeToInteractive || 'N/A'} />
                          <MetricItem label="Total Blocking Time" value={report.performance.totalBlockingTime || 'N/A'} />
                          <MetricItem label="Cumulative Layout Shift" value={report.performance.cumulativeLayoutShift || 'N/A'} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {report.suggestions && report.suggestions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Performance Suggestions</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-3">
                          {report.suggestions.map((suggestion, index) => (
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
                  
                  {(!report.performance.firstContentfulPaint && (!report.suggestions || report.suggestions.length === 0)) && (
                    <div className="text-center text-gray-500 py-8">
                      <p>Performance metrics could not be retrieved. This may be due to:</p>
                      <ul className="mt-2 text-sm">
                        <li>• Website is not accessible</li>
                        <li>• API rate limits exceeded</li>
                        <li>• Network connectivity issues</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
              
              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">SEO Score</h3>
                    <div className="w-64">
                      <ScoreCard title="SEO" score={report.seo.score || 0} color="green" />
                    </div>
                  </div>
                  
                  {report.seo.issues && report.seo.issues.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Basic SEO Issues</h3>
                      <IssuesList title="SEO Issues" issues={report.seo.issues} />
                    </div>
                  )}
                  
                  {report.seo.advancedChecks && Object.keys(report.seo.advancedChecks).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Advanced SEO Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(report.seo.advancedChecks).map(([key, value]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="flex items-center">
                              {value.status === 'pass' ? (
                                <span className="text-green-500 mr-2">✓</span>
                              ) : value.status === 'warn' ? (
                                <span className="text-yellow-500 mr-2">⚠️</span>
                              ) : (
                                <span className="text-red-500 mr-2">✗</span>
                              )}
                              <h4 className="font-medium">{value.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(!report.seo.issues || report.seo.issues.length === 0) && 
                   (!report.seo.advancedChecks || Object.keys(report.seo.advancedChecks).length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <p>SEO analysis could not be completed.</p>
                      <p className="text-sm mt-2">Please check the console for error details.</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Security Analysis</h3>
                    {report.security && Object.keys(report.security).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(report.security).map(([key, value]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="flex items-center">
                              {value.status === 'secure' ? (
                                <span className="text-green-500 mr-2">✓</span>
                              ) : value.status === 'warning' ? (
                                <span className="text-yellow-500 mr-2">⚠️</span>
                              ) : (
                                <span className="text-red-500 mr-2">✗</span>
                              )}
                              <h4 className="font-medium">{value.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>Security analysis could not be completed.</p>
                        <p className="text-sm mt-2">Please check the console for error details.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Tech Stack Tab */}
              {activeTab === 'tech' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Technologies Detected</h3>
                    {report.technologies && report.technologies.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {report.technologies.map((tech, index) => (
                          <div key={index} className="border rounded-lg p-4 flex items-center">
                            {tech.icon && (
                              <img 
                                src={tech.icon} 
                                alt={tech.name} 
                                className="w-8 h-8 mr-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <span className="font-medium">{tech.name || tech}</span>
                              {tech.version && (
                                <p className="text-xs text-gray-500">{tech.version}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No technologies could be detected.</p>
                        <p className="text-sm mt-2">Please check the console for error details.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Accessibility Score</h3>
                    <div className="w-64">
                      <ScoreCard title="Accessibility" score={report.accessibility.score || 0} color="yellow" />
                    </div>
                  </div>
                  
                  {report.accessibility.issues && report.accessibility.issues.length > 0 ? (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Accessibility Issues</h3>
                      <IssuesList title="Accessibility Issues" issues={report.accessibility.issues} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Accessibility analysis could not be completed.</p>
                      <p className="text-sm mt-2">Please check the console for error details.</p>
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
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className={`border rounded-lg p-4 ${getColorClass()}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <div className={`text-3xl font-bold mt-2 ${getScoreColor()}`}>
        {score || 0}/100
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

const IssuesList = ({ title, issues }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-medium mb-3">{title}</h3>
    <ul className="list-disc pl-5 space-y-1">
      {issues && issues.length > 0 ? (
        issues.map((issue, index) => (
          <li key={index} className="text-gray-700">{issue}</li>
        ))
      ) : (
        <li className="text-gray-500">No issues found</li>
      )}
    </ul>
  </div>
);

export default AddWebsite;