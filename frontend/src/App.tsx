import { useState } from 'react';
import { SearchBar, FilterState } from './components/SearchBar';
import { PromptList } from './components/PromptList';
import { Stats } from './components/Stats';
import { promptApi } from './api/client';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<'timestamp' | 'id'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showStats, setShowStats] = useState(true);

  const handleExport = async (format: 'csv' | 'json', useFilters: boolean = false) => {
    try {
      // Build query from current filters and search
      const query = useFilters ? {
        search: searchQuery || undefined,
        source: filters.source,
        tags: filters.tags,
        category: filters.category,
        startDate: filters.startDate,
        endDate: filters.endDate,
        llm: filters.llm,
        sortBy,
        sortOrder
      } : undefined;

      const blob = format === 'csv' 
        ? await promptApi.exportCSV(query)
        : await promptApi.exportJSON(query);
      
      // Generate filename with filters info
      let filename = 'prompts';
      if (useFilters) {
        const filterParts: string[] = [];
        if (searchQuery) filterParts.push('search');
        if (filters.source) filterParts.push(filters.source);
        if (filters.startDate || filters.endDate) filterParts.push('date');
        if (filterParts.length > 0) {
          filename += `_${filterParts.join('_')}`;
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export prompts');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Prompt Recorder</h1>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {showStats ? 'Hide' : 'Show'} Stats
              </button>
              <div className="flex gap-2 border-l border-gray-300 pl-2">
                <span className="px-2 py-2 text-sm text-gray-600 self-center">Export:</span>
                <button
                  onClick={() => handleExport('csv', false)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  title="Export all prompts"
                >
                  All CSV
                </button>
                <button
                  onClick={() => handleExport('json', false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  title="Export all prompts"
                >
                  All JSON
                </button>
                <button
                  onClick={() => handleExport('csv', true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 border-2 border-green-700"
                  title="Export with current filters"
                >
                  Filtered CSV
                </button>
                <button
                  onClick={() => handleExport('json', true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border-2 border-blue-700"
                  title="Export with current filters"
                >
                  Filtered JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showStats && <Stats />}
        
        <div className="mb-4 flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'id')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="timestamp">Timestamp</option>
            <option value="id">ID</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          filters={filters}
        />

        <PromptList
          searchQuery={searchQuery}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </main>
    </div>
  );
}

export default App;
