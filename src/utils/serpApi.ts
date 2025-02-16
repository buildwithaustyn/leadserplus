const SERPAPI_BASE_URL = 'https://serpapi.com/search';

export const googleSearch = async (query: string) => {
  try {
    const params = new URLSearchParams({
      api_key: process.env.SERPAPI_KEY || '',
      engine: 'google',
      q: query,
      google_domain: 'google.com',
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Search failed');
    }
    
    return data;
  } catch (error) {
    console.error('SerpAPI Error:', error);
    throw error;
  }
}; 