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
