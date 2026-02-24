import React, { useState, useEffect } from 'react';
import { Prompt, promptApi, PromptQuery } from '../api/client';
import { PromptDetail } from './PromptDetail';
import { format } from 'date-fns';
import { FilterState } from './SearchBar';

interface PromptListProps {
  searchQuery: string;
  filters: FilterState;
  sortBy: 'timestamp' | 'id';
  sortOrder: 'asc' | 'desc';
}

export const PromptList: React.FC<PromptListProps> = ({ searchQuery, filters, sortBy, sortOrder }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadPrompts();
  }, [searchQuery, filters, sortBy, sortOrder, page]);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const query: PromptQuery = {
        search: searchQuery || undefined,
        source: filters.source,
        tags: filters.tags,
        category: filters.category,
        startDate: filters.startDate,
        endDate: filters.endDate,
        llm: filters.llm,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sortBy,
        sortOrder
      };

      const response = await promptApi.getPrompts(query);
      setPrompts(response.prompts);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sourceColors: Record<string, string> = {
    browser: 'bg-blue-100 text-blue-800',
    cursor: 'bg-purple-100 text-purple-800',
    vscode: 'bg-green-100 text-green-800',
    manual: 'bg-gray-100 text-gray-800'
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && prompts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p>Loading prompts...</p>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No prompts found. Start using AI platforms to record prompts!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {prompt.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${sourceColors[prompt.source] || 'bg-gray-100 text-gray-800'}`}>
                      {prompt.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prompt.tags || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prompt.timestamp ? format(new Date(prompt.timestamp), 'MMM d, yyyy HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedPrompt(prompt)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} prompts
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedPrompt && (
        <PromptDetail
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onUpdate={loadPrompts}
        />
      )}
    </>
  );
};
