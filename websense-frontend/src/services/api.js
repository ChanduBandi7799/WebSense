const API_URL = 'http://localhost:3001';

export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard`);
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
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching hello:', error);
    throw error;
  }
};

export const analyzeWebsite = async (url) => {
  try {
    const response = await fetch(`${API_URL}/website-analysis/analyze`, {
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
    console.error('Error analyzing website:', error);
    throw error;
  }
};

export const analyzeWebsiteWithPageSpeed = async (url, apiKey = null) => {
  try {
    const response = await fetch(`${API_URL}/website-analysis/analyze-pagespeed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, apiKey }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing website with PageSpeed:', error);
    throw error;
  }
};

export const analyzeSecurity = async (url) => {
  try {
    const response = await fetch(`${API_URL}/website-analysis/analyze-security`, {
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
    console.error('Error analyzing website security:', error);
    throw error;
  }
};

export const analyzeSEO = async (url) => {
  try {
    const response = await fetch(`${API_URL}/website-analysis/analyze-seo`, {
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
    console.error('Error analyzing website SEO:', error);
    throw error;
  }
};

export const analyzeTechStack = async (url) => {
  try {
    const response = await fetch(`${API_URL}/website-analysis/analyze-tech-stack`, {
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
    console.error('Error analyzing website tech stack:', error);
    throw error;
  }
};