import React, { useState } from 'react';
import { Prompt, promptApi } from '../api/client';
import { format } from 'date-fns';

interface PromptDetailProps {
  prompt: Prompt;
  onClose: () => void;
  onUpdate: () => void;
}

export const PromptDetail: React.FC<PromptDetailProps> = ({ prompt, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState(prompt.tags || '');
  const [category, setCategory] = useState(prompt.category || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await promptApi.updatePrompt(prompt.id!, {
        tags,
        category
      });
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update prompt:', error);
      alert('Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      await promptApi.deletePrompt(prompt.id!);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert('Failed to delete prompt');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Prompt Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {prompt.content}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg capitalize">
                  {prompt.source}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  {prompt.timestamp ? format(new Date(prompt.timestamp), 'PPpp') : 'N/A'}
                </div>
              </div>
            </div>

            {prompt.url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL/File</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm break-all">
                  {prompt.url}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              {editing ? (
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  {tags || <span className="text-gray-400">No tags</span>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              {editing ? (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  {category || <span className="text-gray-400">No category</span>}
                </div>
              )}
            </div>

            {prompt.metadata && Object.keys(prompt.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metadata</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(prompt.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setTags(prompt.tags || '');
                    setCategory(prompt.category || '');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
