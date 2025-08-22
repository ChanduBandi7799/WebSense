import { Injectable } from '@nestjs/common';  
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const execAsync = promisify(exec);
// Default PageSpeed Insights API key
const DEFAULT_PSI_API_KEY = 'AIzaSyD16688gvT2z1PLldcS4LVKu2Bhfa234kE';

@Injectable()
export class WebsiteAnalysisService {
  async runLighthouseAnalysis(url: string) {
    try {
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
      
      // Run Lighthouse using the CLI
      // Note: This requires Lighthouse to be installed globally or as a dependency
      const command = `npx lighthouse ${url} --output=json --output-path=${reportPath} --chrome-flags="--headless --no-sandbox --disable-gpu"`;
      
      await execAsync(command);
      
      // Read and parse the report
      const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      
      // Check if the analysis failed due to page load errors
      if (reportData.runtimeError || 
          (reportData.categories && 
           Object.values(reportData.categories).some((cat: { score: number }) => !cat.score))) {
        console.error('Lighthouse analysis failed:', reportData.runtimeError?.message || 'Unknown error');
        return {
          url: url,
          error: true,
          errorMessage: reportData.runtimeError?.message || 'Failed to analyze website. The site may be down or inaccessible.',
          statusCode: reportData.runtimeError?.code || 'ANALYSIS_FAILED'
        };
      }
      
      // Extract relevant information from the report
      const result = {
        url: url,
        performance: {
          score: Math.round(reportData.categories.performance.score * 100),
          firstContentfulPaint: reportData.audits['first-contentful-paint'].displayValue,
          speedIndex: reportData.audits['speed-index'].displayValue,
          largestContentfulPaint: reportData.audits['largest-contentful-paint'].displayValue,
          timeToInteractive: reportData.audits['interactive'].displayValue,
          totalBlockingTime: reportData.audits['total-blocking-time'].displayValue,
          cumulativeLayoutShift: reportData.audits['cumulative-layout-shift'].displayValue
        },
        seo: {
          score: Math.round(reportData.categories.seo.score * 100),
          issues: this.extractIssues(reportData, 'seo')
        },
        accessibility: {
          score: Math.round(reportData.categories.accessibility.score * 100),
          issues: this.extractIssues(reportData, 'accessibility')
        },
        bestPractices: {
          score: Math.round(reportData.categories['best-practices'].score * 100),
          issues: this.extractIssues(reportData, 'best-practices')
        },
        technologies: this.detectTechnologies(reportData)
      };
      
      return result;
    } catch (error) {
      console.error('Lighthouse analysis error:', error);
      return {
        url: url,
        error: true,
        errorMessage: `Failed to analyze website: ${error.message}`,
        statusCode: 'EXECUTION_ERROR'
      };
    }
  }
  
  // Real PageSpeed Insights API implementation
  async runPageSpeedAnalysis(url: string, apiKey?: string) {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Use provided API key or default to the one provided
      const psiApiKey = apiKey || DEFAULT_PSI_API_KEY;
      
      // Create API URL with API key
      // Create API URL with API key and all categories
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${psiApiKey}&category=performance&category=seo&category=accessibility&category=best-practices`;
      
      // Make the API request
      const response = await this.makeHttpRequest(apiUrl);
      console.log('PageSpeed API raw response:', response.substring(0, 500) + '...'); // Log first 500 chars
      const reportData = JSON.parse(response);
      
      // Debug log for categories
      console.log('PageSpeed categories:', reportData.lighthouseResult?.categories ? 
        Object.keys(reportData.lighthouseResult.categories) : 'No categories found');
      
      // Check if the analysis failed
      if (reportData.error) {
        console.error('PageSpeed Insights API error:', reportData.error.message);
        return {
          url: url,
          error: true,
          errorMessage: reportData.error.message,
          statusCode: reportData.error.code
        };
      }
      
      // Validate that we have the expected data structure
      if (!reportData.lighthouseResult || !reportData.lighthouseResult.categories) {
        console.error('PageSpeed Insights API returned unexpected data structure');
        return {
          url: url,
          error: true,
          errorMessage: 'API returned unexpected data structure',
          statusCode: 'INVALID_RESPONSE'
        };
      }
      
      // Extract relevant information from the report with safe access
      const result = {
        url: url,
        performance: {
          score: reportData.lighthouseResult.categories.performance?.score ? 
                 Math.round(reportData.lighthouseResult.categories.performance.score * 100) : 0,
          firstContentfulPaint: reportData.lighthouseResult.audits?.['first-contentful-paint']?.displayValue || 'N/A',
          speedIndex: reportData.lighthouseResult.audits?.['speed-index']?.displayValue || 'N/A',
          largestContentfulPaint: reportData.lighthouseResult.audits?.['largest-contentful-paint']?.displayValue || 'N/A',
          timeToInteractive: reportData.lighthouseResult.audits?.['interactive']?.displayValue || 'N/A',
          totalBlockingTime: reportData.lighthouseResult.audits?.['total-blocking-time']?.displayValue || 'N/A',
          cumulativeLayoutShift: reportData.lighthouseResult.audits?.['cumulative-layout-shift']?.displayValue || 'N/A'
        },
        seo: {
          score: reportData.lighthouseResult.categories.seo?.score ? 
                 Math.round(reportData.lighthouseResult.categories.seo.score * 100) : 0,
          issues: this.extractIssuesFromPageSpeed(reportData, 'seo')
        },
        accessibility: {
          score: reportData.lighthouseResult.categories.accessibility?.score ? 
                 Math.round(reportData.lighthouseResult.categories.accessibility.score * 100) : 0,
          issues: this.extractIssuesFromPageSpeed(reportData, 'accessibility')
        },
        bestPractices: {
          score: reportData.lighthouseResult.categories['best-practices']?.score ? 
                 Math.round(reportData.lighthouseResult.categories['best-practices'].score * 100) : 0,
          issues: this.extractIssuesFromPageSpeed(reportData, 'best-practices')
        },
        technologies: this.detectTechnologiesFromPageSpeed(reportData),
        suggestions: this.extractPerformanceSuggestions(reportData)
      };
      
      return result;
    } catch (error) {
      console.error('PageSpeed Insights analysis error:', error);
      return {
        url: url,
        error: true,
        errorMessage: `Failed to analyze website: ${error.message}`,
        statusCode: 'EXECUTION_ERROR'
      };
    }
  }
  
  // Helper method to make HTTP requests
  private makeHttpRequest(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }
  
  // Extract issues from PageSpeed Insights report
  private extractIssuesFromPageSpeed(reportData: any, category: string): string[] {
    const issues: string[] = [];
    
    try {
      const audits = reportData.lighthouseResult.categories[category === 'best-practices' ? 'best-practices' : category]?.auditRefs;
      
      if (!audits) return [];
      
      for (const auditRef of audits) {
        const audit = reportData.lighthouseResult.audits[auditRef.id];
        if (audit && audit.score !== 1 && audit.score !== null) {
          issues.push(audit.title);
        }
      }
    } catch (err) {
      console.error(`Error extracting ${category} issues from PageSpeed:`, err);
    }
    
    return issues.slice(0, 5); // Return top 5 issues
  }
  
  // Extract performance suggestions
  private extractPerformanceSuggestions(reportData: any): any[] {
    const suggestions: any[] = [];
    
    try {
      const opportunities = reportData.lighthouseResult.audits;
      
      for (const key in opportunities) {
        const audit = opportunities[key];
        if (audit.details && audit.details.type === 'opportunity' && audit.score !== 1) {
          suggestions.push({
            title: audit.title,
            description: audit.description,
            score: audit.score,
            savings: audit.displayValue
          });
        }
      }
    } catch (err) {
      console.error('Error extracting performance suggestions:', err);
    }
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }
  
  // Detect technologies from PageSpeed Insights report
  private detectTechnologiesFromPageSpeed(reportData: any): any[] {
    const technologies: any[] = [];
    
    try {
      // Check for stack packs which indicate technologies
      if (reportData.lighthouseResult.stackPacks) {
        for (const stack of reportData.lighthouseResult.stackPacks) {
          technologies.push({
            name: stack.title,
            icon: stack.iconDataURL || null
          });
        }
      }
      
      // Check for JS libraries
      const jsLibs = reportData.lighthouseResult.audits['js-libraries'];
      if (jsLibs && jsLibs.details && jsLibs.details.items) {
        for (const lib of jsLibs.details.items) {
          technologies.push({
            name: lib.name,
            version: lib.version || null,
            icon: null
          });
        }
      }
    } catch (err) {
      console.error('Error detecting technologies from PageSpeed:', err);
    }
    
    return technologies;
  }
  
  private extractIssues(reportData: any, category: string) {
    const issues: string[] = [];
    
    try {
      const audits = reportData.categories[category === 'best-practices' ? 'best-practices' : category]?.auditRefs;
      
      if (!audits) return [];
      
      for (const auditRef of audits) {
        const audit = reportData.audits[auditRef.id];
        if (audit && audit.score !== 1 && audit.score !== null) {
          issues.push(audit.title);
        }
      }
    } catch (err) {
      console.error(`Error extracting ${category} issues:`, err);
    }
    
    return issues.slice(0, 5); // Return top 5 issues
  }
  
  private detectTechnologies(reportData: any): any[] {
    const technologies: any[] = [];
    
    try {
      // Check for common technologies based on the stack-packs in the report
      if (reportData.stackPacks) {
        for (const stack of reportData.stackPacks) {
          technologies.push({
            name: stack.title,
            icon: stack.iconDataURL || null
          });
        }
      }
      
      // Add more technology detection logic here
      const jsLibraries = this.detectJsLibraries(reportData);
      technologies.push(...jsLibraries);
    } catch (err) {
      console.error('Error detecting technologies:', err);
    }
    
    return technologies;
  }
  
  private detectJsLibraries(reportData: any): any[] {
    const libraries: any[] = [];
    
    try {
      // Check for common JS libraries in the page
      const jsLibs = reportData.audits['js-libraries'];
      if (jsLibs && jsLibs.details && jsLibs.details.items) {
        for (const lib of jsLibs.details.items) {
          libraries.push({
            name: lib.name,
            version: lib.version || null,
            icon: null
          });
        }
      }
    } catch (err) {
      console.error('Error detecting JS libraries:', err);
    }
    
    return libraries;
  }

  // Real security analysis using HTTP headers and SSL checks
  async runSecurityAnalysis(url: string) {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      console.log(`Starting security analysis for: ${url}`);
      
      // Check HTTPS
      const isHttps = url.startsWith('https://');
      
      // Perform HTTP request to check headers
      const headers = await this.getWebsiteHeaders(url);
      
      const securityChecks = {
        https: {
          title: 'HTTPS Enabled',
          status: isHttps ? 'secure' : 'vulnerable',
          description: isHttps ? 'Website uses secure HTTPS connection' : 'Website does not use HTTPS, which is insecure'
        },
        hsts: {
          title: 'HTTP Strict Transport Security',
          status: headers['strict-transport-security'] ? 'secure' : 'vulnerable',
          description: headers['strict-transport-security'] ? 'HSTS header is present' : 'HSTS header is missing'
        },
        csp: {
          title: 'Content Security Policy',
          status: headers['content-security-policy'] ? 'secure' : 'vulnerable',
          description: headers['content-security-policy'] ? 'CSP header is present' : 'CSP header is missing'
        },
        xframe: {
          title: 'X-Frame-Options',
          status: headers['x-frame-options'] ? 'secure' : 'vulnerable',
          description: headers['x-frame-options'] ? `X-Frame-Options: ${headers['x-frame-options']}` : 'X-Frame-Options header is missing'
        },
        xxss: {
          title: 'X-XSS-Protection',
          status: headers['x-xss-protection'] ? 'secure' : 'warning',
          description: headers['x-xss-protection'] ? `X-XSS-Protection: ${headers['x-xss-protection']}` : 'X-XSS-Protection header is missing'
        },
        xcontent: {
          title: 'X-Content-Type-Options',
          status: headers['x-content-type-options'] ? 'secure' : 'warning',
          description: headers['x-content-type-options'] ? 'X-Content-Type-Options header is present' : 'X-Content-Type-Options header is missing'
        },
        referrer: {
          title: 'Referrer Policy',
          status: headers['referrer-policy'] ? 'secure' : 'warning',
          description: headers['referrer-policy'] ? `Referrer-Policy: ${headers['referrer-policy']}` : 'Referrer-Policy header is missing'
        }
      };
      
      return {
        url,
        checks: securityChecks
      };
    } catch (error) {
      console.error('Security analysis error:', error);
      return {
        url,
        error: true,
        errorMessage: `Failed to analyze website security: ${error.message}`,
        statusCode: 'EXECUTION_ERROR'
      };
    }
  }

  // Helper method to get website headers
  private getWebsiteHeaders(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: 'HEAD'
      };

      const req = https.request(options, (res) => {
        const headers: any = {};
        for (const [key, value] of Object.entries(res.headers)) {
          headers[key.toLowerCase()] = value;
        }
        resolve(headers);
      });

      req.on('error', (err) => {
        console.error('Error fetching headers:', err);
        resolve({}); // Return empty headers instead of rejecting
      });

      req.end();
    });
  }

  // Real SEO analysis using web scraping
  async runAdvancedSEOAnalysis(url: string) {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      console.log(`Starting SEO analysis for: ${url}`);
      
      // Get page content
      const pageContent = await this.getPageContent(url);
      const headers = await this.getWebsiteHeaders(url);
      
      // Analyze page content
      const seoChecks = {
        titleTag: {
          title: 'Title Tag',
          status: this.checkTitleTag(pageContent),
          description: this.getTitleTagDescription(pageContent)
        },
        metaDescription: {
          title: 'Meta Description',
          status: this.checkMetaDescription(pageContent),
          description: this.getMetaDescriptionStatus(pageContent)
        },
        headings: {
          title: 'Heading Structure',
          status: this.checkHeadingStructure(pageContent),
          description: this.getHeadingStatus(pageContent)
        },
        robotsTxt: {
          title: 'Robots.txt',
          status: await this.checkRobotsTxt(url),
          description: 'Check if robots.txt exists and is accessible'
        },
        sitemap: {
          title: 'XML Sitemap',
          status: await this.checkSitemap(url),
          description: 'Check if XML sitemap exists and is accessible'
        },
        canonicalTag: {
          title: 'Canonical Tag',
          status: this.checkCanonicalTag(pageContent),
          description: this.getCanonicalStatus(pageContent)
        },
        viewport: {
          title: 'Mobile Viewport',
          status: this.checkViewportTag(pageContent),
          description: 'Check if viewport meta tag is present for mobile optimization'
        },
        altTags: {
          title: 'Image Alt Tags',
          status: this.checkImageAltTags(pageContent),
          description: this.getAltTagsStatus(pageContent)
        }
      };
      
      return {
        url,
        checks: seoChecks
      };
    } catch (error) {
      console.error('Advanced SEO analysis error:', error);
      return {
        url,
        error: true,
        errorMessage: `Failed to analyze website SEO: ${error.message}`,
        statusCode: 'EXECUTION_ERROR'
      };
    }
  }

  // Helper method to get page content
  private getPageContent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        console.error('Error fetching page content:', err);
        reject(err);
      });
    });
  }

  // SEO check helper methods
  private checkTitleTag(content: string): string {
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) return 'fail';
    const title = titleMatch[1].trim();
    if (title.length === 0) return 'fail';
    if (title.length < 30 || title.length > 60) return 'warn';
    return 'pass';
  }

  private getTitleTagDescription(content: string): string {
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) return 'Title tag is missing';
    const title = titleMatch[1].trim();
    if (title.length === 0) return 'Title tag is empty';
    if (title.length < 30) return `Title tag is too short (${title.length} characters)`;
    if (title.length > 60) return `Title tag is too long (${title.length} characters)`;
    return `Title tag is optimized (${title.length} characters)`;
  }

  private checkMetaDescription(content: string): string {
    const metaMatch = content.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i);
    if (!metaMatch) return 'fail';
    const description = metaMatch[1].trim();
    if (description.length === 0) return 'fail';
    if (description.length < 120 || description.length > 160) return 'warn';
    return 'pass';
  }

  private getMetaDescriptionStatus(content: string): string {
    const metaMatch = content.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i);
    if (!metaMatch) return 'Meta description is missing';
    const description = metaMatch[1].trim();
    if (description.length === 0) return 'Meta description is empty';
    if (description.length < 120) return `Meta description is too short (${description.length} characters)`;
    if (description.length > 160) return `Meta description is too long (${description.length} characters)`;
    return `Meta description is optimized (${description.length} characters)`;
  }

  private checkHeadingStructure(content: string): string {
    const h1Match = content.match(/<h1[^>]*>/gi);
    if (!h1Match) return 'fail';
    if (h1Match.length > 1) return 'warn';
    return 'pass';
  }

  private getHeadingStatus(content: string): string {
    const h1Match = content.match(/<h1[^>]*>/gi);
    if (!h1Match) return 'No H1 tag found';
    if (h1Match.length > 1) return `Multiple H1 tags found (${h1Match.length})`;
    return 'Single H1 tag found (optimal)';
  }

  private async checkRobotsTxt(url: string): Promise<string> {
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      await this.makeHttpRequest(robotsUrl);
      return 'pass';
    } catch (error) {
      return 'fail';
    }
  }

  private async checkSitemap(url: string): Promise<string> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', url).toString();
      await this.makeHttpRequest(sitemapUrl);
      return 'pass';
    } catch (error) {
      return 'fail';
    }
  }

  private checkCanonicalTag(content: string): string {
    const canonicalMatch = content.match(/<link[^>]+rel=["\']canonical["\'][^>]*>/i);
    return canonicalMatch ? 'pass' : 'warn';
  }

  private getCanonicalStatus(content: string): string {
    const canonicalMatch = content.match(/<link[^>]+rel=["\']canonical["\'][^>]*>/i);
    return canonicalMatch ? 'Canonical tag is present' : 'Canonical tag is missing';
  }

  private checkViewportTag(content: string): string {
    const viewportMatch = content.match(/<meta[^>]+name=["\']viewport["\'][^>]*>/i);
    return viewportMatch ? 'pass' : 'fail';
  }

  private checkImageAltTags(content: string): string {
    const imgMatches = content.match(/<img[^>]*>/gi);
    if (!imgMatches) return 'pass'; // No images found
    
    let imagesWithoutAlt = 0;
    for (const img of imgMatches) {
      if (!img.match(/alt=["\'][^"\']*["\']/i)) {
        imagesWithoutAlt++;
      }
    }
    
    if (imagesWithoutAlt === 0) return 'pass';
    if (imagesWithoutAlt / imgMatches.length > 0.5) return 'fail';
    return 'warn';
  }

  private getAltTagsStatus(content: string): string {
    const imgMatches = content.match(/<img[^>]*>/gi);
    if (!imgMatches) return 'No images found';
    
    let imagesWithoutAlt = 0;
    for (const img of imgMatches) {
      if (!img.match(/alt=["\'][^"\']*["\']/i)) {
        imagesWithoutAlt++;
      }
    }
    
    const total = imgMatches.length;
    const withAlt = total - imagesWithoutAlt;
    return `${withAlt}/${total} images have alt tags`;
  }

  // Real tech stack analysis using headers and content analysis
  async runTechStackAnalysis(url: string) {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      console.log(`Starting tech stack analysis for: ${url}`);
      
      const pageContent = await this.getPageContent(url);
      const headers = await this.getWebsiteHeaders(url);
      
      const technologies = this.detectTechnologiesFromContent(pageContent, headers);
      
      return {
        url,
        technologies
      };
    } catch (error) {
      console.error('Tech stack analysis error:', error);
      return {
        url,
        error: true,
        errorMessage: `Failed to analyze website tech stack: ${error.message}`,
        statusCode: 'EXECUTION_ERROR'
      };
    }
  }

  // Detect technologies from page content and headers
  private detectTechnologiesFromContent(content: string, headers: any): any[] {
    const technologies: any[] = [];
    
    // Check for common frameworks and libraries
    const techPatterns = [
      { name: 'React', pattern: /react/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Angular', pattern: /angular/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
      { name: 'Vue.js', pattern: /vue\.js|vuejs/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { name: 'jQuery', pattern: /jquery/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg' },
      { name: 'Bootstrap', pattern: /bootstrap/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg' },
      { name: 'WordPress', pattern: /wp-content|wordpress/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg' },
      { name: 'Next.js', pattern: /next\.js|nextjs/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'Nuxt.js', pattern: /nuxt\.js|nuxtjs/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg' },
      { name: 'Tailwind CSS', pattern: /tailwindcss|tailwind/i, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg' },
      { name: 'Shopify', pattern: /shopify/i, icon: null },
      { name: 'Magento', pattern: /magento/i, icon: null },
      { name: 'Drupal', pattern: /drupal/i, icon: null }
    ];
    
    // Check content for technology patterns
    for (const tech of techPatterns) {
      if (tech.pattern.test(content)) {
        technologies.push({
          name: tech.name,
          icon: tech.icon
        });
      }
    }
    
    // Check headers for server information
    if (headers.server) {
      const server = headers.server.toLowerCase();
      if (server.includes('nginx')) {
        technologies.push({
          name: 'Nginx',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg'
        });
      } else if (server.includes('apache')) {
        technologies.push({
          name: 'Apache',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg'
        });
      }
    }
    
    // Check for Content Management Systems
    if (headers['x-powered-by']) {
      const poweredBy = headers['x-powered-by'].toLowerCase();
      if (poweredBy.includes('php')) {
        technologies.push({
          name: 'PHP',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg'
        });
      } else if (poweredBy.includes('express')) {
        technologies.push({
          name: 'Express.js',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg'
        });
      }
    }
    
    // Only add basic web technologies if they're detected in the content
    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      technologies.push({
        name: 'HTML5',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
      });
    }
    
    if (content.includes('<style') || content.includes('.css') || content.match(/<link[^>]*\.css["'][^>]*>/i)) {
      technologies.push({
        name: 'CSS3',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
      });
    }
    
    if (content.includes('<script') || content.includes('.js') || content.match(/<script[^>]*\.js["'][^>]*>/i)) {
      technologies.push({
        name: 'JavaScript',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
      });
    }
    
    return technologies;
  }
}