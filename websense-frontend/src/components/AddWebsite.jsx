import React, { useState, useRef } from 'react';
import { analyzeWebsite, analyzeCoreWebVitals, testWebsiteAccessibility, analyzeTechStack, analyzeSecurityHeaders, analyzeMobileFriendly } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import tab components
import LighthouseTab from './tabs/LighthouseTab';
import CoreWebVitalsTab from './tabs/CoreWebVitalsTab';
import TechStackTab from './tabs/TechStackTab';
import SecurityHeadersTab from './tabs/SecurityHeadersTab';
import MobileFriendlyTab from './tabs/MobileFriendlyTab';

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
                <LighthouseTab 
                  report={report} 
                />
              )}
              
              {/* Core Web Vitals Tab */}
              {activeTab === 'corewebvitals' && (
                <CoreWebVitalsTab 
                  isAnalyzingCoreWebVitals={isAnalyzingCoreWebVitals} 
                  coreWebVitalsResult={coreWebVitalsResult} 
                  handleAnalyzeCoreWebVitals={handleAnalyzeCoreWebVitals}
                />
              )}
              
              {/* Tech Stack Tab */}
              {activeTab === 'techstack' && (
                <TechStackTab 
                  techStackData={techStackResult} 
                  techStackAnalysisStatus={isAnalyzingTechStack ? 'loading' : techStackResult ? 'success' : 'error'} 
                  techStackError={techStackResult?.message || error} 
                />
              )}
              
              {/* Security Headers Tab */}
              {activeTab === 'security' && (
                <SecurityHeadersTab 
                  securityHeadersData={securityHeadersResult} 
                  securityHeadersAnalysisStatus={isAnalyzingSecurityHeaders ? 'loading' : securityHeadersResult ? 'success' : 'error'} 
                  securityHeadersError={securityHeadersResult?.message || error} 
                />
              )}
              
              {/* Mobile-Friendly Tab */}
              {activeTab === 'mobile' && (
                <MobileFriendlyTab 
                  mobileFriendlyData={mobileFriendlyResult} 
                  mobileFriendlyAnalysisStatus={isAnalyzingMobileFriendly ? 'loading' : mobileFriendlyResult ? 'success' : 'error'} 
                  mobileFriendlyError={mobileFriendlyResult?.message || error} 
                />
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

export default AddWebsite;