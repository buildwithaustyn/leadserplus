'use client';

import { useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookmark as farBookmark,
  faFileExport,
  faFilter,
  faSort,
  faLightbulb,
  faMagicWandSparkles,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as fasBookmark } from '@fortawesome/free-regular-svg-icons';
import BulkUploader from '@/components/BulkUploader';
import BatchProgress, { BatchStatus } from '@/components/BatchProgress';
import LeadInsights from '@/components/LeadInsights';
import { BatchProcessor } from '@/utils/batchProcessor';

interface SearchResult {
  id?: string;
  savedAt?: string;
  title: string;
  link: string;
  snippet: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  industry?: string;
  revenue?: string;
  employees?: string;
  source?: string;
}

type SortField = 'title' | 'email' | 'phone' | 'savedAt';
type SortOrder = 'asc' | 'desc';

interface FilterOptions {
  hasEmail: boolean;
  hasPhone: boolean;
  saved: boolean;
}

export default function LeadScraperPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');
  const [batchStatus, setBatchStatus] = useState<BatchStatus>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0
  });
  const [sortConfig, setSortConfig] = useState<{field: SortField; order: SortOrder}>({
    field: 'title',
    order: 'asc'
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    hasEmail: false,
    hasPhone: false,
    saved: false
  });
  const [batchProcessor, setBatchProcessor] = useState<BatchProcessor | null>(null);

  // Helper functions to extract additional information
  const extractCompany = (title: string, snippet: string) => {
    // Try to extract company name from title first
    const titleMatch = title.match(/^([^-|]*)(?:[-|]|$)/);
    if (titleMatch && titleMatch[1].trim()) {
      return titleMatch[1].trim();
    }
    
    // Look for common company indicators in snippet
    const companyIndicators = ['Inc.', 'LLC', 'Ltd.', 'Corporation', 'Corp.', 'Company'];
    for (const indicator of companyIndicators) {
      const match = snippet.match(new RegExp(`([\\w\\s&]+)\\s*${indicator}`));
      if (match) {
        return `${match[1].trim()} ${indicator}`;
      }
    }
    return '';
  };

  const extractLocation = (snippet: string) => {
    // Look for city, state patterns
    const locationPattern = /(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s+[A-Z]{2})/;
    const match = snippet.match(locationPattern);
    return match ? match[1] : '';
  };

  const extractIndustry = (snippet: string) => {
    const industries = [
      'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Manufacturing',
      'Retail', 'Education', 'Construction', 'Automotive', 'Energy'
    ];
    
    for (const industry of industries) {
      if (snippet.includes(industry)) {
        return industry;
      }
    }
    return '';
  };

  const extractRevenue = (snippet: string) => {
    const revenuePattern = /(?:revenue|sales) of \$(\d+(?:\.\d+)?(?:K|M|B)?)/i;
    const match = snippet.match(revenuePattern);
    return match ? match[1] : '';
  };

  const extractEmployees = (snippet: string) => {
    const employeePattern = /(\d+(?:[,-]\d+)?\+?\s*(?:employees|staff|people))/i;
    const match = snippet.match(employeePattern);
    return match ? match[1] : '';
  };

  useEffect(() => {
    const processor = new BatchProcessor({
      rateLimit: 30,
      maxConcurrent: 3,
      onProgress: setBatchStatus
    });
    setBatchProcessor(processor);
    
    return () => {
      processor.stop();
    };
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      const organicResults = data.organic_results || [];
      
      const processedResults = organicResults.map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        email: result.snippet?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || '',
        phone: result.snippet?.match(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0] || '',
        company: extractCompany(result.title, result.snippet),
        location: extractLocation(result.snippet),
        industry: extractIndustry(result.snippet),
        revenue: extractRevenue(result.snippet),
        employees: extractEmployees(result.snippet),
        source: 'single'
      }));

      setResults(prev => [...processedResults, ...prev]);
    } catch (err) {
      setError('Failed to fetch results. Please check your API key and try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, location]);

  const handleBulkUpload = useCallback((queries: { searchQuery: string; location: string }[]) => {
    if (!batchProcessor) return;
    
    batchProcessor.clear();
    batchProcessor.addQueries(queries);
    batchProcessor.start();
  }, [batchProcessor]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Link', 'Email', 'Phone', 'Company', 'Location', 'Industry', 'Revenue', 'Employees', 'Saved Date'].join(','),
      ...results.map(result => [
        `"${result.title.replace(/"/g, '""')}"`,
        result.link,
        result.email || '',
        result.phone || '',
        result.company || '',
        result.location || '',
        result.industry || '',
        result.revenue || '',
        result.employees || '',
        result.savedAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'leads.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredResults = results.filter(result => {
    if (filterOptions.hasEmail && !result.email) return false;
    if (filterOptions.hasPhone && !result.phone) return false;
    if (filterOptions.saved && !result.id) return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const field = sortConfig.field;
    const order = sortConfig.order === 'asc' ? 1 : -1;
    
    if (!a[field] && !b[field]) return 0;
    if (!a[field]) return order;
    if (!b[field]) return -order;
    
    return a[field].localeCompare(b[field]) * order;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 -mx-6 -mt-6 px-6 pt-8 pb-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lead Generation Hub</h1>
            <p className="text-blue-100 max-w-2xl">
              Discover and connect with potential clients using our advanced lead scraping technology. 
              Get instant access to contact information and valuable insights about your target market.
            </p>
          </div>
          {results.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <FontAwesomeIcon icon={faFileExport} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <FontAwesomeIcon icon={faLightbulb} className="text-blue-500 mb-2" />
          <h3 className="font-medium text-blue-800 mb-1">Pro Tip</h3>
          <p className="text-sm text-blue-600">
            Use specific industry keywords and location for better results
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <FontAwesomeIcon icon={faMagicWandSparkles} className="text-purple-500 mb-2" />
          <h3 className="font-medium text-purple-800 mb-1">Bulk Processing</h3>
          <p className="text-sm text-purple-600">
            Upload CSV files to process multiple searches at once
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <FontAwesomeIcon icon={faRocket} className="text-green-500 mb-2" />
          <h3 className="font-medium text-green-800 mb-1">Export & Integrate</h3>
          <p className="text-sm text-green-600">
            Export leads to CSV and integrate with your CRM
          </p>
        </div>
      </div>

      {results.length > 0 && <LeadInsights results={results} />}

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('single')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'single'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Single Search
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bulk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bulk Processing
          </button>
        </nav>
      </div>

      {/* Search Forms */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        {activeTab === 'single' ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Query
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., real estate agents in New York"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, United States"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <BulkUploader
              onUpload={handleBulkUpload}
              isProcessing={batchStatus.inProgress > 0}
            />
            {batchStatus.total > 0 && (
              <BatchProgress
                status={batchStatus}
                onCancel={() => batchProcessor?.stop()}
              />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Search Results</h2>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, hasEmail: !prev.hasEmail }))}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterOptions.hasEmail
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Has Email
                </button>
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, hasPhone: !prev.hasPhone }))}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterOptions.hasPhone
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Has Phone
                </button>
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, saved: !prev.saved }))}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterOptions.saved
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Saved Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center space-x-1"
                      >
                        <span>Title</span>
                        <FontAwesomeIcon 
                          icon={faSort}
                          className={sortConfig.field === 'title' ? 'text-blue-500' : ''}
                        />
                      </button>
                    </th>
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center space-x-1"
                      >
                        <span>Email</span>
                        <FontAwesomeIcon 
                          icon={faSort}
                          className={sortConfig.field === 'email' ? 'text-blue-500' : ''}
                        />
                      </button>
                    </th>
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('phone')}
                        className="flex items-center space-x-1"
                      >
                        <span>Phone</span>
                        <FontAwesomeIcon 
                          icon={faSort}
                          className={sortConfig.field === 'phone' ? 'text-blue-500' : ''}
                        />
                      </button>
                    </th>
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4">
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {result.title}
                        </a>
                      </td>
                      <td className="py-4">
                        {result.email && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {result.email}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {result.phone && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {result.phone}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {result.company}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {result.location}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {result.industry}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/leads', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  title: result.title,
                                  link: result.link,
                                  snippet: result.snippet,
                                  email: result.email,
                                  phone: result.phone,
                                  company: result.company,
                                  location: result.location,
                                  industry: result.industry,
                                  revenue: result.revenue,
                                  employees: result.employees
                                }),
                              });

                              if (!response.ok) {
                                throw new Error('Failed to save lead');
                              }

                              const savedLead = await response.json();
                              setResults(prevResults => 
                                prevResults.map((r, i) => 
                                  i === index ? { ...r, id: savedLead.id, savedAt: savedLead.savedAt } : r
                                )
                              );
                            } catch (err) {
                              console.error('Error saving lead:', err);
                              setError('Failed to save lead');
                            }
                          }}
                          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                            result.id ? 'text-blue-600' : 'text-gray-400'
                          }`}
                          title={result.id ? 'Lead saved' : 'Save lead'}
                        >
                          <FontAwesomeIcon 
                            icon={result.id ? fasBookmark : farBookmark} 
                            className="w-5 h-5"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
