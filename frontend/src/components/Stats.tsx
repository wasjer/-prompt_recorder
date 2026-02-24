import React, { useEffect, useState } from 'react';
import { promptApi, Stats as StatsData } from '../api/client';

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await promptApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const sourceColors: Record<string, string> = {
    browser: 'bg-blue-500',
    cursor: 'bg-purple-500',
    vscode: 'bg-green-500',
    manual: 'bg-gray-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Prompts</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Last 7 Days</div>
          <div className="text-3xl font-bold text-green-600">{stats.recent}</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">By Source</h3>
        <div className="space-y-2">
          {stats.bySource.map((item) => (
            <div key={item.source} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${sourceColors[item.source] || 'bg-gray-500'}`}></div>
              <span className="flex-1 capitalize">{item.source}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.byCategory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">By Category</h3>
          <div className="space-y-2">
            {stats.byCategory.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="flex-1">{item.category}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
