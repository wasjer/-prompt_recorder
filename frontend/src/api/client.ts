import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Prompt {
  id?: number;
  content: string;
  source: 'browser' | 'cursor' | 'vscode' | 'manual';
  url?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
  tags?: string;
  category?: string;
}

export interface CreatePromptDto {
  content: string;
  source: 'browser' | 'cursor' | 'vscode' | 'manual';
  url?: string;
  metadata?: Record<string, any>;
  tags?: string;
  category?: string;
}

export interface UpdatePromptDto {
  content?: string;
  tags?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface PromptQuery {
  search?: string;
  source?: string;
  tags?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  llm?: string; // LLM name (platform) from metadata
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface PromptListResponse {
  prompts: Prompt[];
  total: number;
}

export interface Stats {
  total: number;
  bySource: Array<{ source: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  recent: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const promptApi = {
  // Get all prompts
  getPrompts: async (query: PromptQuery = {}): Promise<PromptListResponse> => {
    const response = await api.get<PromptListResponse>('/prompts', { params: query });
    return response.data;
  },

  // Get a single prompt
  getPrompt: async (id: number): Promise<Prompt> => {
    const response = await api.get<Prompt>(`/prompts/${id}`);
    return response.data;
  },

  // Create a prompt
  createPrompt: async (data: CreatePromptDto): Promise<Prompt> => {
    const response = await api.post<Prompt>('/prompts', data);
    return response.data;
  },

  // Update a prompt
  updatePrompt: async (id: number, data: UpdatePromptDto): Promise<Prompt> => {
    const response = await api.patch<Prompt>(`/prompts/${id}`, data);
    return response.data;
  },

  // Delete a prompt
  deletePrompt: async (id: number): Promise<void> => {
    await api.delete(`/prompts/${id}`);
  },

  // Get statistics
  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/prompts/stats/summary');
    return response.data;
  },

  // Export as CSV with optional filters
  exportCSV: async (query?: PromptQuery): Promise<Blob> => {
    const response = await api.get('/prompts/export/csv', {
      params: query,
      responseType: 'blob'
    });
    return response.data;
  },

  // Export as JSON with optional filters
  exportJSON: async (query?: PromptQuery): Promise<Blob> => {
    const response = await api.get('/prompts/export/json', {
      params: query,
      responseType: 'blob'
    });
    return response.data;
  }
};
