import getGoogleSearch from '@serpapi/google-search';

interface SearchParams {
  searchQuery: string;
  location?: string;
  engine?: string;
  numResults?: number;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  position: number;
}

export async function* streamSearchResults({ searchQuery, location, engine = 'google', numResults = 100 }: SearchParams) {
  const processedResults = new Set<string>();
  
  try {
    const search = new getGoogleSearch({
      api_key: process.env.SERPAPI_KEY,
      q: searchQuery,
      location: location || 'United States',
      google_domain: 'google.com',
      gl: 'us',
      hl: 'en',
      num: 100,
    });

    const response = await search.json();
    const results: SearchResult[] = response.organic_results?.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      source: 'google',
      position: result.position,
    })) || [];

    // Deduplicate results based on URL
    for (const result of results) {
      if (!processedResults.has(result.link)) {
        processedResults.add(result.link);
        yield result;
        
        if (processedResults.size >= numResults) {
          return;
        }
      }
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}

export async function getEnhancedSearchResults(params: SearchParams) {
  const results: SearchResult[] = [];
  for await (const result of streamSearchResults(params)) {
    results.push(result);
  }
  return results;
}
