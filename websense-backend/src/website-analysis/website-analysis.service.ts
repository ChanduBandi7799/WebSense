import { Injectable } from '@nestjs/common';  
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const execAsync = promisify(exec);
// 

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
      
      // Run Lighthouse using the CLI with better error handling and Windows-safe quoting
      const quotedUrl = `"${url}"`;
      const quotedReportPath = `"${reportPath.replace(/"/g, '\\"')}"`;
      let command = `npx lighthouse ${quotedUrl} --output=json --output-path=${quotedReportPath} --chrome-flags=\"--headless --no-sandbox --disable-gpu --disable-dev-shm-usage\" --timeout=60000 --preset=desktop --only-categories=performance,accessibility,best-practices,seo,pwa --max-wait-for-load=30000 --throttling-method=devtools`;
      
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
          command = `npx lighthouse ${quotedUrl} --output=json --output-path=${quotedReportPath} --chrome-flags=\"--headless --no-sandbox\" --timeout=30000 --preset=desktop`;
          
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

  // Security Headers Analysis
  async analyzeSecurityHeaders(url: string) {
    try {
      console.log(`Starting security headers analysis for: ${url}`);
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Make HTTP request to get headers
      const headers = await this.getSecurityHeaders(url);
      
      console.log('Security headers analysis completed');
      
      return {
        url: url,
        success: true,
        timestamp: new Date().toISOString(),
        ...headers as any
      };
      
    } catch (error) {
      console.error('Security headers analysis error:', error);
      return {
        url: url,
        success: false,
        error: true,
        message: `Failed to analyze security headers: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get security headers from website
  private async getSecurityHeaders(url: string) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const http = require('http');
      
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 10 seconds'));
      }, 10000);

      const req = client.get(url, (res) => {
        clearTimeout(timeout);
        
        const headers = res.headers;
        const securityAnalysis = this.analyzeSecurityHeadersData(headers, isHttps);
        
        resolve(securityAnalysis);
      });
      
      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  // Analyze security headers data
  private analyzeSecurityHeadersData(headers: any, isHttps: boolean) {
    const analysis = {
      https: {
        enabled: isHttps,
        status: isHttps ? 'Secure' : 'Insecure',
        description: isHttps ? 'Website uses HTTPS encryption' : 'Website uses unencrypted HTTP'
      },
      hsts: {
        present: false,
        value: null,
        status: 'Missing',
        description: 'Strict-Transport-Security header not found',
        recommendation: 'Add HSTS header to prevent downgrade attacks'
      },
      csp: {
        present: false,
        value: null,
        status: 'Missing',
        description: 'Content-Security-Policy header not found',
        recommendation: 'Add CSP header to prevent XSS attacks'
      },
      xFrameOptions: {
        present: false,
        value: null,
        status: 'Missing',
        description: 'X-Frame-Options header not found',
        recommendation: 'Add X-Frame-Options to prevent clickjacking'
      },
      xContentTypeOptions: {
        present: false,
        value: null,
        status: 'Missing',
        description: 'X-Content-Type-Options header not found',
        recommendation: 'Add X-Content-Type-Options to prevent MIME sniffing'
      },
      referrerPolicy: {
        present: false,
        value: null,
        status: 'Missing',
        description: 'Referrer-Policy header not found',
        recommendation: 'Add Referrer-Policy to protect sensitive referral data'
      },
      permissionsPolicy: {
        present: false,
        value: null,
        status: 'Missing',
        description: 'Permissions-Policy header not found',
        recommendation: 'Add Permissions-Policy to restrict feature access'
      },
      summary: {
        totalHeaders: 0,
        securityScore: 0,
        overallStatus: 'Poor',
        recommendations: [] as string[]
      }
    };

    // Check HSTS
    if (headers['strict-transport-security'] || headers['Strict-Transport-Security']) {
      analysis.hsts.present = true;
      analysis.hsts.value = headers['strict-transport-security'] || headers['Strict-Transport-Security'];
      analysis.hsts.status = 'Present';
      analysis.hsts.description = 'HSTS header is configured';
      analysis.hsts.recommendation = 'HSTS is properly configured';
    }

    // Check CSP
    if (headers['content-security-policy'] || headers['Content-Security-Policy']) {
      analysis.csp.present = true;
      analysis.csp.value = headers['content-security-policy'] || headers['Content-Security-Policy'];
      analysis.csp.status = 'Present';
      analysis.csp.description = 'CSP header is configured';
      analysis.csp.recommendation = 'CSP is properly configured';
    }

    // Check X-Frame-Options
    if (headers['x-frame-options'] || headers['X-Frame-Options']) {
      analysis.xFrameOptions.present = true;
      analysis.xFrameOptions.value = headers['x-frame-options'] || headers['X-Frame-Options'];
      analysis.xFrameOptions.status = 'Present';
      analysis.xFrameOptions.description = 'X-Frame-Options header is configured';
      analysis.xFrameOptions.recommendation = 'X-Frame-Options is properly configured';
    }

    // Check X-Content-Type-Options
    if (headers['x-content-type-options'] || headers['X-Content-Type-Options']) {
      analysis.xContentTypeOptions.present = true;
      analysis.xContentTypeOptions.value = headers['x-content-type-options'] || headers['X-Content-Type-Options'];
      analysis.xContentTypeOptions.status = 'Present';
      analysis.xContentTypeOptions.description = 'X-Content-Type-Options header is configured';
      analysis.xContentTypeOptions.recommendation = 'X-Content-Type-Options is properly configured';
    }

    // Check Referrer-Policy
    if (headers['referrer-policy'] || headers['Referrer-Policy']) {
      analysis.referrerPolicy.present = true;
      analysis.referrerPolicy.value = headers['referrer-policy'] || headers['Referrer-Policy'];
      analysis.referrerPolicy.status = 'Present';
      analysis.referrerPolicy.description = 'Referrer-Policy header is configured';
      analysis.referrerPolicy.recommendation = 'Referrer-Policy is properly configured';
    }

    // Check Permissions-Policy
    if (headers['permissions-policy'] || headers['Permissions-Policy']) {
      analysis.permissionsPolicy.present = true;
      analysis.permissionsPolicy.value = headers['permissions-policy'] || headers['Permissions-Policy'];
      analysis.permissionsPolicy.status = 'Present';
      analysis.permissionsPolicy.description = 'Permissions-Policy header is configured';
      analysis.permissionsPolicy.recommendation = 'Permissions-Policy is properly configured';
    }

    // Calculate summary
    const presentHeaders = [
      analysis.hsts.present,
      analysis.csp.present,
      analysis.xFrameOptions.present,
      analysis.xContentTypeOptions.present,
      analysis.referrerPolicy.present,
      analysis.permissionsPolicy.present
    ].filter(Boolean).length;

    analysis.summary.totalHeaders = presentHeaders;
    analysis.summary.securityScore = Math.round((presentHeaders / 6) * 100);

    // Determine overall status
    if (analysis.summary.securityScore >= 80) {
      analysis.summary.overallStatus = 'Excellent';
    } else if (analysis.summary.securityScore >= 60) {
      analysis.summary.overallStatus = 'Good';
    } else if (analysis.summary.securityScore >= 40) {
      analysis.summary.overallStatus = 'Fair';
    } else if (analysis.summary.securityScore >= 20) {
      analysis.summary.overallStatus = 'Poor';
    } else {
      analysis.summary.overallStatus = 'Very Poor';
    }

    // Generate recommendations
    analysis.summary.recommendations = [];
    if (!analysis.hsts.present) analysis.summary.recommendations.push(analysis.hsts.recommendation as string);
    if (!analysis.csp.present) analysis.summary.recommendations.push(analysis.csp.recommendation as string);
    if (!analysis.xFrameOptions.present) analysis.summary.recommendations.push(analysis.xFrameOptions.recommendation as string);
    if (!analysis.xContentTypeOptions.present) analysis.summary.recommendations.push(analysis.xContentTypeOptions.recommendation as string);
    if (!analysis.referrerPolicy.present) analysis.summary.recommendations.push(analysis.referrerPolicy.recommendation as string);
    if (!analysis.permissionsPolicy.present) analysis.summary.recommendations.push(analysis.permissionsPolicy.recommendation as string);

    return analysis;
  }

  // Google Mobile-Friendly Test Analysis (now non-API heuristic)
  async analyzeMobileFriendly(url: string) {
    try {
      console.log(`Starting Google Mobile-Friendly Test analysis for: ${url}`);
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Use non-API heuristic analysis
      const result = await this.analyzeMobileFriendlyWithoutApi(url);
      
      console.log('Mobile-Friendly Test analysis completed');
      
      return {
        url: url,
        success: true,
        timestamp: new Date().toISOString(),
        ...result
      };
      
    } catch (error) {
      console.error('Mobile-Friendly Test analysis error:', error);
      return {
        url: url,
        success: false,
        error: true,
        message: `Failed to analyze mobile-friendliness: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }



  // Non-API Mobile-Friendly heuristic analysis
  private async analyzeMobileFriendlyWithoutApi(url: string) {
    const analysis = {
      verdict: 'MOBILE_FRIENDLY',
      issues: [] as string[],
      screenshots: [] as any[],
      details: {
        viewport: false,
        textSize: false,
        clickableElements: false,
        contentWidth: false,
        plugins: false,
        responsiveDesign: false,
        loadingSpeed: false
      },
      recommendations: [] as string[]
    };
    try {
      const pageData = await this.getPageData(url) as any;
      const html = (pageData.html || '').toLowerCase();

      // Viewport
      if (!html.includes('<meta') || !html.includes('name="viewport"') || !html.includes('width=device-width')) {
        analysis.issues.push('Viewport not set');
        analysis.details.viewport = true;
      }

      // Responsive CSS hints
      const hasResponsiveCSS = html.includes('@media') || html.includes('max-width') || html.includes('min-width');
      if (!hasResponsiveCSS) {
        analysis.issues.push('No responsive design detected');
        analysis.details.responsiveDesign = true;
      }

      // Content wider than screen indicators
      if (html.includes('width=') && html.includes('px')) {
        analysis.issues.push('Content wider than screen');
        analysis.details.contentWidth = true;
      }

      // Legible font sizes (rough heuristic)
      if (html.includes('font-size:') && html.match(/font-size:\s*(1[0-5]px|[0-9]px)/)) {
        analysis.issues.push('Text too small to read');
        analysis.details.textSize = true;
      }

      // Tap targets (heuristic)
      if (html.includes('padding:') && html.match(/padding:\s*0(px)?/)) {
        analysis.issues.push('Clickable elements too close');
        analysis.details.clickableElements = true;
      }

      // Plugins
      if (html.includes('<object') || html.includes('.swf') || html.includes('flash')) {
        analysis.issues.push('Incompatible plugins detected');
        analysis.details.plugins = true;
      }

      // Verdict
      if (analysis.issues.length > 0) {
        analysis.verdict = 'NOT_MOBILE_FRIENDLY';
      }

      // Recommendations based on issues
      if (analysis.details.viewport) {
        analysis.recommendations.push('Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }
      if (analysis.details.responsiveDesign) {
        analysis.recommendations.push('Implement responsive design using CSS media queries');
      }
      if (analysis.details.contentWidth) {
        analysis.recommendations.push('Use flexible layouts with percentage-based widths');
      }
      if (analysis.details.textSize) {
        analysis.recommendations.push('Use larger font sizes (minimum 16px) for mobile readability');
      }
      if (analysis.details.clickableElements) {
        analysis.recommendations.push('Ensure clickable elements have adequate spacing (minimum 44px)');
      }
      if (analysis.details.plugins) {
        analysis.recommendations.push('Remove or replace Flash and other incompatible plugins');
      }

      return analysis;
    } catch (error) {
      console.error('Heuristic mobile-friendly analysis failed:', error);
      throw new Error('Unable to analyze page content');
    }
  }

  // Run Mobile-Friendly Test (kept for reference, unused)
  private async runMobileFriendlyTest(url: string) {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set.');
    }
    const maskedKey = GOOGLE_API_KEY.length > 8 
      ? `${GOOGLE_API_KEY.substring(0, 6)}...${GOOGLE_API_KEY.substring(GOOGLE_API_KEY.length - 4)}`
      : '******';
    console.log('Calling Mobile-Friendly Test API with key:', maskedKey);
    
    const analysis = {
      verdict: 'MOBILE_FRIENDLY',
      issues: [] as string[],
      screenshots: [] as any[],
      details: {
        viewport: false,
        textSize: false,
        clickableElements: false,
        contentWidth: false,
        plugins: false,
        responsiveDesign: false,
        loadingSpeed: false
      },
      recommendations: [] as string[]
    };

    try {
      // Use Google's Mobile-Friendly Test API
      // Documentation: https://developers.google.com/search/apis/indexing-api/v3/reference/index-api
      const apiUrl = `https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run?key=${GOOGLE_API_KEY}`;
      
      console.log(`Calling Mobile-Friendly Test API for URL: ${url}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          requestScreenshot: true
        })
      });
      
      console.log(`Mobile-Friendly Test API response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errJson = await response.json();
          errorDetail = errJson?.error?.message || JSON.stringify(errJson);
        } catch (_) {
          // ignore parse errors
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}${errorDetail ? ' - ' + errorDetail : ''}`);
      }

      const result = await response.json();
      console.log('Google Mobile-Friendly Test API response:', result);

      // Parse the API response
      if (result.mobileFriendliness === 'MOBILE_FRIENDLY') {
        analysis.verdict = 'MOBILE_FRIENDLY';
        analysis.recommendations.push('Website is mobile-friendly! Consider optimizing for even better performance');
        analysis.recommendations.push('Test on various mobile devices and screen sizes');
        analysis.recommendations.push('Monitor Core Web Vitals for mobile performance');
      } else {
        analysis.verdict = 'NOT_MOBILE_FRIENDLY';
      }

      // Parse issues from the API response
      if (result.mobileFriendlyIssues) {
        result.mobileFriendlyIssues.forEach((issue: any) => {
          const issueType = issue.rule;
          const issueDescription = this.getIssueDescription(issueType);
          
          analysis.issues.push(issueDescription);
          
          // Map issues to details
          switch (issueType) {
            case 'USES_INCOMPATIBLE_PLUGINS':
              analysis.details.plugins = true;
              analysis.recommendations.push('Remove or replace Flash and other incompatible plugins');
              break;
            case 'CONFIGURE_VIEWPORT':
              analysis.details.viewport = true;
              analysis.recommendations.push('Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">');
              break;
            case 'FIXED_WIDTH_VIEWPORT':
              analysis.details.contentWidth = true;
              analysis.recommendations.push('Use flexible layouts with percentage-based widths');
              break;
            case 'SIZE_CONTENT_TO_VIEWPORT':
              analysis.details.contentWidth = true;
              analysis.recommendations.push('Ensure content fits within the viewport width');
              break;
            case 'USE_LEGIBLE_FONT_SIZES':
              analysis.details.textSize = true;
              analysis.recommendations.push('Use larger font sizes (minimum 16px) for mobile readability');
              break;
            case 'TAP_TARGETS_TOO_CLOSE':
              analysis.details.clickableElements = true;
              analysis.recommendations.push('Ensure clickable elements have adequate spacing (minimum 44px)');
              break;
            case 'AVOID_PLUGINS':
              analysis.details.plugins = true;
              analysis.recommendations.push('Remove or replace Flash and other incompatible plugins');
              break;
            default:
              analysis.recommendations.push(`Fix ${issueType.toLowerCase().replace(/_/g, ' ')}`);
          }
        });
      }

      // Handle screenshots if available
      if (result.screenshot && result.screenshot.data) {
        analysis.screenshots.push({
          data: result.screenshot.data,
          mimeType: result.screenshot.mimeType || 'image/png',
          description: 'Mobile view as seen by Googlebot'
        });
      }

      // If no specific issues found but not mobile-friendly, add general recommendations
      if (analysis.issues.length === 0 && analysis.verdict === 'NOT_MOBILE_FRIENDLY') {
        analysis.recommendations.push('Implement responsive design using CSS media queries');
        analysis.recommendations.push('Ensure touch targets are at least 44px in size');
        analysis.recommendations.push('Use readable font sizes and adequate spacing');
      }

      return analysis;

    } catch (error) {
      console.error('Error calling Google Mobile-Friendly Test API:', error);
      throw error;
    }
  }

  
  
  // Get human-readable issue descriptions
  private getIssueDescription(issueType: string): string {
    const descriptions: { [key: string]: string } = {
      'USES_INCOMPATIBLE_PLUGINS': 'Incompatible plugins',
      'CONFIGURE_VIEWPORT': 'Viewport not set',
      'FIXED_WIDTH_VIEWPORT': 'Content wider than screen',
      'SIZE_CONTENT_TO_VIEWPORT': 'Content wider than screen',
      'USE_LEGIBLE_FONT_SIZES': 'Text too small to read',
      'TAP_TARGETS_TOO_CLOSE': 'Clickable elements too close',
      'AVOID_PLUGINS': 'Incompatible plugins detected'
    };
    
    return descriptions[issueType] || `Issue: ${issueType.toLowerCase().replace(/_/g, ' ')}`;
  }

  // Run Core Web Vitals (CrUX) Analysis
  private async runCoreWebVitalsAnalysis(origin: string) {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set.');
    }
    const maskedKey = GOOGLE_API_KEY.length > 8 ? `${GOOGLE_API_KEY.substring(0, 6)}...${GOOGLE_API_KEY.substring(GOOGLE_API_KEY.length - 4)}` : '******';
    console.log('Using API key for CrUX API:', maskedKey);
    
    const analysis = {
      recordCount: 0,
      metrics: {
        lcp: { p75: 0, good: 0, needsImprovement: 0, poor: 0 },
        fid: { p75: 0, good: 0, needsImprovement: 0, poor: 0 },
        cls: { p75: 0, good: 0, needsImprovement: 0, poor: 0 },
        ttfb: { p75: 0, good: 0, needsImprovement: 0, poor: 0 },
        inp: { p75: 0, good: 0, needsImprovement: 0, poor: 0 }
      },
      formFactors: {
        desktop: null as any,
        mobile: null as any,
        tablet: null as any
      },
      effectiveConnectionTypes: {
        '4g': null,
        '3g': null,
        '2g': null,
        slow2g: null
      },
      summary: {
        overallScore: 0,
        status: '',
        recommendations: [] as string[]
      }
    };

    try {
      // Use Google's CrUX API v1
      // Documentation: https://developers.google.com/web/tools/chrome-user-experience-report/api/reference
      const apiUrl = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${GOOGLE_API_KEY}`;

      // First try page URL (more specific). If 404, fall back to origin.
      const cruxFetch = async (body: any, label: string) => {
        console.log(`Calling CrUX API for ${label}`);
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        console.log(`CrUX API response for ${label}: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          let detail = '';
          try {
            const ej = await res.json();
            detail = ej?.error?.message || JSON.stringify(ej);
          } catch {}
          const err = new Error(`CrUX API request failed: ${res.status} ${res.statusText}${detail ? ' - ' + detail : ''}`);
          (err as any).status = res.status;
          throw err;
        }
        return res.json();
      };

      let result: any;
      try {
        result = await cruxFetch({ url: origin, formFactor: 'ALL_FORM_FACTORS' }, 'page URL');
      } catch (e: any) {
        if (e.status === 404) {
          console.log('No page-level CrUX data; retrying with origin');
          result = await cruxFetch({ origin: origin, formFactor: 'ALL_FORM_FACTORS' }, 'origin');
        } else {
          throw e;
        }
      }
      console.log('CrUX API response:', result);
      console.log('CrUX API response keys:', Object.keys(result));

      if (result.record) {
        analysis.recordCount = result.record.recordCount || 0;
        
        // Parse metrics for different form factors
        if (result.record.metrics) {
          // Desktop metrics
          if (result.record.metrics.largest_contentful_paint && result.record.metrics.largest_contentful_paint.desktop) {
            analysis.formFactors.desktop = this.parseMetrics(result.record.metrics, 'desktop');
          }
          
          // Mobile metrics
          if (result.record.metrics.largest_contentful_paint && result.record.metrics.largest_contentful_paint.mobile) {
            analysis.formFactors.mobile = this.parseMetrics(result.record.metrics, 'mobile');
          }
          
          // Tablet metrics
          if (result.record.metrics.largest_contentful_paint && result.record.metrics.largest_contentful_paint.tablet) {
            analysis.formFactors.tablet = this.parseMetrics(result.record.metrics, 'tablet');
          }
        }

        // Calculate overall scores and generate recommendations
        analysis.summary = this.calculateCoreWebVitalsSummary(analysis);
      } else {
        analysis.summary.status = 'No data available';
        analysis.summary.recommendations.push('No Core Web Vitals data available for this origin. This could mean:');
        analysis.summary.recommendations.push('- The site is new or has low traffic');
        analysis.summary.recommendations.push('- The site is not accessible to Chrome users');
        analysis.summary.recommendations.push('- Try analyzing a specific page URL instead of the origin');
      }

      return analysis;
      
    } catch (error) {
      console.error('Error calling CrUX API:', error);
      throw error;
    }
  }
  
  
  
  
  // Parse metrics for a specific form factor
  private parseMetrics(metrics: any, formFactor: string) {
    const parsed = {
      lcp: { p75: 0, good: 0, needsImprovement: 0, poor: 0, total: 0 },
      fid: { p75: 0, good: 0, needsImprovement: 0, poor: 0, total: 0 },
      cls: { p75: 0, good: 0, needsImprovement: 0, poor: 0, total: 0 },
      ttfb: { p75: 0, good: 0, needsImprovement: 0, poor: 0, total: 0 },
      inp: { p75: 0, good: 0, needsImprovement: 0, poor: 0, total: 0 }
    };

    // Largest Contentful Paint (LCP)
    if (metrics.largest_contentful_paint && metrics.largest_contentful_paint[formFactor]) {
      const lcp = metrics.largest_contentful_paint[formFactor];
      parsed.lcp.p75 = lcp.percentiles.p75 || 0;
      parsed.lcp.good = lcp.histogram[0]?.density || 0;
      parsed.lcp.needsImprovement = lcp.histogram[1]?.density || 0;
      parsed.lcp.poor = lcp.histogram[2]?.density || 0;
      parsed.lcp.total = parsed.lcp.good + parsed.lcp.needsImprovement + parsed.lcp.poor;
    }

    // First Input Delay (FID) - Note: FID is being replaced by INP
    if (metrics.first_input_delay && metrics.first_input_delay[formFactor]) {
      const fid = metrics.first_input_delay[formFactor];
      parsed.fid.p75 = fid.percentiles.p75 || 0;
      parsed.fid.good = fid.histogram[0]?.density || 0;
      parsed.fid.needsImprovement = fid.histogram[1]?.density || 0;
      parsed.fid.poor = fid.histogram[2]?.density || 0;
      parsed.fid.total = parsed.fid.good + parsed.fid.needsImprovement + parsed.fid.poor;
    }

    // Cumulative Layout Shift (CLS)
    if (metrics.cumulative_layout_shift && metrics.cumulative_layout_shift[formFactor]) {
      const cls = metrics.cumulative_layout_shift[formFactor];
      parsed.cls.p75 = cls.percentiles.p75 || 0;
      parsed.cls.good = cls.histogram[0]?.density || 0;
      parsed.cls.needsImprovement = cls.histogram[1]?.density || 0;
      parsed.cls.poor = cls.histogram[2]?.density || 0;
      parsed.cls.total = parsed.cls.good + parsed.cls.needsImprovement + parsed.cls.poor;
    }

    // Time to First Byte (TTFB)
    if (metrics.first_contentful_paint && metrics.first_contentful_paint[formFactor]) {
      const ttfb = metrics.first_contentful_paint[formFactor];
      parsed.ttfb.p75 = ttfb.percentiles.p75 || 0;
      parsed.ttfb.good = ttfb.histogram[0]?.density || 0;
      parsed.ttfb.needsImprovement = ttfb.histogram[1]?.density || 0;
      parsed.ttfb.poor = ttfb.histogram[2]?.density || 0;
      parsed.ttfb.total = parsed.ttfb.good + parsed.ttfb.needsImprovement + parsed.ttfb.poor;
    }

    // Interaction to Next Paint (INP) - New Core Web Vital
    if (metrics.interaction_to_next_paint && metrics.interaction_to_next_paint[formFactor]) {
      const inp = metrics.interaction_to_next_paint[formFactor];
      parsed.inp.p75 = inp.percentiles.p75 || 0;
      parsed.inp.good = inp.histogram[0]?.density || 0;
      parsed.inp.needsImprovement = inp.histogram[1]?.density || 0;
      parsed.inp.poor = inp.histogram[2]?.density || 0;
      parsed.inp.total = parsed.inp.good + parsed.inp.needsImprovement + parsed.inp.poor;
    }

    return parsed;
  }

  // Calculate overall Core Web Vitals summary
  private calculateCoreWebVitalsSummary(analysis: any) {
    const summary = {
      overallScore: 0,
      status: '',
      recommendations: [] as string[]
    };

    // Use mobile metrics as primary (Google's preference)
    const primaryMetrics = analysis.formFactors.mobile || analysis.formFactors.desktop;
    
    if (!primaryMetrics) {
      summary.status = 'No data available';
      return summary;
    }

    let totalScore = 0;
    let metricCount = 0;

    // Calculate LCP score
    if (primaryMetrics.lcp.total > 0) {
      const lcpScore = (primaryMetrics.lcp.good / primaryMetrics.lcp.total) * 100;
      totalScore += lcpScore;
      metricCount++;
      
      if (lcpScore < 75) {
        summary.recommendations.push(`Optimize Largest Contentful Paint (LCP): ${primaryMetrics.lcp.p75.toFixed(0)}ms (75th percentile). Target < 2.5s.`);
      }
    }

    // Calculate CLS score
    if (primaryMetrics.cls.total > 0) {
      const clsScore = (primaryMetrics.cls.good / primaryMetrics.cls.total) * 100;
      totalScore += clsScore;
      metricCount++;
      
      if (clsScore < 75) {
        summary.recommendations.push(`Improve Cumulative Layout Shift (CLS): ${primaryMetrics.cls.p75.toFixed(3)} (75th percentile). Target < 0.1.`);
      }
    }

    // Calculate INP score (or FID as fallback)
    if (primaryMetrics.inp.total > 0) {
      const inpScore = (primaryMetrics.inp.good / primaryMetrics.inp.total) * 100;
      totalScore += inpScore;
      metricCount++;
      
      if (inpScore < 75) {
        summary.recommendations.push(`Optimize Interaction to Next Paint (INP): ${primaryMetrics.inp.p75.toFixed(0)}ms (75th percentile). Target < 200ms.`);
      }
    } else if (primaryMetrics.fid.total > 0) {
      const fidScore = (primaryMetrics.fid.good / primaryMetrics.fid.total) * 100;
      totalScore += fidScore;
      metricCount++;
      
      if (fidScore < 75) {
        summary.recommendations.push(`Improve First Input Delay (FID): ${primaryMetrics.fid.p75.toFixed(0)}ms (75th percentile). Target < 100ms.`);
      }
    }

    // Calculate overall score
    if (metricCount > 0) {
      summary.overallScore = Math.round(totalScore / metricCount);
    }

    // Determine status
    if (summary.overallScore >= 90) {
      summary.status = 'Excellent';
      summary.recommendations.push('Great job! Your Core Web Vitals are performing well.');
    } else if (summary.overallScore >= 75) {
      summary.status = 'Good';
      summary.recommendations.push('Your Core Web Vitals are good, but there\'s room for improvement.');
    } else if (summary.overallScore >= 50) {
      summary.status = 'Needs Improvement';
      summary.recommendations.push('Your Core Web Vitals need attention to improve user experience.');
    } else {
      summary.status = 'Poor';
      summary.recommendations.push('Your Core Web Vitals require immediate attention.');
    }

    // Add general recommendations
    if (summary.overallScore < 90) {
      summary.recommendations.push('Consider implementing performance optimizations like:');
      summary.recommendations.push('- Image optimization and lazy loading');
      summary.recommendations.push('- Minimizing render-blocking resources');
      summary.recommendations.push('- Using a CDN for faster content delivery');
      summary.recommendations.push('- Implementing proper caching strategies');
    }

    return summary;
  }

  // Get page data for analysis
  private async getPageData(url: string) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const http = require('http');
      
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 10 seconds'));
      }, 10000);

      const req = client.get(url, (res) => {
        clearTimeout(timeout);
        
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            html: data,
            headers: res.headers,
            statusCode: res.statusCode
          });
        });
      });
      
      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async analyzePrivacyTracking(url: string) {
    try {
      console.log(`Analyzing privacy and tracking for: ${url}`);
      
      // Fetch the website HTML
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract comprehensive data
      const trackers = this.extractTrackers(html, url);
      const externalResources = this.extractExternalResources(html, url);
      const metaData = this.extractMetaData(html);
      const structuredData = this.extractStructuredData(html);
      const performanceData = this.extractPerformanceData(html);
      const securityData = this.extractSecurityData(html, url);
      
      return {
        success: true,
        url,
        trackers,
        externalResources,
        metaData,
        structuredData,
        performanceData,
        securityData,
        summary: {
          totalTrackers: trackers.length,
          analyticsCount: trackers.filter(t => t.type === 'Analytics').length,
          adsCount: trackers.filter(t => t.type === 'Ads').length,
          trackerCount: trackers.filter(t => t.type === 'Tracker').length,
          suspiciousCount: trackers.filter(t => t.riskLevel === 'High').length,
          externalResourcesCount: externalResources.length,
          metaTagsCount: metaData.length,
          structuredDataCount: structuredData.length
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Privacy tracking analysis failed:', error);
      return {
        success: false,
        message: error.message,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  private extractExternalResources(html: string, baseUrl: string): any[] {
    const resources: any[] = [];
    const baseDomain = this.extractDomain(baseUrl, baseUrl);
    
    // Extract all external resources
    const patterns = [
      { type: 'CSS', regex: /<link[^>]*href=["']([^"']+)["'][^>]*>/gi },
      { type: 'Image', regex: /<img[^>]*src=["']([^"']+)["'][^>]*>/gi },
      { type: 'Font', regex: /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:preload|stylesheet)["'][^>]*>/gi },
      { type: 'Video', regex: /<video[^>]*src=["']([^"']+)["'][^>]*>/gi },
      { type: 'Audio', regex: /<audio[^>]*src=["']([^"']+)["'][^>]*>/gi },
      { type: 'Object', regex: /<object[^>]*data=["']([^"']+)["'][^>]*>/gi },
      { type: 'Embed', regex: /<embed[^>]*src=["']([^"']+)["'][^>]*>/gi }
    ];
    
    patterns.forEach(pattern => {
      let match: RegExpExecArray | null;
      while ((match = pattern.regex.exec(html)) !== null) {
        const resourceUrl = match[1];
        const domain = this.extractDomain(resourceUrl, baseUrl);
        
        if (domain && domain !== baseDomain) {
          resources.push({
            type: pattern.type,
            url: resourceUrl,
            domain: domain,
            category: this.categorizeResource(domain, pattern.type)
          });
        }
      }
    });
    
    return resources;
  }

  private extractMetaData(html: string): any[] {
    const metaData: any[] = [];
    
    // Extract meta tags
    const metaRegex = /<meta[^>]*>/gi;
    let match: RegExpExecArray | null;
    
    while ((match = metaRegex.exec(html)) !== null) {
      const metaTag = match[0];
      const nameMatch = metaTag.match(/name=["']([^"']+)["']/i);
      const propertyMatch = metaTag.match(/property=["']([^"']+)["']/i);
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
      
      if ((nameMatch || propertyMatch) && contentMatch) {
        metaData.push({
          name: nameMatch ? nameMatch[1] : (propertyMatch ? propertyMatch[1] : ''),
          content: contentMatch[1],
          type: nameMatch ? 'name' : 'property'
        });
      }
    }
    
    return metaData;
  }

  private extractStructuredData(html: string): any[] {
    const structuredData: any[] = [];
    
    // Extract JSON-LD structured data
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        structuredData.push({
          type: 'JSON-LD',
          data: jsonData,
          '@type': jsonData['@type'] || 'Unknown'
        });
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    // Extract microdata
    const microdataRegex = /itemtype=["']([^"']+)["']/gi;
    while ((match = microdataRegex.exec(html)) !== null) {
      structuredData.push({
        type: 'Microdata',
        schema: match[1]
      });
    }
    
    return structuredData;
  }

  private extractPerformanceData(html: string): any {
    const performanceData: any = {
      images: 0,
      scripts: 0,
      stylesheets: 0,
      externalResources: 0,
      inlineScripts: 0,
      inlineStyles: 0
    };
    
    // Count various elements
    performanceData.images = (html.match(/<img[^>]*>/gi) || []).length;
    performanceData.scripts = (html.match(/<script[^>]*>/gi) || []).length;
    performanceData.stylesheets = (html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;
    performanceData.externalResources = (html.match(/https?:\/\/[^\s"'<>]+/gi) || []).length;
    performanceData.inlineScripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []).length;
    performanceData.inlineStyles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).length;
    
    return performanceData;
  }

  private extractSecurityData(html: string, url: string): any {
    const securityData: any = {
      hasHttps: url.startsWith('https://'),
      hasCSP: false,
      hasHSTS: false,
      hasXFrameOptions: false,
      hasXContentTypeOptions: false,
      hasReferrerPolicy: false,
      hasPermissionsPolicy: false
    };
    
    // Check for security-related meta tags and headers
    const cspRegex = /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi;
    const hstsRegex = /<meta[^>]*http-equiv=["']Strict-Transport-Security["'][^>]*>/gi;
    
    securityData.hasCSP = cspRegex.test(html);
    securityData.hasHSTS = hstsRegex.test(html);
    
    return securityData;
  }

  private categorizeResource(domain: string, type: string): string {
    const cdnPatterns = ['cdn', 'static', 'assets', 'media', 'img', 'images'];
    const fontPatterns = ['fonts', 'font', 'typekit', 'googleapis'];
    const videoPatterns = ['youtube', 'vimeo', 'dailymotion', 'twitch'];
    
    const domainLower = domain.toLowerCase();
    
    if (cdnPatterns.some(pattern => domainLower.includes(pattern))) return 'CDN';
    if (fontPatterns.some(pattern => domainLower.includes(pattern))) return 'Font';
    if (videoPatterns.some(pattern => domainLower.includes(pattern))) return 'Video';
    if (type === 'Image') return 'Image';
    if (type === 'CSS') return 'Stylesheet';
    
    return 'Other';
  }

  private extractTrackers(html: string, baseUrl: string): any[] {
    const trackers: any[] = [];
    const knownTrackers = this.getKnownTrackers();
    const baseDomain = this.extractDomain(baseUrl, baseUrl);
    
    console.log(`Extracting trackers from ${baseUrl} (base domain: ${baseDomain})`);
    
    // Extract script sources with more comprehensive patterns
    const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const scriptUrl = match[1];
      const domain = this.extractDomain(scriptUrl, baseUrl);
      
      if (domain && domain !== baseDomain) {
        const tracker = this.identifyTracker(domain, knownTrackers);
        if (tracker) {
          trackers.push(tracker);
        }
      }
    }
    
    // Extract script tags with data attributes (common for tracking)
    const scriptDataRegex = /<script[^>]*data-[^=]+=["']([^"']+)["'][^>]*>/gi;
    while ((match = scriptDataRegex.exec(html)) !== null) {
      const dataValue = match[1];
      if (dataValue.includes('http') || dataValue.includes('//')) {
        let url = dataValue;
        if (url.startsWith('//')) {
          url = 'https:' + url;
        }
        const domain = this.extractDomain(url, baseUrl);
        if (domain && domain !== baseDomain) {
          const tracker = this.identifyTracker(domain, knownTrackers);
          if (tracker) {
            trackers.push(tracker);
          }
        }
      }
    }
    
    // Extract iframe sources
    const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = iframeRegex.exec(html)) !== null) {
      const iframeUrl = match[1];
      const domain = this.extractDomain(iframeUrl, baseUrl);
      
      if (domain && domain !== baseDomain) {
        const tracker = this.identifyTracker(domain, knownTrackers);
        if (tracker) {
          trackers.push(tracker);
        }
      }
    }
    
    // Extract link hrefs (for external resources)
    const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      const linkUrl = match[1];
      const domain = this.extractDomain(linkUrl, baseUrl);
      
      if (domain && domain !== baseDomain) {
        const tracker = this.identifyTracker(domain, knownTrackers);
        if (tracker) {
          trackers.push(tracker);
        }
      }
    }
    
    // Extract img sources (for tracking pixels)
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = imgRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      const domain = this.extractDomain(imgUrl, baseUrl);
      
      if (domain && domain !== baseDomain) {
        const tracker = this.identifyTracker(domain, knownTrackers);
        if (tracker) {
          trackers.push(tracker);
        }
      }
    }
    
    // Extract form actions
    const formRegex = /<form[^>]*action=["']([^"']+)["'][^>]*>/gi;
    while ((match = formRegex.exec(html)) !== null) {
      const formUrl = match[1];
      const domain = this.extractDomain(formUrl, baseUrl);
      
      if (domain && domain !== baseDomain) {
        const tracker = this.identifyTracker(domain, knownTrackers);
        if (tracker) {
          trackers.push(tracker);
        }
      }
    }
    
    // Extract object/embed sources
    const objectRegex = /<(object|embed)[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = objectRegex.exec(html)) !== null) {
      const objectUrl = match[2];
      const domain = this.extractDomain(objectUrl, baseUrl);
      
      if (domain && domain !== baseDomain) {
        const tracker = this.identifyTracker(domain, knownTrackers);
        if (tracker) {
          trackers.push(tracker);
        }
      }
    }
    
    // Extract from inline scripts with enhanced patterns
    const inlineScriptRegex = /<script[^>]*>([^<]+)<\/script>/gi;
    while ((match = inlineScriptRegex.exec(html)) !== null) {
      const scriptContent = match[1];
      
      // Look for URLs in script content with more patterns
      const urlPatterns = [
        /['"`](https?:\/\/[^'"`]+)['"`]/g,
        /['"`](\/\/[^'"`]+\.[^'"`]+)['"`]/g,  // Protocol-relative URLs
        /['"`]([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^'"`]*)['"`]/g,  // Domain patterns
        /['"`]([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^'"`]*)['"`]/g,  // Domain with path
        /['"`]([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\?[^'"`]*)['"`]/g,  // Domain with query
        /['"`]([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}#[^'"`]*)['"`]/g   // Domain with hash
      ];
      
      urlPatterns.forEach(pattern => {
        let urlMatch: RegExpExecArray | null;
        while ((urlMatch = pattern.exec(scriptContent)) !== null) {
          let scriptUrl = urlMatch[1];
          if (scriptUrl.startsWith('//')) {
            scriptUrl = 'https:' + scriptUrl;
          }
          const domain = this.extractDomain(scriptUrl, baseUrl);
          
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      });
      
      // Enhanced tracking function patterns - MUCH MORE COMPREHENSIVE
      const trackingPatterns = [
        // Google Analytics
        /gtag\([^)]*['"`]([^'"`]+)['"`]/g,
        /_gaq\.push\([^)]*['"`]([^'"`]+)['"`]/g,
        /ga\([^)]*['"`]([^'"`]+)['"`]/g,
        /googletagmanager\.com\/gtm\.js\?id=([^'"`&]+)/g,
        /google-analytics\.com\/analytics\.js/g,
        /googletagmanager\.com/g,
        /analytics\.google\.com/g,
        
        // Facebook
        /fbq\([^)]*['"`]([^'"`]+)['"`]/g,
        /facebook\.com\/tr\?id=([^'"`&]+)/g,
        /pixel\.facebook\.com\/tr\?id=([^'"`&]+)/g,
        /connect\.facebook\.net/g,
        /facebook\.com/g,
        
        // LinkedIn
        /snap\.licdn\.com\/li\.lms-analytics\/insight\.min\.js/g,
        /linkedin\.com/g,
        /licdn\.com/g,
        
        // Twitter/X
        /analytics\.twitter\.com\/i\/adsct/g,
        /twitter\.com/g,
        /t\.co/g,
        
        // Snapchat
        /tr\.snapchat\.com\/pixel/g,
        /snapchat\.com/g,
        
        // TikTok
        /analytics\.tiktok\.com\/i18n\/pixel/g,
        /tiktok\.com/g,
        
        // Other Analytics
        /_paq\.push\([^)]*['"`]([^'"`]+)['"`]/g,
        /mixpanel\.track\([^)]*['"`]([^'"`]+)['"`]/g,
        /amplitude\.logEvent\([^)]*['"`]([^'"`]+)['"`]/g,
        /hotjar\._hjSettings\.hjid\s*=\s*['"`]([^'"`]+)['"`]/g,
        /hotjar\.com/g,
        /mixpanel\.com/g,
        /amplitude\.com/g,
        /posthog\.com/g,
        /clarity\.ms/g,
        /plausible\.io/g,
        /fathom\.com/g,
        /simpleanalytics\.com/g,
        
        // Advertising
        /googlesyndication\.com/g,
        /doubleclick\.net/g,
        /googleadservices\.com/g,
        /amazon-adsystem\.com/g,
        /amazon\.com/g,
        /criteo\.com/g,
        /taboola\.com/g,
        /outbrain\.com/g,
        /adnxs\.com/g,
        /rubiconproject\.com/g,
        /pubmatic\.com/g,
        /openx\.net/g,
        /adform\.net/g,
        /adtech\.com/g,
        /advertising\.com/g,
        
        // Social Media
        /instagram\.com/g,
        /pinterest\.com/g,
        /reddit\.com/g,
        /youtube\.com/g,
        /vimeo\.com/g,
        /twitch\.tv/g,
        /discord\.com/g,
        /telegram\.org/g,
        /whatsapp\.com/g,
        
        // Customer Support
        /intercom\.com/g,
        /zendesk\.com/g,
        /freshdesk\.com/g,
        /helpscout\.com/g,
        /tawk\.to/g,
        /crisp\.chat/g,
        /olark\.com/g,
        /livechatinc\.com/g,
        /tidio\.co/g,
        /userlike\.com/g,
        
        // Payment Processors
        /stripe\.com/g,
        /paypal\.com/g,
        /squareup\.com/g,
        /braintreepayments\.com/g,
        /adyen\.com/g,
        /klarna\.com/g,
        /affirm\.com/g,
        
        // CDNs and Static Assets
        /cdnjs\.cloudflare\.com/g,
        /unpkg\.com/g,
        /jsdelivr\.net/g,
        /cdn\.jsdelivr\.net/g,
        /bootstrapcdn\.com/g,
        /maxcdn\.com/g,
        /fastly\.com/g,
        /cloudflare\.com/g,
        
        // Security and Authentication
        /recaptcha\.net/g,
        /hcaptcha\.com/g,
        /turnstile\.cloudflare\.com/g,
        /auth0\.com/g,
        /clerk\.com/g,
        /supabase\.com/g,
        /firebase\.com/g,
        
        // Search and Discovery
        /algolia\.net/g,
        /elastic\.co/g,
        /search\.google\.com/g,
        
        // Comments and Community
        /disqus\.com/g,
        /gravatar\.com/g,
        /wordpress\.com/g,
        
        // Email Marketing
        /mailchimp\.com/g,
        /sendgrid\.com/g,
        /klaviyo\.com/g,
        /convertkit\.com/g,
        /activecampaign\.com/g,
        /drip\.com/g,
        
        // E-commerce
        /shopify\.com/g,
        /woocommerce\.com/g,
        /bigcommerce\.com/g,
        /magento\.com/g,
        /prestashop\.com/g,
        
        // Video and Media
        /wistia\.com/g,
        /vimeo\.com/g,
        /brightcove\.com/g,
        /jwplayer\.com/g,
        /flowplayer\.com/g,
        
        // Maps and Location
        /maps\.google\.com/g,
        /maps\.bing\.com/g,
        /mapbox\.com/g,
        /here\.com/g,
        
        // Weather and Data
        /openweathermap\.org/g,
        /weather\.com/g,
        /ipapi\.co/g,
        /ipinfo\.io/g,
        /ip-api\.com/g,
        
        // Development and Monitoring
        /sentry\.io/g,
        /logrocket\.com/g,
        /fullstory\.com/g,
        /mouseflow\.com/g,
        /luckyorange\.com/g,
        /inspectlet\.com/g,
        /crazyegg\.com/g,
        /optimizely\.com/g,
        /vwo\.com/g,
        /abtasty\.com/g,
        
        // Content and CMS
        /contentful\.com/g,
        /sanity\.io/g,
        /strapi\.io/g,
        /ghost\.org/g,
        /medium\.com/g,
        
        // Forms and Surveys
        /typeform\.com/g,
        /survey\.monkey\.com/g,
        /qualtrics\.com/g,
        /google\.com\/forms/g,
        /microsoft\.com\/forms/g,
        
        // Communication
        /slack\.com/g,
        /teams\.microsoft\.com/g,
        /zoom\.us/g,
        /meet\.google\.com/g,
        /webex\.com/g,
        
        // File Storage and Sharing
        /dropbox\.com/g,
        /drive\.google\.com/g,
        /onedrive\.live\.com/g,
        /box\.com/g,
        /aws\.amazon\.com/g,
        /cloud\.google\.com/g,
        /azure\.microsoft\.com/g
      ];
      
      trackingPatterns.forEach(pattern => {
        let urlMatch: RegExpExecArray | null;
        while ((urlMatch = pattern.exec(scriptContent)) !== null) {
          const trackingUrl = urlMatch[1] || urlMatch[0];
          if (trackingUrl.includes('.') || trackingUrl.includes('facebook') || trackingUrl.includes('google') || 
              trackingUrl.includes('twitter') || trackingUrl.includes('linkedin') || trackingUrl.includes('tiktok') ||
              trackingUrl.includes('snapchat') || trackingUrl.includes('instagram') || trackingUrl.includes('youtube')) {
            const domain = this.extractDomain(trackingUrl, baseUrl);
            if (domain && domain !== baseDomain) {
              const tracker = this.identifyTracker(domain, knownTrackers);
              if (tracker) {
                trackers.push(tracker);
              }
            }
          }
        }
      });
      
      // Extract variable assignments that might contain tracking URLs
      const varPatterns = [
        /var\s+\w+\s*=\s*['"`]([^'"`]+)['"`]/g,
        /let\s+\w+\s*=\s*['"`]([^'"`]+)['"`]/g,
        /const\s+\w+\s*=\s*['"`]([^'"`]+)['"`]/g,
        /\w+\s*=\s*['"`]([^'"`]+)['"`]/g
      ];
      
      varPatterns.forEach(pattern => {
        let varMatch: RegExpExecArray | null;
        while ((varMatch = pattern.exec(scriptContent)) !== null) {
          const varValue = varMatch[1];
          if (varValue.includes('http') || varValue.includes('//')) {
            let url = varValue;
            if (url.startsWith('//')) {
              url = 'https:' + url;
            }
            const domain = this.extractDomain(url, baseUrl);
            if (domain && domain !== baseDomain) {
              const tracker = this.identifyTracker(domain, knownTrackers);
              if (tracker) {
                trackers.push(tracker);
              }
            }
          }
        }
      });
    }
    
    // Extract from data attributes with enhanced patterns
    const dataAttrPatterns = [
      /data-[^=]+=["']([^"']+)["']/gi,
      /data-[^=]+=["']([^"']*https?:\/\/[^"']+)["']/gi,
      /data-[^=]+=["']([^"']*\/\/[^"']+)["']/gi,
      /data-[^=]+=["']([^"']*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^"']*)["']/gi
    ];
    
    dataAttrPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const dataValue = match[1];
        if (dataValue.includes('http') || dataValue.includes('//') || dataValue.includes('.')) {
          let url = dataValue;
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }
          const domain = this.extractDomain(url, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    });
    
    // Extract from any attribute that might contain URLs
    const attrPatterns = [
      /(?:href|src|action|data-src|data-href|data-url|data-link)=["']([^"']+)["']/gi,
      /(?:url|link|api|endpoint)=["']([^"']+)["']/gi,
      /(?:tracking|analytics|pixel)=["']([^"']+)["']/gi
    ];
    
    attrPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const attrValue = match[1];
        if (attrValue.includes('http') || attrValue.includes('//') || attrValue.includes('.')) {
          let url = attrValue;
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }
          const domain = this.extractDomain(url, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    });
    
    // Extract from meta tags with enhanced patterns
    const metaPatterns = [
      /<meta[^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*name=["']canonical["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*name=["']publisher["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["'][^>]*>/gi
    ];
    
    metaPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const metaContent = match[1];
        if (metaContent.includes('http') || metaContent.includes('//')) {
          const domain = this.extractDomain(metaContent, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    });
    
    // Extract from link tags (more comprehensive)
    const linkPatterns = [
      /<link[^>]*href=["']([^"']+)["'][^>]*>/gi,
      /<link[^>]*rel=["']preconnect["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
      /<link[^>]*rel=["']dns-prefetch["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
      /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
      /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["'][^>]*>/gi
    ];
    
    linkPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const linkUrl = match[1];
        if (linkUrl.includes('http') || linkUrl.includes('//')) {
          let url = linkUrl;
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }
          const domain = this.extractDomain(url, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    });
    
    // Extract from CSS with enhanced patterns
    const cssPatterns = [
      /url\(['"]?([^'")\s]+)['"]?\)/gi,
      /@import\s+['"`]([^'"`]+)['"`]/gi,
      /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /background:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /src:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /font-face\s*{[^}]*src:\s*url\(['"]?([^'")\s]+)['"]?\)[^}]*}/gi,
      /@font-face\s*{[^}]*src:\s*url\(['"]?([^'")\s]+)['"]?\)[^}]*}/gi
    ];
    
    cssPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const cssUrl = match[1];
        if (cssUrl.startsWith('http') || cssUrl.startsWith('//')) {
          let url = cssUrl;
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }
          const domain = this.extractDomain(url, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    });
    
    // Extract from inline styles
    const inlineStyleRegex = /style=["']([^"']+)["']/gi;
    while ((match = inlineStyleRegex.exec(html)) !== null) {
      const styleContent = match[1];
      const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
      let urlMatch: RegExpExecArray | null;
      
      while ((urlMatch = urlRegex.exec(styleContent)) !== null) {
        const styleUrl = urlMatch[1];
        if (styleUrl.startsWith('http') || styleUrl.startsWith('//')) {
          let url = styleUrl;
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }
          const domain = this.extractDomain(url, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    }
    
    // Extract from JSON-LD structured data
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = JSON.parse(match[1]);
        const extractUrlsFromJson = (obj: any): string[] => {
          const urls: string[] = [];
          if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(value => {
              if (typeof value === 'string' && (value.includes('http') || value.includes('//'))) {
                urls.push(value);
              } else if (typeof value === 'object') {
                urls.push(...extractUrlsFromJson(value));
              }
            });
          }
          return urls;
        };
        
        const urls = extractUrlsFromJson(jsonContent);
        urls.forEach(url => {
          const domain = this.extractDomain(url, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        });
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
    
    // Extract from comments (some trackers are hidden in comments)
    const commentRegex = /<!--([^>]+)-->/gi;
    while ((match = commentRegex.exec(html)) !== null) {
      const commentContent = match[1];
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      let urlMatch: RegExpExecArray | null;
      
      while ((urlMatch = urlRegex.exec(commentContent)) !== null) {
        const commentUrl = urlMatch[1];
        const domain = this.extractDomain(commentUrl, baseUrl);
        if (domain && domain !== baseDomain) {
          const tracker = this.identifyTracker(domain, knownTrackers);
          if (tracker) {
            trackers.push(tracker);
          }
        }
      }
    }
    
    // Extract from any remaining URL patterns in the entire HTML
    const generalUrlPatterns = [
      /(https?:\/\/[^\s"'<>]+)/gi,
      /(\/\/[^\s"'<>]+\.[^\s"'<>]+)/gi,
      /([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"'<>]*)/gi
    ];
    
    generalUrlPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        if (url.includes('.') && !url.startsWith('data:') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
          let fullUrl = url;
          if (url.startsWith('//')) {
            fullUrl = 'https:' + url;
          }
          const domain = this.extractDomain(fullUrl, baseUrl);
          if (domain && domain !== baseDomain) {
            const tracker = this.identifyTracker(domain, knownTrackers);
            if (tracker) {
              trackers.push(tracker);
            }
          }
        }
      }
    });
    
    // Extract from specific tracking patterns that might be embedded in HTML
    const embeddedTrackingPatterns = [
      /(?:tracking|analytics|pixel|beacon|monitor)\.([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
      /(?:api|cdn|static|assets)\.([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
      /(?:ads|advertising|marketing)\.([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
    ];
    
    embeddedTrackingPatterns.forEach(pattern => {
      while ((match = pattern.exec(html)) !== null) {
        const domain = match[1];
        if (domain && domain !== baseDomain) {
          const tracker = this.identifyTracker(domain, knownTrackers);
          if (tracker) {
            trackers.push(tracker);
          }
        }
      }
    });
    
    console.log(`Found ${trackers.length} potential trackers before deduplication`);
    
    // Remove duplicates based on domain
    const uniqueTrackers = trackers.filter((tracker, index, self) => 
      index === self.findIndex((t: any) => t.domain === tracker.domain)
    );
    
    console.log(`Found ${uniqueTrackers.length} unique trackers after deduplication`);
    
    return uniqueTrackers;
  }

  private extractDomain(url: string, baseUrl: string): string | null {
    try {
      if (url.startsWith('//')) {
        url = 'https:' + url;
      } else if (url.startsWith('/')) {
        const baseDomain = new URL(baseUrl).origin;
        url = baseDomain + url;
      } else if (!url.startsWith('http')) {
        const baseDomain = new URL(baseUrl).origin;
        url = baseDomain + '/' + url;
      }
      
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  private identifyTracker(domain: string, knownTrackers: any[]): any {
    // Clean the domain for better matching
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    
    const tracker = knownTrackers.find(t => {
      // Check if domain matches the main domain
      if (cleanDomain.includes(t.domain.toLowerCase())) {
        return true;
      }
      // Check if domain matches any of the known domains
      return t.domains.some(d => cleanDomain.includes(d.toLowerCase()));
    });
    
    if (tracker) {
      return {
        service: tracker.service,
        type: tracker.type,
        domain: domain,
        riskLevel: tracker.riskLevel,
        description: tracker.description
      };
    }
    
    // Enhanced classification for unknown domains
    let type = 'Other';
    let riskLevel = 'Medium';
    let service = 'Unknown Tracker';
    let description = 'Third-party domain not in known tracker database';
    
    // Try to classify based on domain patterns
    if (cleanDomain.includes('analytics') || cleanDomain.includes('stats') || cleanDomain.includes('metric')) {
      type = 'Analytics';
      service = 'Analytics Service';
      description = 'Analytics or metrics collection service';
    } else if (cleanDomain.includes('ad') || cleanDomain.includes('ads') || cleanDomain.includes('banner') || cleanDomain.includes('pixel')) {
      type = 'Ads';
      service = 'Advertising Service';
      description = 'Advertising or ad serving service';
      riskLevel = 'High';
    } else if (cleanDomain.includes('track') || cleanDomain.includes('monitor') || cleanDomain.includes('spy')) {
      type = 'Tracker';
      service = 'Tracking Service';
      description = 'User tracking or monitoring service';
      riskLevel = 'High';
    } else if (cleanDomain.includes('cdn') || cleanDomain.includes('static') || cleanDomain.includes('assets')) {
      type = 'Other';
      service = 'CDN/Static Assets';
      description = 'Content delivery network or static asset hosting';
      riskLevel = 'Low';
    } else if (cleanDomain.includes('api') || cleanDomain.includes('service')) {
      type = 'Other';
      service = 'API Service';
      description = 'Third-party API or service integration';
      riskLevel = 'Medium';
    }
    
    return {
      service,
      type,
      domain: domain,
      riskLevel,
      description
    };
  }

  private getKnownTrackers() {
    return [
      // Google Services
      {
        service: 'Google Analytics',
        type: 'Analytics',
        domain: 'google-analytics.com',
        domains: ['googletagmanager.com', 'google-analytics.com', 'analytics.google.com', 'www.googletagmanager.com'],
        riskLevel: 'Medium',
        description: 'Website analytics and user behavior tracking'
      },
      {
        service: 'Google Ads',
        type: 'Ads',
        domain: 'doubleclick.net',
        domains: ['doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'pagead2.googlesyndication.com'],
        riskLevel: 'High',
        description: 'Google advertising network tracking'
      },
      {
        service: 'Google Tag Manager',
        type: 'Analytics',
        domain: 'googletagmanager.com',
        domains: ['googletagmanager.com', 'www.googletagmanager.com'],
        riskLevel: 'Medium',
        description: 'Tag management and tracking orchestration'
      },
      {
        service: 'Google Fonts',
        type: 'Other',
        domain: 'fonts.googleapis.com',
        domains: ['fonts.googleapis.com', 'fonts.gstatic.com'],
        riskLevel: 'Low',
        description: 'Google Fonts CDN (may track font usage)'
      },
      {
        service: 'Google Maps',
        type: 'Other',
        domain: 'maps.googleapis.com',
        domains: ['maps.googleapis.com', 'maps.gstatic.com'],
        riskLevel: 'Low',
        description: 'Google Maps API (may track location data)'
      },
      {
        service: 'Google reCAPTCHA',
        type: 'Tracker',
        domain: 'google.com',
        domains: ['www.google.com', 'recaptcha.google.com'],
        riskLevel: 'Medium',
        description: 'Bot protection and user verification'
      },

      // Facebook Services
      {
        service: 'Facebook Pixel',
        type: 'Ads',
        domain: 'facebook.net',
        domains: ['connect.facebook.net', 'facebook.com', 'www.facebook.com'],
        riskLevel: 'High',
        description: 'Facebook advertising and conversion tracking'
      },
      {
        service: 'Facebook Social Plugin',
        type: 'Tracker',
        domain: 'facebook.com',
        domains: ['facebook.com', 'www.facebook.com'],
        riskLevel: 'Medium',
        description: 'Facebook social media integration'
      },

      // Microsoft Services
      {
        service: 'Microsoft Clarity',
        type: 'Analytics',
        domain: 'clarity.ms',
        domains: ['clarity.ms'],
        riskLevel: 'Medium',
        description: 'Microsoft user behavior analytics'
      },
      {
        service: 'Microsoft Advertising',
        type: 'Ads',
        domain: 'bing.com',
        domains: ['bing.com', 'bat.bing.com'],
        riskLevel: 'High',
        description: 'Microsoft advertising network'
      },

      // Social Media Trackers
      {
        service: 'LinkedIn Insight',
        type: 'Ads',
        domain: 'linkedin.com',
        domains: ['linkedin.com', 'snap.licdn.com', 'px.ads.linkedin.com'],
        riskLevel: 'Medium',
        description: 'LinkedIn advertising and conversion tracking'
      },
      {
        service: 'Twitter Pixel',
        type: 'Ads',
        domain: 'twitter.com',
        domains: ['twitter.com', 't.co', 'analytics.twitter.com'],
        riskLevel: 'Medium',
        description: 'Twitter advertising and conversion tracking'
      },
      {
        service: 'Pinterest Tag',
        type: 'Ads',
        domain: 'pinterest.com',
        domains: ['pinterest.com', 'pinimg.com', 's.pinimg.com'],
        riskLevel: 'Medium',
        description: 'Pinterest advertising and conversion tracking'
      },
      {
        service: 'TikTok Pixel',
        type: 'Ads',
        domain: 'tiktok.com',
        domains: ['tiktok.com', 'analytics.tiktok.com'],
        riskLevel: 'High',
        description: 'TikTok advertising and conversion tracking'
      },
      {
        service: 'Snapchat Pixel',
        type: 'Ads',
        domain: 'snapchat.com',
        domains: ['snapchat.com', 'tr.snapchat.com'],
        riskLevel: 'High',
        description: 'Snapchat advertising and conversion tracking'
      },

      // Analytics Services
      {
        service: 'Hotjar',
        type: 'Analytics',
        domain: 'hotjar.com',
        domains: ['static.hotjar.com', 'hotjar.com', 'vars.hotjar.com'],
        riskLevel: 'Medium',
        description: 'User behavior analytics and heatmaps'
      },
      {
        service: 'Mixpanel',
        type: 'Analytics',
        domain: 'mixpanel.com',
        domains: ['mixpanel.com', 'api.mixpanel.com'],
        riskLevel: 'Medium',
        description: 'User analytics and event tracking'
      },
      {
        service: 'Segment',
        type: 'Analytics',
        domain: 'segment.com',
        domains: ['segment.com', 'segment.io', 'api.segment.io'],
        riskLevel: 'Medium',
        description: 'Customer data platform and analytics'
      },
      {
        service: 'Amplitude',
        type: 'Analytics',
        domain: 'amplitude.com',
        domains: ['amplitude.com', 'api.amplitude.com'],
        riskLevel: 'Medium',
        description: 'Product analytics and user behavior tracking'
      },
      {
        service: 'Heap Analytics',
        type: 'Analytics',
        domain: 'heap.io',
        domains: ['heap.io', 'cdn.heapanalytics.com'],
        riskLevel: 'Medium',
        description: 'Automatic event tracking and analytics'
      },
      {
        service: 'Crazy Egg',
        type: 'Analytics',
        domain: 'crazyegg.com',
        domains: ['crazyegg.com', 'script.crazyegg.com'],
        riskLevel: 'Medium',
        description: 'Heatmap and user behavior analytics'
      },
      {
        service: 'FullStory',
        type: 'Analytics',
        domain: 'fullstory.com',
        domains: ['fullstory.com', 'rs.fullstory.com'],
        riskLevel: 'High',
        description: 'Session replay and user behavior analytics'
      },
      {
        service: 'Mouseflow',
        type: 'Analytics',
        domain: 'mouseflow.com',
        domains: ['mouseflow.com', 'cdn.mouseflow.com'],
        riskLevel: 'Medium',
        description: 'User behavior analytics and heatmaps'
      },
      {
        service: 'Lucky Orange',
        type: 'Analytics',
        domain: 'luckyorange.com',
        domains: ['luckyorange.com', 'cdn.luckyorange.com'],
        riskLevel: 'Medium',
        description: 'User behavior analytics and heatmaps'
      },
      {
        service: 'Smartlook',
        type: 'Analytics',
        domain: 'smartlook.com',
        domains: ['smartlook.com', 'rec.smartlook.com'],
        riskLevel: 'Medium',
        description: 'Session recording and user behavior analytics'
      },
      {
        service: 'Piwik/Matomo',
        type: 'Analytics',
        domain: 'matomo.org',
        domains: ['matomo.org', 'piwik.org'],
        riskLevel: 'Low',
        description: 'Privacy-focused web analytics'
      },
      {
        service: 'Plausible Analytics',
        type: 'Analytics',
        domain: 'plausible.io',
        domains: ['plausible.io'],
        riskLevel: 'Low',
        description: 'Privacy-focused web analytics'
      },
      {
        service: 'Fathom Analytics',
        type: 'Analytics',
        domain: 'usefathom.com',
        domains: ['usefathom.com'],
        riskLevel: 'Low',
        description: 'Privacy-focused web analytics'
      },

      // Advertising Networks
      {
        service: 'Amazon Advertising',
        type: 'Ads',
        domain: 'amazon-adsystem.com',
        domains: ['amazon-adsystem.com', 'aax.amazon-adsystem.com'],
        riskLevel: 'High',
        description: 'Amazon advertising network'
      },
      {
        service: 'Criteo',
        type: 'Ads',
        domain: 'criteo.com',
        domains: ['criteo.com', 'static.criteo.net'],
        riskLevel: 'High',
        description: 'Retargeting and display advertising'
      },
      {
        service: 'Taboola',
        type: 'Ads',
        domain: 'taboola.com',
        domains: ['taboola.com', 'cdn.taboola.com'],
        riskLevel: 'High',
        description: 'Content recommendation and advertising'
      },
      {
        service: 'Outbrain',
        type: 'Ads',
        domain: 'outbrain.com',
        domains: ['outbrain.com', 'cdn.outbrain.com'],
        riskLevel: 'High',
        description: 'Content recommendation and advertising'
      },
      {
        service: 'Media.net',
        type: 'Ads',
        domain: 'media.net',
        domains: ['media.net', 'cdn.media.net'],
        riskLevel: 'High',
        description: 'Contextual advertising network'
      },
      {
        service: 'AdRoll',
        type: 'Ads',
        domain: 'adroll.com',
        domains: ['adroll.com', 's.adroll.com'],
        riskLevel: 'High',
        description: 'Retargeting and display advertising'
      },
      {
        service: 'Perfect Audience',
        type: 'Ads',
        domain: 'perfectaudience.com',
        domains: ['perfectaudience.com'],
        riskLevel: 'High',
        description: 'Retargeting and display advertising'
      },
      {
        service: 'Adform',
        type: 'Ads',
        domain: 'adform.net',
        domains: ['adform.net', 'track.adform.net'],
        riskLevel: 'High',
        description: 'Digital advertising platform'
      },
      {
        service: 'Sovrn',
        type: 'Ads',
        domain: 'sovrn.com',
        domains: ['sovrn.com', 'ap.lijit.com'],
        riskLevel: 'High',
        description: 'Content monetization and advertising'
      },

      // Data Brokers and Trackers
      {
        service: 'Quantcast',
        type: 'Tracker',
        domain: 'quantserve.com',
        domains: ['quantserve.com', 'pixel.quantserve.com'],
        riskLevel: 'Medium',
        description: 'Audience measurement and analytics'
      },
      {
        service: 'Scorecard Research',
        type: 'Tracker',
        domain: 'scorecardresearch.com',
        domains: ['scorecardresearch.com', 'b.scorecardresearch.com'],
        riskLevel: 'Low',
        description: 'Market research and analytics'
      },
      {
        service: 'Comscore',
        type: 'Tracker',
        domain: 'comscore.com',
        domains: ['comscore.com', 'sb.scorecardresearch.com'],
        riskLevel: 'Medium',
        description: 'Digital media analytics and measurement'
      },
      {
        service: 'Nielsen',
        type: 'Tracker',
        domain: 'nielsen.com',
        domains: ['nielsen.com', 'secure-us.imrworldwide.com'],
        riskLevel: 'Medium',
        description: 'Media measurement and analytics'
      },
      {
        service: 'Lotame',
        type: 'Tracker',
        domain: 'lotame.com',
        domains: ['lotame.com', 'crwdcntrl.net'],
        riskLevel: 'High',
        description: 'Data management platform'
      },
      {
        service: 'LiveRamp',
        type: 'Tracker',
        domain: 'liveramp.com',
        domains: ['liveramp.com', 'idsync.rlcdn.com'],
        riskLevel: 'High',
        description: 'Identity resolution and data connectivity'
      },
      {
        service: 'The Trade Desk',
        type: 'Ads',
        domain: 'thetradedesk.com',
        domains: ['thetradedesk.com', 'ads.tdameritrade.com'],
        riskLevel: 'High',
        description: 'Programmatic advertising platform'
      },
      {
        service: 'AppNexus',
        type: 'Ads',
        domain: 'appnexus.com',
        domains: ['appnexus.com', 'adnxs.com'],
        riskLevel: 'High',
        description: 'Programmatic advertising platform'
      },
      {
        service: 'OpenX',
        type: 'Ads',
        domain: 'openx.net',
        domains: ['openx.net'],
        riskLevel: 'High',
        description: 'Programmatic advertising platform'
      },
      {
        service: 'PubMatic',
        type: 'Ads',
        domain: 'pubmatic.com',
        domains: ['pubmatic.com', 'ads.pubmatic.com'],
        riskLevel: 'High',
        description: 'Programmatic advertising platform'
      },
      {
        service: 'Rubicon Project',
        type: 'Ads',
        domain: 'rubiconproject.com',
        domains: ['rubiconproject.com', 'fastlane.rubiconproject.com'],
        riskLevel: 'High',
        description: 'Programmatic advertising platform'
      },

      // E-commerce and Conversion Tracking
      {
        service: 'Shopify Analytics',
        type: 'Analytics',
        domain: 'shopify.com',
        domains: ['shopify.com', 'cdn.shopify.com'],
        riskLevel: 'Medium',
        description: 'E-commerce analytics and tracking'
      },
      {
        service: 'WooCommerce Analytics',
        type: 'Analytics',
        domain: 'woocommerce.com',
        domains: ['woocommerce.com'],
        riskLevel: 'Medium',
        description: 'E-commerce analytics and tracking'
      },
      {
        service: 'Klaviyo',
        type: 'Analytics',
        domain: 'klaviyo.com',
        domains: ['klaviyo.com', 'static.klaviyo.com'],
        riskLevel: 'Medium',
        description: 'Email marketing and analytics'
      },
      {
        service: 'Mailchimp',
        type: 'Analytics',
        domain: 'mailchimp.com',
        domains: ['mailchimp.com', 'chimpstatic.com'],
        riskLevel: 'Medium',
        description: 'Email marketing and analytics'
      },
      {
        service: 'ConvertKit',
        type: 'Analytics',
        domain: 'convertkit.com',
        domains: ['convertkit.com', 'f.convertkit.com'],
        riskLevel: 'Medium',
        description: 'Email marketing and analytics'
      },

      // Customer Support and Chat
      {
        service: 'Intercom',
        type: 'Tracker',
        domain: 'intercom.io',
        domains: ['intercom.io', 'widget.intercom.io'],
        riskLevel: 'Medium',
        description: 'Customer messaging and support'
      },
      {
        service: 'Drift',
        type: 'Tracker',
        domain: 'drift.com',
        domains: ['drift.com', 'js.driftt.com'],
        riskLevel: 'Medium',
        description: 'Conversational marketing and chat'
      },
      {
        service: 'Zendesk',
        type: 'Tracker',
        domain: 'zendesk.com',
        domains: ['zendesk.com', 'static.zdassets.com'],
        riskLevel: 'Medium',
        description: 'Customer support and help desk'
      },
      {
        service: 'Freshdesk',
        type: 'Tracker',
        domain: 'freshdesk.com',
        domains: ['freshdesk.com'],
        riskLevel: 'Medium',
        description: 'Customer support and help desk'
      },
      {
        service: 'Tawk.to',
        type: 'Tracker',
        domain: 'tawk.to',
        domains: ['tawk.to'],
        riskLevel: 'Medium',
        description: 'Live chat and customer support'
      },

      // CDN and Performance
      {
        service: 'Cloudflare',
        type: 'Other',
        domain: 'cloudflare.com',
        domains: ['cloudflare.com', 'cdnjs.cloudflare.com'],
        riskLevel: 'Low',
        description: 'CDN and security services'
      },
      {
        service: 'jsDelivr',
        type: 'Other',
        domain: 'jsdelivr.net',
        domains: ['jsdelivr.net', 'cdn.jsdelivr.net'],
        riskLevel: 'Low',
        description: 'CDN for JavaScript libraries'
      },
      {
        service: 'unpkg',
        type: 'Other',
        domain: 'unpkg.com',
        domains: ['unpkg.com'],
        riskLevel: 'Low',
        description: 'CDN for npm packages'
      },
      {
        service: 'Bootstrap CDN',
        type: 'Other',
        domain: 'bootstrapcdn.com',
        domains: ['bootstrapcdn.com', 'maxcdn.bootstrapcdn.com'],
        riskLevel: 'Low',
        description: 'Bootstrap CSS and JS CDN'
      },
      {
        service: 'Optimizely',
        type: 'Analytics',
        domain: 'optimizely.com',
        domains: ['optimizely.com', 'cdn.optimizely.com'],
        riskLevel: 'Medium',
        description: 'A/B testing and experimentation platform'
      },
      {
        service: 'Chartbeat',
        type: 'Analytics',
        domain: 'chartbeat.com',
        domains: ['chartbeat.com', 'static.chartbeat.com'],
        riskLevel: 'Medium',
        description: 'Real-time analytics and content optimization'
      },
      {
        service: 'Index Exchange',
        type: 'Ads',
        domain: 'indexww.com',
        domains: ['indexww.com', 'js-sec.indexww.com'],
        riskLevel: 'High',
        description: 'Programmatic advertising exchange'
      },
      {
        service: 'OneTag',
        type: 'Ads',
        domain: 's-onetag.com',
        domains: ['s-onetag.com', 'get.s-onetag.com'],
        riskLevel: 'High',
        description: 'Header bidding and programmatic advertising'
      },
      {
        service: 'AdSafe',
        type: 'Ads',
        domain: 'adsafeprotected.com',
        domains: ['adsafeprotected.com', 'cdn.adsafeprotected.com'],
        riskLevel: 'Medium',
        description: 'Ad verification and brand safety'
      },

      // Security and Monitoring
      {
        service: 'Sentry',
        type: 'Analytics',
        domain: 'sentry.io',
        domains: ['sentry.io', 'browser.sentry-cdn.com'],
        riskLevel: 'Low',
        description: 'Error monitoring and performance tracking'
      },
      {
        service: 'LogRocket',
        type: 'Analytics',
        domain: 'logrocket.com',
        domains: ['logrocket.com', 'cdn.logrocket.io'],
        riskLevel: 'Medium',
        description: 'Session replay and error monitoring'
      },
      {
        service: 'Bugsnag',
        type: 'Analytics',
        domain: 'bugsnag.com',
        domains: ['bugsnag.com', 'd2wy8f7a9ursnm.cloudfront.net'],
        riskLevel: 'Low',
        description: 'Error monitoring and crash reporting'
      },

      // Marketing and Lead Generation
      {
        service: 'HubSpot',
        type: 'Analytics',
        domain: 'hubspot.com',
        domains: ['hubspot.com', 'js.hsforms.net', 'track.hubspot.com'],
        riskLevel: 'Medium',
        description: 'Marketing automation and analytics'
      },
      {
        service: 'Marketo',
        type: 'Analytics',
        domain: 'marketo.com',
        domains: ['marketo.com', 'munchkin.marketo.net'],
        riskLevel: 'Medium',
        description: 'Marketing automation and analytics'
      },
      {
        service: 'Pardot',
        type: 'Analytics',
        domain: 'pardot.com',
        domains: ['pardot.com', 'pi.pardot.com'],
        riskLevel: 'Medium',
        description: 'Marketing automation and analytics'
      },
      {
        service: 'Salesforce',
        type: 'Analytics',
        domain: 'salesforce.com',
        domains: ['salesforce.com', 'c.salesforce.com'],
        riskLevel: 'Medium',
        description: 'CRM and marketing analytics'
      },

      // Video and Media
      {
        service: 'YouTube',
        type: 'Other',
        domain: 'youtube.com',
        domains: ['youtube.com', 'www.youtube.com', 'youtu.be'],
        riskLevel: 'Medium',
        description: 'Video embedding and tracking'
      },
      {
        service: 'Vimeo',
        type: 'Other',
        domain: 'vimeo.com',
        domains: ['vimeo.com', 'player.vimeo.com'],
        riskLevel: 'Medium',
        description: 'Video embedding and tracking'
      },
      {
        service: 'Wistia',
        type: 'Analytics',
        domain: 'wistia.com',
        domains: ['wistia.com', 'fast.wistia.com'],
        riskLevel: 'Medium',
        description: 'Video hosting and analytics'
      },

      // Payment Processors
      {
        service: 'Stripe',
        type: 'Other',
        domain: 'stripe.com',
        domains: ['stripe.com', 'js.stripe.com'],
        riskLevel: 'Medium',
        description: 'Payment processing and fraud detection'
      },
      {
        service: 'PayPal',
        type: 'Other',
        domain: 'paypal.com',
        domains: ['paypal.com', 'www.paypal.com'],
        riskLevel: 'Medium',
        description: 'Payment processing and fraud detection'
      },
      {
        service: 'Square',
        type: 'Other',
        domain: 'squareup.com',
        domains: ['squareup.com'],
        riskLevel: 'Medium',
        description: 'Payment processing and analytics'
      },

      // Additional Common Trackers
      {
        service: 'Google reCAPTCHA v3',
        type: 'Tracker',
        domain: 'recaptcha.net',
        domains: ['recaptcha.net', 'www.recaptcha.net'],
        riskLevel: 'Medium',
        description: 'Google reCAPTCHA bot protection'
      },
      {
        service: 'Cloudflare Analytics',
        type: 'Analytics',
        domain: 'cloudflareinsights.com',
        domains: ['cloudflareinsights.com'],
        riskLevel: 'Low',
        description: 'Cloudflare web analytics'
      },
      {
        service: 'Vercel Analytics',
        type: 'Analytics',
        domain: 'vercel-insights.com',
        domains: ['vercel-insights.com'],
        riskLevel: 'Low',
        description: 'Vercel web analytics'
      },
      {
        service: 'PostHog',
        type: 'Analytics',
        domain: 'posthog.com',
        domains: ['posthog.com', 'app.posthog.com'],
        riskLevel: 'Medium',
        description: 'Product analytics and feature flags'
      },
      {
        service: 'Clerk',
        type: 'Tracker',
        domain: 'clerk.com',
        domains: ['clerk.com', 'clerk.accounts.dev'],
        riskLevel: 'Medium',
        description: 'Authentication and user management'
      },
      {
        service: 'Auth0',
        type: 'Tracker',
        domain: 'auth0.com',
        domains: ['auth0.com', 'login.auth0.com'],
        riskLevel: 'Medium',
        description: 'Authentication and authorization'
      },
      {
        service: 'Algolia',
        type: 'Other',
        domain: 'algolia.net',
        domains: ['algolia.net', 'cdn.jsdelivr.net'],
        riskLevel: 'Low',
        description: 'Search and discovery platform'
      },
      {
        service: 'Disqus',
        type: 'Tracker',
        domain: 'disqus.com',
        domains: ['disqus.com', 'disquscdn.com'],
        riskLevel: 'Medium',
        description: 'Comment system and community platform'
      },
      {
        service: 'Gravatar',
        type: 'Other',
        domain: 'gravatar.com',
        domains: ['gravatar.com', 'www.gravatar.com'],
        riskLevel: 'Low',
        description: 'Avatar and profile image service'
      },
      {
        service: 'Tawk.to',
        type: 'Tracker',
        domain: 'tawk.to',
        domains: ['tawk.to', 'embed.tawk.to'],
        riskLevel: 'Medium',
        description: 'Live chat and customer support'
      },
      {
        service: 'Crisp',
        type: 'Tracker',
        domain: 'crisp.chat',
        domains: ['crisp.chat', 'image.crisp.chat'],
        riskLevel: 'Medium',
        description: 'Customer messaging and support'
      },
      {
        service: 'Olark',
        type: 'Tracker',
        domain: 'olark.com',
        domains: ['olark.com', 'static.olark.com'],
        riskLevel: 'Medium',
        description: 'Live chat and customer support'
      },
      {
        service: 'Zendesk Chat',
        type: 'Tracker',
        domain: 'zopim.com',
        domains: ['zopim.com', 'v2.zopim.com'],
        riskLevel: 'Medium',
        description: 'Zendesk live chat widget'
      },
      {
        service: 'LiveChat',
        type: 'Tracker',
        domain: 'livechatinc.com',
        domains: ['livechatinc.com', 'cdn.livechatinc.com'],
        riskLevel: 'Medium',
        description: 'Live chat and customer support'
      },
      {
        service: 'Tidio',
        type: 'Tracker',
        domain: 'tidio.co',
        domains: ['tidio.co', 'code.tidio.co'],
        riskLevel: 'Medium',
        description: 'Live chat and chatbot platform'
      },
      {
        service: 'Userlike',
        type: 'Tracker',
        domain: 'userlike.com',
        domains: ['userlike.com', 'cdn.userlike.com'],
        riskLevel: 'Medium',
        description: 'Live chat and customer support'
      }
    ];
  }
}