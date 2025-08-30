import React, { useState, useRef } from 'react';
import { analyzeWebsite, analyzePrivacyTracking, testWebsiteAccessibility, analyzeTechStack, analyzeSecurityHeaders, analyzeMobileFriendly } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Zap, Shield, Code, Smartphone, Eye } from 'lucide-react';

// Import tab components
import LighthouseTab from './tabs/LighthouseTab';
import PrivacyTrackingTab from './tabs/PrivacyTrackingTab';
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
  const [isAnalyzingPrivacy, setIsAnalyzingPrivacy] = useState(false);
  const [privacyResult, setPrivacyResult] = useState(null);
  const reportRef = useRef(null);

  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

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

  const handleAnalyzePrivacy = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL first');
      return;
    }

    setIsAnalyzingPrivacy(true);
    setError(null);
    setPrivacyResult(null);

    try {
      const result = await analyzePrivacyTracking(url);
      setPrivacyResult(result);
    } catch (error) {
      console.error('Privacy tracking analysis failed:', error);
      setError(error.message);
    } finally {
      setIsAnalyzingPrivacy(false);
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
      case 'privacy':
        if (!privacyResult) {
          await handleAnalyzePrivacy();
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
    <div className="min-h-screen bg-slate-950" style={{ 
      backgroundColor: '#020617', 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      margin: 0,
      padding: 0
    }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-slate-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30 mr-6 overflow-hidden">
              <img 
                src="/image.png" 
                alt="WebSense Logo" 
                className="w-14 h-14 object-cover rounded-2xl"
              />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-100 via-blue-100 to-slate-100 bg-clip-text text-transparent">
            WEBSENSE
          </h1>
        </div>
        <p className="text-center text-slate-400 mb-12 text-xl">Professional Website Analysis & Intelligence</p>
        
        {!report ? (
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-slate-600/20 rounded-xl blur opacity-75"></div>
              <div className="relative bg-slate-900/40 rounded-xl border border-slate-800/50 backdrop-blur-md p-8">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="url" className="block text-slate-300 font-semibold mb-4 text-lg">
                        Website URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-100 placeholder-slate-400 text-lg backdrop-blur-sm"
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleTestAccessibility}
                        disabled={isTestingAccessibility || !url.trim()}
                        className="px-6 py-3 bg-slate-700/50 text-slate-100 rounded-lg hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 border border-slate-600/50 backdrop-blur-sm transition-all duration-300"
                      >
                        {isTestingAccessibility ? 'Testing...' : 'Test Accessibility'}
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting || !url.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg hover:from-blue-500 hover:to-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold transition-all duration-300"
                      >
                        {isSubmitting ? 'Analyzing...' : 'Analyze Website'}
                      </button>
                    </div>
                    
                    {/* Accessibility Test Result */}
                    {accessibilityResult && (
                      <div className={`p-6 rounded-xl border backdrop-blur-sm ${
                        accessibilityResult.accessible 
                          ? 'bg-blue-950/50 border-blue-800/50' 
                          : 'bg-red-950/50 border-red-800/50'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          accessibilityResult.accessible ? 'text-blue-200' : 'text-red-200'
                        }`}>
                          Website Accessibility Test Result
                        </h4>
                        <p className={`text-sm ${
                          accessibilityResult.accessible ? 'text-blue-300' : 'text-red-300'
                        }`}>
                          {accessibilityResult.message}
                        </p>
                        {accessibilityResult.statusCode && (
                          <p className={`text-sm mt-2 ${
                            accessibilityResult.accessible ? 'text-blue-400' : 'text-red-400'
                          }`}>
                            Status Code: {accessibilityResult.statusCode}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </form>
                
                {/* Analysis Type Cards */}
                <div className="mt-20">
                  <h3 className="text-4xl font-bold text-slate-100 mb-16 text-center">What Data Can You Get?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    
                    {/* Lighthouse Card */}
                    <div className="p-12 rounded-3xl border-2 border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-105">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="p-6 bg-yellow-500/20 rounded-2xl border-2 border-yellow-500/40">
                          <Zap className="w-12 h-12 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-slate-100">Lighthouse Analysis</h4>
                          <p className="text-slate-400 text-xl">Performance & SEO metrics</p>
                        </div>
                      </div>
                      <div className="space-y-5 text-slate-300 text-xl">
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-green-400 rounded-full"></div>
                          <span>Performance scores</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                          <span>SEO optimization</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-purple-400 rounded-full"></div>
                          <span>Accessibility checks</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Privacy & Tracking Card */}
                    <div className="p-12 rounded-3xl border-2 border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-105">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="p-6 bg-green-500/20 rounded-2xl border-2 border-green-500/40">
                          <Shield className="w-12 h-12 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-slate-100">Privacy & Tracking</h4>
                          <p className="text-slate-400 text-xl">Third-party analysis</p>
                        </div>
                      </div>
                      <div className="space-y-5 text-slate-300 text-xl">
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-red-400 rounded-full"></div>
                          <span>Tracker detection</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
                          <span>Ad services</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                          <span>Analytics scripts</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tech Stack Card */}
                    <div className="p-12 rounded-3xl border-2 border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-105">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="p-6 bg-blue-500/20 rounded-2xl border-2 border-blue-500/40">
                          <Code className="w-12 h-12 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-slate-100">Tech Stack</h4>
                          <p className="text-slate-400 text-xl">Technologies used</p>
                        </div>
                      </div>
                      <div className="space-y-5 text-slate-300 text-xl">
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-cyan-400 rounded-full"></div>
                          <span>Frameworks</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-indigo-400 rounded-full"></div>
                          <span>Libraries</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-purple-400 rounded-full"></div>
                          <span>Hosting platforms</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Headers Card */}
                    <div className="p-12 rounded-3xl border-2 border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-105">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="p-6 bg-red-500/20 rounded-2xl border-2 border-red-500/40">
                          <Shield className="w-12 h-12 text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-slate-100">Security Headers</h4>
                          <p className="text-slate-400 text-xl">Security analysis</p>
                        </div>
                      </div>
                      <div className="space-y-5 text-slate-300 text-xl">
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-green-400 rounded-full"></div>
                          <span>Header security</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                          <span>Vulnerability checks</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-red-400 rounded-full"></div>
                          <span>Security score</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Friendly Card */}
                    <div className="p-12 rounded-3xl border-2 border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-105">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="p-6 bg-green-500/20 rounded-2xl border-2 border-green-500/40">
                          <Smartphone className="w-12 h-12 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-slate-100">Mobile Friendly</h4>
                          <p className="text-slate-400 text-xl">Mobile optimization</p>
                        </div>
                      </div>
                      <div className="space-y-5 text-slate-300 text-xl">
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-green-400 rounded-full"></div>
                          <span>Responsive design</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                          <span>Touch optimization</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-purple-400 rounded-full"></div>
                          <span>Mobile performance</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Accessibility Card */}
                    <div className="p-12 rounded-3xl border-2 border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-105">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="p-6 bg-purple-500/20 rounded-2xl border-2 border-purple-500/40">
                          <Eye className="w-12 h-12 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-slate-100">Accessibility</h4>
                          <p className="text-slate-400 text-xl">WCAG compliance</p>
                        </div>
                      </div>
                      <div className="space-y-5 text-slate-300 text-xl">
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-green-400 rounded-full"></div>
                          <span>Screen reader support</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                          <span>Keyboard navigation</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-5 h-5 bg-purple-400 rounded-full"></div>
                          <span>Color contrast</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-6 bg-red-950/50 border border-red-800/50 text-red-200 px-6 py-4 rounded-xl backdrop-blur-sm">
                    <p className="font-semibold">Analysis Error:</p>
                    <p>{error}</p>
                    <p className="text-sm mt-2 text-red-300">Please check the browser console for more details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-md overflow-hidden">
            <div ref={reportRef}>
              <div className="p-8 border-b border-slate-800/50">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Report for {report.url}</h2>
                <p className="text-slate-400 text-lg">Generated on {new Date().toLocaleString()}</p>
              </div>
              
              {/* Tab Navigation - Matching Website Design */}
<div className="bg-slate-900 py-6 px-8">
  <div className="max-w-7xl mx-auto">
    <nav className="flex gap-4">
      {/* Lighthouse Tab */}
<button
  onClick={() => handleTabChange('lighthouse')}
  className={`group relative flex-1 px-6 py-4 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-300 transform ${
    activeTab === 'lighthouse'
      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
  }`}
>
  <div className="flex items-center justify-center gap-2">
    <div className={`w-2 h-2 rounded-full ${
      activeTab === 'lighthouse' ? 'bg-white' : 'bg-slate-500'
    }`}></div>
    Lighthouse
  </div>
  
  {/* Click Animation Overlay */}
  <div className={`absolute inset-0 bg-blue-500/20 rounded-xl transition-opacity duration-200 ${
    activeTab === 'lighthouse' ? 'opacity-100 animate-pulse' : 'opacity-0'
  }`}></div>
</button>

      {/* Privacy & Tracking Tab */}
<button
  onClick={() => handleTabChange('privacy')}
  className={`group relative flex-1 px-6 py-4 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-300 transform ${
    activeTab === 'privacy'
      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
  }`}
>
  <div className="flex items-center justify-center gap-2">
    <div className={`w-2 h-2 rounded-full ${
      activeTab === 'privacy' ? 'bg-white' : 'bg-slate-500'
    }`}></div>
    Privacy & Tracking
  </div>
  
  <div className={`absolute inset-0 bg-orange-500/20 rounded-xl transition-opacity duration-200 ${
    activeTab === 'privacy' ? 'opacity-100 animate-pulse' : 'opacity-0'
  }`}></div>
</button>

      {/* Tech Stack Tab */}
      <button
        onClick={() => handleTabChange('techstack')}
        className={`group relative flex-1 px-6 py-4 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-300 transform ${
          activeTab === 'techstack'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            activeTab === 'techstack' ? 'bg-white' : 'bg-slate-500'
          }`}></div>
          Tech Stack
        </div>
        
        <div className={`absolute inset-0 bg-purple-500/20 rounded-xl transition-opacity duration-200 ${
          activeTab === 'techstack' ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}></div>
      </button>

      {/* Security Headers Tab */}
      <button
        onClick={() => handleTabChange('security')}
        className={`group relative flex-1 px-6 py-4 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-300 transform ${
          activeTab === 'security'
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-105'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            activeTab === 'security' ? 'bg-white' : 'bg-slate-500'
          }`}></div>
          Security Headers
        </div>
        
        <div className={`absolute inset-0 bg-red-500/20 rounded-xl transition-opacity duration-200 ${
          activeTab === 'security' ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}></div>
      </button>

      {/* Mobile-Friendly Tab */}
      <button
        onClick={() => handleTabChange('mobile')}
        className={`group relative flex-1 px-6 py-4 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-300 transform ${
          activeTab === 'mobile'
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            activeTab === 'mobile' ? 'bg-white' : 'bg-slate-500'
          }`}></div>
          Mobile-Friendly
        </div>
        
        <div className={`absolute inset-0 bg-emerald-500/20 rounded-xl transition-opacity duration-200 ${
          activeTab === 'mobile' ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}></div>
      </button>
    </nav>
  </div>
</div>
              
              <div className="p-8">
                {/* Lighthouse Tab */}
                {activeTab === 'lighthouse' && (
                  <LighthouseTab 
                    report={report} 
                  />
                )}
                
                {/* Privacy & Tracking Tab */}
                {activeTab === 'privacy' && (
                  <PrivacyTrackingTab 
                    isAnalyzingPrivacy={isAnalyzingPrivacy} 
                    privacyResult={privacyResult} 
                    handleAnalyzePrivacy={handleAnalyzePrivacy}
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
            
            <div className="p-8 border-t border-slate-800/50 bg-slate-900/20 flex justify-between">
              <button 
                onClick={() => {
                  setReport(null);
                  setError(null);
                  console.log('Cleared report and ready for new analysis');
                }}
                className="bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 px-8 rounded-lg hover:from-blue-500 hover:to-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold transition-all duration-300"
              >
                Analyze Another Website
              </button>
              
              <button 
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                className="bg-gradient-to-r from-indigo-600 to-slate-700 text-white py-3 px-8 rounded-lg hover:from-indigo-500 hover:to-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    </div>
  );
};

export default AddWebsite;