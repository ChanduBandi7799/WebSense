import { Injectable } from '@nestjs/common';  
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const execAsync = promisify(exec);
// Default PageSpeed Insights API key - you should set this as an environment variable
const DEFAULT_PSI_API_KEY = process.env.PSI_API_KEY || 'AIzaSyD16688gvT2z1PLldcS4LVKu2Bhfa234kE';

@Injectable()
export class WebsiteAnalysisService {
  async runLighthouseAnalysis(url: string) {
    try {
      console.log(`Starting Lighthouse analysis for: ${url}`);
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Create a unique filename for this analysis
      const timestamp = Date.now();
      const reportFilename = `lighthouse-report-${timestamp}.json`;
      const reportPath = path.join(process.cwd(), 'reports', reportFilename);
      
      // Ensure reports directory exists
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Check Lighthouse version first
      try {
        const { stdout: versionOutput } = await execAsync('npx lighthouse --version');
        console.log('Lighthouse version:', versionOutput.trim());
      } catch (versionError) {
        console.warn('Could not determine Lighthouse version:', versionError.message);
        console.log('This might indicate Lighthouse is not properly installed.');
        console.log('Try running: npm install -g lighthouse');
      }
      
      // Also check if lighthouse is available globally
      try {
        const { stdout: globalVersion } = await execAsync('lighthouse --version');
        console.log('Global Lighthouse version:', globalVersion.trim());
      } catch (globalError) {
        console.log('No global Lighthouse installation found');
      }
      
      // Run Lighthouse using the CLI with better error handling and enhanced screenshot capture
      let command = `npx lighthouse ${url} --output=json --output-path=${reportPath} --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage" --timeout=60000 --preset=desktop --only-categories=performance,accessibility,best-practices,seo,pwa --screenshots --save-assets --max-wait-for-load=30000 --throttling-method=devtools`;
      
      console.log(`Executing command: ${command}`);
      
      try {
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
          console.warn('Lighthouse stderr:', stderr);
        }
        
        console.log('Lighthouse stdout length:', stdout.length);
        console.log('Lighthouse stdout preview:', stdout.substring(0, 500));
        
        // Check if report file was created
        if (!fs.existsSync(reportPath)) {
          throw new Error('Lighthouse report file was not created');
        }
        
        console.log('Lighthouse report file created successfully');
        console.log('Report file size:', fs.statSync(reportPath).size, 'bytes');
        
        // Check if the report has content
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        if (reportContent.length < 1000) {
          console.warn('Report file seems too small, may be incomplete');
          console.log('Report content preview:', reportContent);
        }
        
      } catch (execError) {
        console.error('Lighthouse command execution failed:', execError);
        
        // Try alternative command if first one fails
        if (execError.message.includes('timeout') || execError.message.includes('ECONNREFUSED')) {
          console.log('Trying alternative Lighthouse command...');
          command = `npx lighthouse ${url} --output=json --output-path=${reportPath} --chrome-flags="--headless --no-sandbox" --timeout=30000`;
          
          try {
            const { stdout, stderr } = await execAsync(command);
            console.log('Alternative command succeeded');
            
            if (stderr) {
              console.warn('Alternative command stderr:', stderr);
            }
            
            if (!fs.existsSync(reportPath)) {
              throw new Error('Alternative command also failed to create report file');
            }
          } catch (altError) {
            console.error('Alternative command also failed:', altError);
            throw execError; // Throw original error
          }
        } else if (execError.message.includes('ENOENT')) {
          throw new Error('Lighthouse CLI not found. Please ensure lighthouse is installed: npm install -g lighthouse');
        } else {
          throw new Error(`Lighthouse execution failed: ${execError.message}`);
        }
      }
      
      // Read and parse the report
      const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      
      // Debug: Show raw report structure
      console.log('Raw report keys:', Object.keys(reportData));
      console.log('Raw categories keys:', Object.keys(reportData.categories || {}));
      console.log('Raw categories data:', JSON.stringify(reportData.categories, null, 2));
      
      // Clean up report file
      try {
        fs.unlinkSync(reportPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup report file:', cleanupError);
      }
      
      // Check if the analysis failed due to page load errors
      if (reportData.runtimeError) {
        console.error('Lighthouse analysis failed:', reportData.runtimeError?.message || 'Unknown error');
        return {
          url: url,
          error: true,
          message: reportData.runtimeError?.message || 'Failed to analyze website. The site may be down or inaccessible.'
        };
      }
      
      // Check for Chrome interstitial errors
      if (reportData.audits && reportData.audits['final-screenshot']) {
        const finalScreenshot = reportData.audits['final-screenshot'];
        if (finalScreenshot.details && finalScreenshot.details.data) {
          // Check if the screenshot shows a Chrome error page
          const screenshotData = finalScreenshot.details.data;
          if (screenshotData.includes('chrome-error://') || 
              screenshotData.includes('ERR_') || 
              screenshotData.includes('This site can\'t be reached')) {
            console.error('Chrome interstitial error detected - website may be down or inaccessible');
            return {
              url: url,
              error: true,
              message: 'Website appears to be down or inaccessible. Chrome is showing an error page instead of the website content.'
            };
          }
        }
      }
      
      // Check if we have valid data structure
      if (!reportData.categories || !reportData.audits) {
        console.error('Lighthouse analysis returned invalid data structure');
        return {
          url: url,
          error: true,
          message: 'Analysis completed but returned invalid data structure.'
        };
      }
      
      // Check if we have at least some valid data
      const hasAnyValidData = reportData.categories && 
        Object.values(reportData.categories).some((cat: any) => cat && cat.score !== null && cat.score !== undefined);
      
      if (!hasAnyValidData) {
        console.error('Lighthouse analysis returned no valid category scores');
        return {
          url: url,
          error: true,
          message: 'Analysis completed but no valid scores were returned. The site may not be accessible.'
        };
      }
      
      console.log(`Lighthouse analysis completed successfully for: ${url}`);
      
      // Debug: Show what's actually available
      console.log('Available categories:', Object.keys(reportData.categories || {}));
      console.log('Available audits count:', Object.keys(reportData.audits || {}).length);
      
      // Show some sample audit keys
      const sampleAuditKeys = Object.keys(reportData.audits || {}).slice(0, 20);
      console.log('Sample audit keys:', sampleAuditKeys);
      
      // Check for specific category audits
      const accessibilityAudits = Object.keys(reportData.audits || {}).filter(key => key.includes('accessibility'));
      const bestPracticesAudits = Object.keys(reportData.audits || {}).filter(key => key.includes('best-practices') || key.includes('security') || key.includes('https'));
      const seoAudits = Object.keys(reportData.audits || {}).filter(key => key.includes('seo') || key.includes('meta') || key.includes('headings'));
      
      console.log('Accessibility-related audits:', accessibilityAudits);
      console.log('Best Practices-related audits:', bestPracticesAudits);
      console.log('SEO-related audits:', seoAudits);
      
      // Check category scores
      if (reportData.categories) {
        console.log('Performance score:', reportData.categories.performance?.score);
        console.log('Accessibility score:', reportData.categories.accessibility?.score);
        console.log('Best Practices score:', reportData.categories['best-practices']?.score);
        console.log('SEO score:', reportData.categories.seo?.score);
        console.log('PWA score:', reportData.categories.pwa?.score);
      }
      
      // Extract relevant information from the report
      const result = {
        url: url,
        // Performance - with fallbacks
        score: reportData.categories.performance?.score ? Math.round(reportData.categories.performance.score * 100) : 0,
        firstContentfulPaint: reportData.audits['first-contentful-paint']?.displayValue || 'N/A',
        speedIndex: reportData.audits['speed-index']?.displayValue || 'N/A',
        largestContentfulPaint: reportData.audits['largest-contentful-paint']?.displayValue || 'N/A',
        timeToInteractive: reportData.audits['interactive']?.displayValue || 'N/A',
        totalBlockingTime: reportData.audits['total-blocking-time']?.displayValue || 'N/A',
        cumulativeLayoutShift: reportData.audits['cumulative-layout-shift']?.displayValue || 'N/A',
        
        // Additional Performance Metrics - with fallbacks
        maxPotentialFID: reportData.audits['max-potential-fid']?.displayValue || 'N/A',
        serverResponseTime: reportData.audits['server-response-time']?.displayValue || 'N/A',
        renderBlockingResources: reportData.audits['render-blocking-resources']?.displayValue || 'N/A',
        unusedCSS: reportData.audits['unused-css-rules']?.displayValue || 'N/A',
        unusedJavaScript: reportData.audits['unused-javascript']?.displayValue || 'N/A',
        modernImageFormats: reportData.audits['modern-image-formats']?.displayValue || 'N/A',
        imageOptimization: reportData.audits['efficient-animated-content']?.displayValue || 'N/A',
        
        // Enhanced Performance Metrics
        ...this.extractEnhancedPerformanceMetrics(reportData.audits),
        
        // Category Scores - Only include if they exist
        categories: this.extractCategoryScores(reportData.categories),
        
        // Resource Analysis
        resources: this.extractResourceAnalysis(reportData.audits),
        
        // Detailed Suggestions
        suggestions: this.extractPerformanceSuggestions(reportData),
        
        // Accessibility Issues
        accessibilityIssues: this.extractAccessibilityIssues(reportData),
        
        // Best Practices Issues
        bestPracticesIssues: this.extractBestPracticesIssues(reportData),
        
        // SEO Issues
        seoIssues: this.extractSEOIssues(reportData),
        
        // Screenshots from Lighthouse
        screenshots: this.extractScreenshots(reportData)
      };
      
      // Debug: Show what we extracted
      console.log('Extracted categories:', result.categories);
      console.log('Extracted resources:', result.resources);
      console.log('Performance suggestions count:', result.suggestions?.length || 0);
      console.log('Accessibility issues count:', result.accessibilityIssues?.length || 0);
      console.log('Best practices issues count:', result.bestPracticesIssues?.length || 0);
      console.log('SEO issues count:', result.seoIssues?.length || 0);
      console.log('Screenshots count:', result.screenshots?.length || 0);
      
      return result;
    } catch (error) {
      console.error('Lighthouse analysis error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('ENOENT')) {
        errorMessage = 'Lighthouse CLI not found. Please ensure lighthouse is installed.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Analysis timed out. The website may be too slow or unresponsive.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to the website. Please check the URL and try again.';
      }
      
      return {
        url: url,
        error: true,
        message: `Failed to analyze website: ${errorMessage}`
      };
    }
  }
  
  // Real PageSpeed Insights API implementation
  async runPageSpeedAnalysis(url: string, apiKey?: string) {
    try {
      console.log(`Starting PageSpeed Insights analysis for: ${url}`);
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Use provided API key or default
      const psiApiKey = apiKey || DEFAULT_PSI_API_KEY;
      
      if (!psiApiKey || psiApiKey === 'AIzaSyD16688gvT2z1PLldcS4LVKu2Bhfa234kE') {
        console.warn('Using default PSI API key. Consider setting PSI_API_KEY environment variable.');
      }
      
      // Log API key info (masked for security)
      const maskedKey = psiApiKey.substring(0, 10) + '...' + psiApiKey.substring(psiApiKey.length - 4);
      console.log(`Using PSI API key: ${maskedKey}`);
      
      // Create API URL with API key - no category restriction to get ALL data
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${psiApiKey}&strategy=mobile`;
      
      console.log(`Making PSI API request to: ${apiUrl.replace(psiApiKey, '***')}`);
      
      // Make the API request
      const response = await this.makeHttpRequest(apiUrl);
      console.log('PSI API raw response length:', response.length);
      
      const reportData = JSON.parse(response);
      console.log('PSI API parsed response keys:', Object.keys(reportData));
      
      // Check if the analysis failed
      if (reportData.error) {
        console.error('PageSpeed Insights API error:', reportData.error);
        
        // Handle specific error cases
        let errorMessage = reportData.error.message || 'API request failed';
        
        if (reportData.error.code === 403) {
          errorMessage = 'API key is invalid or has exceeded quota. Please check your API key.';
        } else if (reportData.error.code === 429) {
          errorMessage = 'API rate limit exceeded. Please try again later.';
        } else if (reportData.error.code === 400) {
          errorMessage = 'Invalid request. Please check the URL format.';
        }
        
        return {
          url: url,
          error: true,
          message: errorMessage
        };
      }
      
      // Validate that we have the expected data structure
      if (!reportData.lighthouseResult || !reportData.lighthouseResult.categories) {
        console.error('PageSpeed Insights API returned unexpected data structure:', reportData);
        return {
          url: url,
          error: true,
          message: 'API returned unexpected data structure'
        };
      }
      
      console.log('PSI lighthouseResult keys:', Object.keys(reportData.lighthouseResult));
      console.log('PSI categories keys:', Object.keys(reportData.lighthouseResult.categories));
      console.log('PSI categories data:', JSON.stringify(reportData.lighthouseResult.categories, null, 2));
      
      // Log all category scores
      if (reportData.lighthouseResult.categories) {
        console.log('PSI Performance score:', reportData.lighthouseResult.categories.performance?.score);
        console.log('PSI Accessibility score:', reportData.lighthouseResult.categories.accessibility?.score);
        console.log('PSI Best Practices score:', reportData.lighthouseResult.categories['best-practices']?.score);
        console.log('PSI SEO score:', reportData.lighthouseResult.categories.seo?.score);
        console.log('PSI PWA score:', reportData.lighthouseResult.categories.pwa?.score);
        
        // Check if categories exist but scores are null
        console.log('PSI Performance category exists:', !!reportData.lighthouseResult.categories.performance);
        console.log('PSI Accessibility category exists:', !!reportData.lighthouseResult.categories.accessibility);
        console.log('PSI Best Practices category exists:', !!reportData.lighthouseResult.categories['best-practices']);
        console.log('PSI SEO category exists:', !!reportData.lighthouseResult.categories.seo);
        console.log('PSI PWA category exists:', !!reportData.lighthouseResult.categories.pwa);
        
        // Check if we're missing categories
        const missingCategories: string[] = [];
        if (!reportData.lighthouseResult.categories.accessibility) missingCategories.push('accessibility');
        if (!reportData.lighthouseResult.categories['best-practices']) missingCategories.push('best-practices');
        if (!reportData.lighthouseResult.categories.seo) missingCategories.push('seo');
        if (!reportData.lighthouseResult.categories.pwa) missingCategories.push('pwa');
        
        if (missingCategories.length > 0) {
          console.warn(`PSI API missing categories: ${missingCategories.join(', ')}`);
          console.warn('This might be due to PSI API limitations or the website not having enough data for these categories');
        }
      }
      
      console.log(`PageSpeed Insights analysis completed successfully for: ${url}`);
      
      // Extract ALL category scores and comprehensive data
      const result = {
        url: url,
        // Overall score (performance)
        score: reportData.lighthouseResult.categories.performance?.score ? 
               Math.round(reportData.lighthouseResult.categories.performance.score * 100) : 0,
        
        // Only include categories that actually exist and have scores
        categories: (() => {
          const categories: any = {
            performance: reportData.lighthouseResult.categories.performance?.score ? 
                        Math.round(reportData.lighthouseResult.categories.performance.score * 100) : 0
          };
          
          // Add other categories only if they exist and have scores
          if (reportData.lighthouseResult.categories.accessibility?.score) {
            categories.accessibility = Math.round(reportData.lighthouseResult.categories.accessibility.score * 100);
          }
          
          if (reportData.lighthouseResult.categories['best-practices']?.score) {
            categories['best-practices'] = Math.round(reportData.lighthouseResult.categories['best-practices'].score * 100);
          }
          
          if (reportData.lighthouseResult.categories.seo?.score) {
            categories.seo = Math.round(reportData.lighthouseResult.categories.seo.score * 100);
          }
          
          if (reportData.lighthouseResult.categories.pwa?.score) {
            categories.pwa = Math.round(reportData.lighthouseResult.categories.pwa.score * 100);
          }
          
          return categories;
        })(),
        
        // Performance metrics
        firstContentfulPaint: reportData.lighthouseResult.audits?.['first-contentful-paint']?.displayValue || 'N/A',
        speedIndex: reportData.lighthouseResult.audits?.['speed-index']?.displayValue || 'N/A',
        largestContentfulPaint: reportData.lighthouseResult.audits?.['largest-contentful-paint']?.displayValue || 'N/A',
        timeToInteractive: reportData.lighthouseResult.audits?.['interactive']?.displayValue || 'N/A',
        totalBlockingTime: reportData.lighthouseResult.audits?.['total-blocking-time']?.displayValue || 'N/A',
        cumulativeLayoutShift: reportData.lighthouseResult.audits?.['cumulative-layout-shift']?.displayValue || 'N/A',
        
        // Additional metrics
        maxPotentialFID: reportData.lighthouseResult.audits?.['max-potential-fid']?.displayValue || 'N/A',
        serverResponseTime: reportData.lighthouseResult.audits?.['server-response-time']?.displayValue || 'N/A',
        renderBlockingResources: reportData.lighthouseResult.audits?.['render-blocking-resources']?.displayValue || 'N/A',
        
        // Resource analysis
        resources: this.extractResourceAnalysisFromPSI(reportData.lighthouseResult.audits),
        
        // Performance suggestions
        suggestions: this.extractPerformanceSuggestionsFromPSI(reportData),
        
        // Note: PSI typically only provides performance data, so we skip extracting
        // accessibility, best practices, and SEO issues as they're usually not available
      };
      
      return result;
    } catch (error) {
      console.error('PageSpeed Insights analysis error:', error);
      return {
        url: url,
        error: true,
        message: `Failed to analyze website: ${error.message}`
      };
    }
  }
  
  // Helper method to make HTTP requests with better error handling
  private makeHttpRequest(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 30 seconds'));
      }, 30000);
      
      https.get(url, (res) => {
        clearTimeout(timeout);
        
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
  
  // Extract performance suggestions from Lighthouse report
  private extractPerformanceSuggestions(reportData: any): any[] {
    const suggestions: any[] = [];
    
    try {
      const audits = reportData.audits;
      
      // Look for opportunities (performance suggestions)
      const opportunityAudits = [
        'unused-css-rules',
        'unused-javascript',
        'modern-image-formats',
        'offscreen-images',
        'render-blocking-resources',
        'unminified-css',
        'unminified-javascript',
        'efficient-animated-content',
        'duplicate-id-used',
        'total-byte-weight',
        'uses-optimized-images',
        'uses-text-compression',
        'uses-responsive-images',
        'efficient-animated-content',
        'preload-lcp-image'
      ];
      
      for (const auditKey of opportunityAudits) {
        const audit = audits[auditKey];
        if (audit && audit.score !== null && audit.score < 1) {
          suggestions.push({
            title: audit.title,
            description: audit.description,
            score: Math.round(audit.score * 100),
            savings: audit.displayValue || 'Improvement available',
            details: audit.details
          });
        }
      }
      
      // Also check diagnostics that might be relevant
      const diagnosticAudits = [
        'dom-size',
        'critical-request-chains',
        'server-response-time',
        'redirects',
        'uses-long-cache-ttl',
        'uses-http2',
        'uses-passive-event-listeners'
      ];
      
      for (const auditKey of diagnosticAudits) {
        const audit = audits[auditKey];
        if (audit && audit.score !== null && audit.score < 0.9) {
          suggestions.push({
            title: audit.title,
            description: audit.description,
            score: Math.round(audit.score * 100),
            savings: audit.displayValue || 'Improvement recommended',
            details: audit.details
          });
        }
      }
    } catch (err) {
      console.error('Error extracting performance suggestions:', err);
    }
    
    return suggestions.slice(0, 10); // Return top 10 suggestions
  }
  
  // Extract performance suggestions from PageSpeed Insights
  private extractPerformanceSuggestionsFromPSI(reportData: any): any[] {
    const suggestions: any[] = [];
    
    try {
      const audits = reportData.lighthouseResult.audits;
      
      for (const key in audits) {
        const audit = audits[key];
        if (audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1) {
          suggestions.push({
            title: audit.title,
            description: audit.description,
            score: Math.round(audit.score * 100),
            savings: audit.displayValue || 'Improvement available'
          });
        }
      }
    } catch (err) {
      console.error('Error extracting performance suggestions from PSI:', err);
    }
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Extract accessibility issues from Lighthouse report
  private extractAccessibilityIssues(reportData: any): any[] {
    const issues: any[] = [];
    
    try {
      const audits = reportData.audits;
      
      // Look for accessibility audits that failed
      for (const key in audits) {
        const audit = audits[key];
        if (audit && audit.score !== null && audit.score < 1 && 
            (key.startsWith('accessibility') || key.includes('aria') || key.includes('alt') || 
             key.includes('button') || key.includes('link') || key.includes('form') ||
             key.includes('table') || key.includes('heading') || key.includes('color'))) {
          issues.push({
            title: audit.title,
            description: audit.description,
            score: Math.round(audit.score * 100),
            category: 'Accessibility',
            details: audit.details
          });
        }
      }
    } catch (err) {
      console.error('Error extracting accessibility issues:', err);
    }
    
    return issues.slice(0, 10); // Return top 10 issues
  }

  // Extract best practices issues from Lighthouse report
  private extractBestPracticesIssues(reportData: any): any[] {
    const issues: any[] = [];
    
    try {
      const audits = reportData.audits;
      
      // Look for best practices audits that failed
      for (const key in audits) {
        const audit = audits[key];
        if (audit && audit.score !== null && audit.score < 1 && 
            (key.includes('https') || key.includes('security') || key.includes('deprecated') ||
             key.includes('document-write') || key.includes('notification') || key.includes('geolocation') ||
             key.includes('passive-listeners') || key.includes('no-vulnerable-libraries'))) {
          issues.push({
            title: audit.title,
            description: audit.description,
            score: Math.round(audit.score * 100),
            category: 'Best Practices',
            details: audit.details
          });
        }
      }
    } catch (err) {
      console.error('Error extracting best practices issues:', err);
    }
    
    return issues.slice(0, 10); // Return top 10 issues
  }

  // Extract SEO issues from Lighthouse report
  private extractSEOIssues(reportData: any): any[] {
    const issues: any[] = [];
    
    try {
      const audits = reportData.audits;
      
      // Look for SEO audits that failed
      for (const key in audits) {
        const audit = audits[key];
        if (audit && audit.score !== null && audit.score < 1 && 
            (key.includes('meta') || key.includes('headings') || key.includes('robots') ||
             key.includes('canonical') || key.includes('hreflang') || key.includes('structured-data') ||
             key.includes('viewport') || key.includes('charset') || key.includes('doctype'))) {
          issues.push({
            title: audit.title,
            description: audit.description,
            score: Math.round(audit.score * 100),
            category: 'SEO',
            details: audit.details
          });
        }
      }
    } catch (err) {
      console.error('Error extracting SEO issues:', err);
    }
    
    return issues.slice(0, 10); // Return top 10 issues
  }

  // Helper to extract category scores from Lighthouse report
  private extractCategoryScores(categories: any): any {
    const extractedCategories: any = {};
    
    if (categories) {
      console.log('Raw categories data:', categories);
      
      // Performance
      if (categories.performance && categories.performance.score !== null) {
        extractedCategories.performance = Math.round(categories.performance.score * 100);
        console.log('Performance score extracted:', extractedCategories.performance);
      } else {
        console.log('Performance category missing or has null score');
      }
      
      // Accessibility
      if (categories.accessibility && categories.accessibility.score !== null) {
        extractedCategories.accessibility = Math.round(categories.accessibility.score * 100);
        console.log('Accessibility score extracted:', extractedCategories.accessibility);
      } else {
        console.log('Accessibility category missing or has null score');
      }
      
      // Best Practices
      if (categories['best-practices'] && categories['best-practices'].score !== null) {
        extractedCategories['best-practices'] = Math.round(categories['best-practices'].score * 100);
        console.log('Best Practices score extracted:', extractedCategories['best-practices']);
      } else {
        console.log('Best Practices category missing or has null score');
      }
      
      // SEO
      if (categories.seo && categories.seo.score !== null) {
        extractedCategories.seo = Math.round(categories.seo.score * 100);
        console.log('SEO score extracted:', extractedCategories.seo);
      } else {
        console.log('SEO category missing or has null score');
      }
      
      // PWA
      if (categories.pwa && categories.pwa.score !== null) {
        extractedCategories.pwa = Math.round(categories.pwa.score * 100);
        console.log('PWA score extracted:', extractedCategories.pwa);
      } else {
        console.log('PWA category missing or has null score');
      }
    } else {
      console.log('No categories data found in report');
    }
    
    console.log('Final extracted categories:', extractedCategories);
    return extractedCategories;
  }

  // Helper to extract resource analysis from Lighthouse report
  private extractResourceAnalysis(audits: any): any {
    const resources: any = {};
    if (audits) {
      resources.totalRequests = audits['network-requests']?.details?.items?.length || 0;
      resources.totalSize = audits['total-byte-weight']?.displayValue || 'N/A';
      resources.imageCount = audits['image-elements']?.details?.items?.length || 0;
      resources.scriptCount = audits['scripts']?.details?.items?.length || 0;
      resources.stylesheetCount = audits['stylesheets']?.details?.items?.length || 0;
      resources.fontCount = audits['font-display']?.details?.items?.length || 0;
    }
    return resources;
  }

  // Helper to extract enhanced performance metrics from Lighthouse report
  private extractEnhancedPerformanceMetrics(audits: any): any {
    const enhancedMetrics: any = {};
    if (audits) {
      enhancedMetrics.maxPotentialFID = audits['max-potential-fid']?.displayValue || 'N/A';
      enhancedMetrics.serverResponseTime = audits['server-response-time']?.displayValue || 'N/A';
      enhancedMetrics.renderBlockingResources = audits['render-blocking-resources']?.displayValue || 'N/A';
      enhancedMetrics.unusedCSS = audits['unused-css-rules']?.displayValue || 'N/A';
      enhancedMetrics.unusedJavaScript = audits['unused-javascript']?.displayValue || 'N/A';
      enhancedMetrics.modernImageFormats = audits['modern-image-formats']?.displayValue || 'N/A';
      enhancedMetrics.imageOptimization = audits['efficient-animated-content']?.displayValue || 'N/A';
    }
    return enhancedMetrics;
  }

  // Helper to extract resource analysis from PageSpeed Insights
  private extractResourceAnalysisFromPSI(audits: any): any {
    const resources: any = {};
    if (audits) {
      resources.totalRequests = audits['network-requests']?.details?.items?.length || 0;
      resources.totalSize = audits['total-byte-weight']?.displayValue || 'N/A';
      resources.imageCount = audits['image-elements']?.details?.items?.length || 0;
      resources.scriptCount = audits['scripts']?.details?.items?.length || 0;
      resources.stylesheetCount = audits['stylesheets']?.details?.items?.length || 0;
      resources.fontCount = audits['font-display']?.details?.items?.length || 0;
    }
    return resources;
  }
  
  // Extract screenshots from Lighthouse report
  private extractScreenshots(reportData: any): any[] {
    const screenshots: any[] = [];
    
    try {
      console.log('Starting screenshot extraction...');
      console.log('Report data keys:', Object.keys(reportData));
      
      // Check if screenshots exist in the report
      if (reportData.screenshots && reportData.screenshots.length > 0) {
        console.log('Found screenshots in Lighthouse report:', reportData.screenshots.length);
        
        // Process each screenshot with better timing
        reportData.screenshots.forEach((screenshot: any, index: number) => {
          if (screenshot.data) {
            // Ensure proper base64 encoding
            let base64Data = screenshot.data;
            if (typeof base64Data === 'string') {
              // Remove any data URL prefix if present
              if (base64Data.startsWith('data:image/')) {
                base64Data = base64Data.split(',')[1];
              }
              // Ensure it's valid base64
              if (base64Data && base64Data.length > 0) {
                const timestamp = screenshot.timestamp || index * 1000;
                const seconds = (timestamp / 1000).toFixed(1);
                
                screenshots.push({
                  id: index,
                  timestamp: timestamp,
                  data: base64Data,
                  width: screenshot.width || 1200,
                  height: screenshot.height || 800,
                  description: `Loading at ${seconds}s`,
                  phase: this.getLoadingPhase(timestamp, index)
                });
                console.log(`Added screenshot ${index}: ${base64Data.length} chars at ${seconds}s`);
              } else {
                console.warn(`Screenshot ${index} has empty base64 data`);
              }
            } else {
              console.warn(`Screenshot ${index} data is not a string:`, typeof screenshot.data);
            }
          }
        });
      } else {
        console.log('No screenshots found in reportData.screenshots');
      }
      
      // Also check for filmstrip data (alternative screenshot format) - this is often better for loading sequence
      if (reportData.filmstrip && reportData.filmstrip.length > 0) {
        console.log('Found filmstrip in Lighthouse report:', reportData.filmstrip.length);
        
        reportData.filmstrip.forEach((frame: any, index: number) => {
          if (frame.screenshot && frame.screenshot.data) {
            let base64Data = frame.screenshot.data;
            if (typeof base64Data === 'string') {
              // Remove any data URL prefix if present
              if (base64Data.startsWith('data:image/')) {
                base64Data = base64Data.split(',')[1];
              }
              if (base64Data && base64Data.length > 0) {
                const timestamp = frame.timestamp || index * 1000;
                const seconds = (timestamp / 1000).toFixed(1);
                
                screenshots.push({
                  id: `filmstrip-${index}`,
                  timestamp: timestamp,
                  data: base64Data,
                  width: frame.screenshot.width || 1200,
                  height: frame.screenshot.height || 800,
                  description: `Filmstrip at ${seconds}s`,
                  phase: this.getLoadingPhase(timestamp, index)
                });
                console.log(`Added filmstrip frame ${index}: ${base64Data.length} chars at ${seconds}s`);
              }
            }
          }
        });
      } else {
        console.log('No filmstrip found in reportData.filmstrip');
      }
      
      // Check for final screenshot in audits
      if (reportData.audits && reportData.audits['final-screenshot']) {
        console.log('Found final screenshot in audits');
        const finalScreenshot = reportData.audits['final-screenshot'];
        if (finalScreenshot.details && finalScreenshot.details.data) {
          let base64Data = finalScreenshot.details.data;
          if (typeof base64Data === 'string') {
            // Remove any data URL prefix if present
            if (base64Data.startsWith('data:image/')) {
              base64Data = base64Data.split(',')[1];
            }
            if (base64Data && base64Data.length > 0) {
              const timestamp = Date.now();
              const seconds = (timestamp / 1000).toFixed(1);
              
              screenshots.push({
                id: 'final',
                timestamp: timestamp,
                data: base64Data,
                width: finalScreenshot.details.width || 1200,
                height: finalScreenshot.details.height || 800,
                description: 'Final loaded page',
                phase: 'complete'
              });
              console.log(`Added final screenshot: ${base64Data.length} chars at ${seconds}s`);
            }
          }
        }
      }
      
      // Sort screenshots by timestamp
      screenshots.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove duplicates (same timestamp) and keep the best quality
      const uniqueScreenshots = this.removeDuplicateScreenshots(screenshots);
      
      // If we only have one screenshot, create a timeline representation
      if (uniqueScreenshots.length === 1) {
        console.log('Only one screenshot found, enhancing with timeline information');
        const singleScreenshot = uniqueScreenshots[0];
        
        // Get performance metrics for timeline context
        const performanceMetrics = this.getPerformanceMetricsForTimeline(reportData);
        
        // Update the single screenshot with enhanced description
        singleScreenshot.description = this.getEnhancedDescription(singleScreenshot, performanceMetrics);
        singleScreenshot.phase = this.determinePhaseFromMetrics(performanceMetrics);
        singleScreenshot.timelineContext = performanceMetrics;
        
        console.log('Enhanced single screenshot with timeline context:', {
          description: singleScreenshot.description,
          phase: singleScreenshot.phase,
          metrics: performanceMetrics
        });
      }
      
      console.log('Extracted screenshots:', uniqueScreenshots.length);
      if (uniqueScreenshots.length > 0) {
        console.log('Screenshot sequence:');
        uniqueScreenshots.forEach((screenshot, index) => {
          const seconds = (screenshot.timestamp / 1000).toFixed(1);
          console.log(`  ${index + 1}. ${screenshot.description} (${seconds}s) - ${screenshot.phase}`);
        });
      }
      
      return uniqueScreenshots;
      
    } catch (error) {
      console.error('Error extracting screenshots:', error);
      return [];
    }
  }
  
  // Helper to determine loading phase based on timestamp
  private getLoadingPhase(timestamp: number, index: number): string {
    if (timestamp < 1000) return 'initial';
    if (timestamp < 3000) return 'early';
    if (timestamp < 8000) return 'loading';
    if (timestamp < 15000) return 'late';
    return 'complete';
  }
  
  // Helper to remove duplicate screenshots (same timestamp)
  private removeDuplicateScreenshots(screenshots: any[]): any[] {
    const seen = new Set();
    return screenshots.filter(screenshot => {
      const key = Math.round(screenshot.timestamp / 100); // Round to nearest 100ms
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  // Helper to get performance metrics for timeline context
  private getPerformanceMetricsForTimeline(reportData: any): any {
    const audits = reportData.audits || {};
    return {
      firstContentfulPaint: audits['first-contentful-paint']?.numericValue || null,
      largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || null,
      speedIndex: audits['speed-index']?.numericValue || null,
      timeToInteractive: audits['interactive']?.numericValue || null,
      firstMeaningfulPaint: audits['first-meaningful-paint']?.numericValue || null,
      domContentLoaded: audits['mainthread-work-breakdown']?.details?.items?.[0]?.duration || null
    };
  }
  
  // Helper to create enhanced description based on metrics
  private getEnhancedDescription(screenshot: any, metrics: any): string {
    if (metrics.firstContentfulPaint && screenshot.timestamp >= metrics.firstContentfulPaint) {
      if (metrics.largestContentfulPaint && screenshot.timestamp >= metrics.largestContentfulPaint) {
        return 'Fully loaded page (post-LCP)';
      } else if (metrics.speedIndex && screenshot.timestamp >= metrics.speedIndex) {
        return 'Page mostly loaded (post-Speed Index)';
      } else {
        return 'Content visible (post-FCP)';
      }
    } else {
      return 'Initial page load state';
    }
  }
  
  // Helper to determine phase from performance metrics
  private determinePhaseFromMetrics(metrics: any): string {
    if (metrics.timeToInteractive && metrics.largestContentfulPaint) {
      return 'complete';
    } else if (metrics.largestContentfulPaint) {
      return 'late';
    } else if (metrics.firstContentfulPaint) {
      return 'loading';
    } else {
      return 'initial';
    }
  }

  // Wappalyzer Tech Stack Analysis
  async analyzeTechStack(url: string) {
    try {
      console.log(`Starting Wappalyzer tech stack analysis for: ${url}`);
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Import Wappalyzer dynamically
      const Wappalyzer = require('wappalyzer');
      const wappalyzer = new Wappalyzer();

      // Initialize Wappalyzer
      await wappalyzer.init();

      // Analyze the website using the correct API
      const page = await wappalyzer.open(url);
      const results = await page.analyze();
      
      console.log('Wappalyzer raw results:', results);
      
      // Categorize the detected technologies
      const categorizedResults = this.categorizeTechnologies(results);
      
      console.log('Categorized tech stack results:', categorizedResults);
      
      // Clean up
      await wappalyzer.destroy();
      
      return {
        url: url,
        success: true,
        timestamp: new Date().toISOString(),
        ...categorizedResults
      };
      
    } catch (error) {
      console.error('Wappalyzer analysis error:', error);
      return {
        url: url,
        success: false,
        error: true,
        message: `Failed to analyze tech stack: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Categorize detected technologies into structured groups
  private categorizeTechnologies(results: any) {
    const categories = {
      techStack: {
        frontend: [],
        backend: [],
        databases: [],
        programmingLanguages: [],
        frameworks: [],
        libraries: []
      },
      cms: [],
      ecommerce: [],
      analytics: [],
      devops: {
        webServers: [],
        cdn: [],
        hosting: [],
        cloudServices: []
      },
      security: [],
      competitor: {
        paymentProcessors: [],
        advertisingNetworks: [],
        abTesting: []
      }
    };

    if (!results || !results.technologies) {
      return categories;
    }

    // Process each detected technology
    results.technologies.forEach((tech: any) => {
      const techInfo = {
        name: tech.name,
        version: tech.version || 'Unknown',
        confidence: tech.confidence || 0,
        category: tech.category || 'Unknown',
        description: tech.description || ''
      };

      // Categorize based on technology name and category
      this.categorizeTechnology(techInfo, categories);
    });

    return categories;
  }

  // Helper method to categorize individual technologies
  private categorizeTechnology(tech: any, categories: any) {
    const name = tech.name.toLowerCase();
    const category = tech.category.toLowerCase();

    // Frontend Technologies
    if (this.isFrontendTech(name, category)) {
      categories.techStack.frontend.push(tech);
    }
    // Backend Technologies
    else if (this.isBackendTech(name, category)) {
      categories.techStack.backend.push(tech);
    }
    // Databases
    else if (this.isDatabase(name, category)) {
      categories.techStack.databases.push(tech);
    }
    // Programming Languages
    else if (this.isProgrammingLanguage(name, category)) {
      categories.techStack.programmingLanguages.push(tech);
    }
    // Frameworks
    else if (this.isFramework(name, category)) {
      categories.techStack.frameworks.push(tech);
    }
    // Libraries
    else if (this.isLibrary(name, category)) {
      categories.techStack.libraries.push(tech);
    }
    // CMS
    else if (this.isCMS(name, category)) {
      categories.cms.push(tech);
    }
    // E-commerce
    else if (this.isEcommerce(name, category)) {
      categories.ecommerce.push(tech);
    }
    // Analytics
    else if (this.isAnalytics(name, category)) {
      categories.analytics.push(tech);
    }
    // DevOps - Web Servers
    else if (this.isWebServer(name, category)) {
      categories.devops.webServers.push(tech);
    }
    // DevOps - CDN
    else if (this.isCDN(name, category)) {
      categories.devops.cdn.push(tech);
    }
    // DevOps - Hosting
    else if (this.isHosting(name, category)) {
      categories.devops.hosting.push(tech);
    }
    // DevOps - Cloud Services
    else if (this.isCloudService(name, category)) {
      categories.devops.cloudServices.push(tech);
    }
    // Security
    else if (this.isSecurity(name, category)) {
      categories.security.push(tech);
    }
    // Competitor - Payment Processors
    else if (this.isPaymentProcessor(name, category)) {
      categories.competitor.paymentProcessors.push(tech);
    }
    // Competitor - Advertising Networks
    else if (this.isAdvertisingNetwork(name, category)) {
      categories.competitor.advertisingNetworks.push(tech);
    }
    // Competitor - A/B Testing
    else if (this.isABTesting(name, category)) {
      categories.competitor.abTesting.push(tech);
    }
  }

  // Technology categorization helper methods
  private isFrontendTech(name: string, category: string): boolean {
    const frontendKeywords = [
      'react', 'vue', 'angular', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less',
      'webpack', 'vite', 'parcel', 'gulp', 'grunt', 'typescript', 'javascript',
      'html5', 'css3', 'pwa', 'service worker', 'web components'
    ];
    return frontendKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isBackendTech(name: string, category: string): boolean {
    const backendKeywords = [
      'node.js', 'express', 'django', 'flask', 'laravel', 'spring', 'asp.net',
      'php', 'python', 'java', 'c#', 'ruby', 'rails', 'fastapi', 'koa',
      'hapi', 'sails', 'meteor', 'strapi', 'ghost'
    ];
    return backendKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isDatabase(name: string, category: string): boolean {
    const databaseKeywords = [
      'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'mariadb',
      'oracle', 'sql server', 'dynamodb', 'firebase', 'supabase'
    ];
    return databaseKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isProgrammingLanguage(name: string, category: string): boolean {
    const languageKeywords = [
      'javascript', 'typescript', 'python', 'php', 'java', 'c#', 'ruby',
      'go', 'rust', 'swift', 'kotlin', 'scala', 'elixir', 'clojure'
    ];
    return languageKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isFramework(name: string, category: string): boolean {
    const frameworkKeywords = [
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
      'django', 'flask', 'express', 'laravel', 'spring', 'asp.net',
      'rails', 'fastapi', 'koa', 'hapi', 'sails'
    ];
    return frameworkKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isLibrary(name: string, category: string): boolean {
    const libraryKeywords = [
      'jquery', 'lodash', 'moment', 'axios', 'fetch', 'socket.io',
      'three.js', 'd3', 'chart.js', 'fabric', 'konva'
    ];
    return libraryKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isCMS(name: string, category: string): boolean {
    const cmsKeywords = [
      'wordpress', 'drupal', 'joomla', 'magento', 'shopify', 'squarespace',
      'wix', 'webflow', 'ghost', 'strapi', 'contentful', 'sanity'
    ];
    return cmsKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isEcommerce(name: string, category: string): boolean {
    const ecommerceKeywords = [
      'shopify', 'woocommerce', 'magento', 'prestashop', 'opencart',
      'bigcommerce', 'squarespace', 'wix', 'webflow', 'stripe',
      'paypal', 'razorpay', 'razorpay', 'square'
    ];
    return ecommerceKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isAnalytics(name: string, category: string): boolean {
    const analyticsKeywords = [
      'google analytics', 'gtag', 'ga', 'hotjar', 'segment', 'mixpanel',
      'amplitude', 'heap', 'kissmetrics', 'crazy egg', 'optimizely',
      'google tag manager', 'facebook pixel', 'twitter pixel'
    ];
    return analyticsKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isWebServer(name: string, category: string): boolean {
    const serverKeywords = [
      'apache', 'nginx', 'iis', 'lighttpd', 'caddy', 'traefik'
    ];
    return serverKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isCDN(name: string, category: string): boolean {
    const cdnKeywords = [
      'cloudflare', 'akamai', 'fastly', 'aws cloudfront', 'azure cdn',
      'google cloud cdn', 'bunny cdn', 'keycdn', 'stackpath'
    ];
    return cdnKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isHosting(name: string, category: string): boolean {
    const hostingKeywords = [
      'aws', 'amazon web services', 'azure', 'google cloud', 'heroku',
      'digitalocean', 'linode', 'vultr', 'netlify', 'vercel', 'firebase',
      'surge', 'github pages', 'gitlab pages'
    ];
    return hostingKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isCloudService(name: string, category: string): boolean {
    const cloudKeywords = [
      'aws', 'azure', 'google cloud', 'firebase', 'supabase', 'heroku',
      'vercel', 'netlify', 'digitalocean', 'linode', 'vultr'
    ];
    return cloudKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isSecurity(name: string, category: string): boolean {
    const securityKeywords = [
      'recaptcha', 'ssl', 'tls', 'csp', 'hsts', 'xss protection',
      'csrf', 'security headers', 'cloudflare security', 'sucuri',
      'incapsula', 'akamai security'
    ];
    return securityKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isPaymentProcessor(name: string, category: string): boolean {
    const paymentKeywords = [
      'stripe', 'paypal', 'razorpay', 'square', 'adyen', 'braintree',
      'worldpay', 'sage', 'quickbooks', 'xero', 'freshbooks'
    ];
    return paymentKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isAdvertisingNetwork(name: string, category: string): boolean {
    const adKeywords = [
      'google ads', 'facebook ads', 'twitter ads', 'linkedin ads',
      'amazon ads', 'bing ads', 'taboola', 'outbrain', 'adroll',
      'google adwords', 'google adsense', 'doubleclick'
    ];
    return adKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }

  private isABTesting(name: string, category: string): boolean {
    const abTestingKeywords = [
      'optimizely', 'vwo', 'google optimize', 'ab tasty', 'convert',
      'kissmetrics', 'mixpanel', 'amplitude', 'hotjar', 'crazy egg'
    ];
    return abTestingKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
  }
}