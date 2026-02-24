import axios from 'axios';
import * as vscode from 'vscode';

export interface PromptData {
  content: string;
  source: 'cursor' | 'vscode';
  url?: string;
  metadata?: {
    workspace?: string;
    file?: string;
    language?: string;
    timestamp?: string;
  };
}

export class ApiClient {
  private apiUrl: string;

  constructor() {
    const config = vscode.workspace.getConfiguration('promptRecorder');
    this.apiUrl = config.get<string>('apiUrl', 'http://localhost:3001/api/prompts');
  }

  async sendPrompt(data: PromptData): Promise<boolean> {
    try {
      const response = await axios.post(this.apiUrl, data, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.status === 201;
    } catch (error) {
      console.error('Failed to send prompt:', error);
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const healthUrl = this.apiUrl.replace('/api/prompts', '/health');
      const response = await axios.get(healthUrl, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
