import { CONFIG } from './config';

export interface PromptData {
  content: string;
  source: 'browser';
  url?: string;
  metadata?: {
    platform?: string;
    userAgent?: string;
    timestamp?: string;
  };
}

export async function sendPrompt(data: PromptData): Promise<boolean> {
  try {
    console.log('Prompt Recorder: Sending prompt to', CONFIG.API_URL);
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prompt Recorder: Failed to send prompt:', response.status, response.statusText, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Prompt Recorder: Prompt sent successfully, ID:', result.id);
    return true;
  } catch (error) {
    console.error('Prompt Recorder: Error sending prompt:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Prompt Recorder: Network error - Is the backend running at http://localhost:3001?');
    }
    return false;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}
