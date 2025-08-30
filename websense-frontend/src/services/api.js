const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}/api/dashboard`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const fetchHello = async () => {
  try {
    const response = await fetch(`${API_URL}/api`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching hello:', error);
    throw error;
  }
};

// Lighthouse analysis - Updated to match new endpoint
export const analyzeWebsite = async (url) => {
  try {
    console.log(`Analyzing website: ${url}`);
    const response = await fetch(`${API_URL}/api/analyze/lighthouse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else if (response.status === 404) {
        throw new Error('API endpoint not found. The server may be misconfigured.');
      } else if (response.status === 400) {
        throw new Error('Invalid URL format. Please enter a valid website URL.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. The analysis service is currently unavailable.');
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Lighthouse analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing website with Lighthouse:', error);
    throw error;
  }
};

// Privacy & Tracking Analysis
export const analyzePrivacyTracking = async (url) => {
  try {
    console.log(`Analyzing privacy and tracking for: ${url}`);
    
    const response = await fetch(`${API_URL}/api/analyze/privacy-tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else if (response.status === 404) {
        throw new Error('Privacy tracking API endpoint not found. The server may be misconfigured.');
      } else if (response.status === 400) {
        throw new Error('Invalid URL format. Please enter a valid website URL.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. The privacy tracking analysis service is currently unavailable.');
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Privacy tracking analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing privacy and tracking:', error);
    throw error;
  }
};

// Test website accessibility
export const testWebsiteAccessibility = async (url) => {
  try {
    console.log(`Testing accessibility for: ${url}`);
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${API_URL}/api/analyze/test-website/${encodedUrl}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else if (response.status === 404) {
        throw new Error('Accessibility testing API endpoint not found. The server may be misconfigured.');
      } else if (response.status === 400) {
        throw new Error('Invalid URL format. Please enter a valid website URL.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. The accessibility testing service is currently unavailable.');
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Accessibility test complete:', data);
    return data;
  } catch (error) {
    console.error('Error testing website accessibility:', error);
    throw error;
  }
};

// Tech Stack Analysis using Wappalyzer
export const analyzeTechStack = async (url) => {
  try {
    console.log('Analyzing tech stack for:', url);
    
    const response = await fetch(`${API_URL}/api/analyze/tech-stack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else if (response.status === 404) {
        throw new Error('Tech stack API endpoint not found. The server may be misconfigured.');
      } else if (response.status === 400) {
        throw new Error('Invalid URL format. Please enter a valid website URL.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. The tech stack analysis service is currently unavailable.');
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Tech stack analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing tech stack:', error);
    throw error;
  }
};

// Security Headers Analysis
export const analyzeSecurityHeaders = async (url) => {
  try {
    console.log('Analyzing security headers for:', url);
    
    const response = await fetch(`${API_URL}/api/analyze/security-headers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else if (response.status === 404) {
        throw new Error('Security headers API endpoint not found. The server may be misconfigured.');
      } else if (response.status === 400) {
        throw new Error('Invalid URL format. Please enter a valid website URL.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. The security headers analysis service is currently unavailable.');
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Security headers analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing security headers:', error);
    throw error;
  }
};

// Mobile-Friendly Test Analysis
export const analyzeMobileFriendly = async (url) => {
  try {
    console.log('Analyzing mobile-friendliness for:', url);
    
    const response = await fetch(`${API_URL}/api/analyze/mobile-friendly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else if (response.status === 404) {
        throw new Error('Mobile-friendly API endpoint not found. The server may be misconfigured.');
      } else if (response.status === 400) {
        throw new Error('Invalid URL format. Please enter a valid website URL.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. The mobile-friendly analysis service is currently unavailable.');
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log('Mobile-friendly analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing mobile-friendliness:', error);
    throw error;
  }
};