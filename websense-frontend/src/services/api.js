const API_URL = 'http://localhost:3001';

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
    const response = await fetch(`${API_URL}/api/analyze/lighthouse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing website with Lighthouse:', error);
    throw error;
  }
};

// PageSpeed Insights analysis - Updated to match new endpoint
export const analyzeWebsiteWithPageSpeed = async (url) => {
  try {
    console.log('Starting PSI analysis for:', url);
    
    const response = await fetch(`${API_URL}/api/analyze/pagespeed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API key error. Please try again later');
      }
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    console.log('PSI analysis result:', result);
    
    return result;
  } catch (error) {
    console.error('Error analyzing website with PageSpeed:', error);
    throw error;
  }
};

// Test website accessibility
export const testWebsiteAccessibility = async (url) => {
  try {
    console.log('Testing website accessibility for:', url);
    
    const response = await fetch(`${API_URL}/api/analyze/test-website/${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    console.log('Website accessibility test result:', result);
    
    return result;
  } catch (error) {
    console.error('Error testing website accessibility:', error);
    throw error;
  }
};

// Tech Stack Analysis using Wappalyzer
export const analyzeTechStack = async (url) => {
  try {
    console.log('Starting tech stack analysis for:', url);
    
    const response = await fetch(`${API_URL}/api/analyze/tech-stack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    console.log('Tech stack analysis result:', result);
    
    return result;
  } catch (error) {
    console.error('Error analyzing tech stack:', error);
    throw error;
  }
};