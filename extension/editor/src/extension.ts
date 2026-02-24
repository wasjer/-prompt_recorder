import * as vscode from 'vscode';
import { ApiClient } from './apiClient';
import { PromptRecorder } from './promptRecorder';

let promptRecorder: PromptRecorder;
let apiClient: ApiClient;

export function activate(context: vscode.ExtensionContext) {
  console.log('Prompt Recorder extension is now active');

  // Initialize API client
  apiClient = new ApiClient();

  // Initialize prompt recorder
  promptRecorder = new PromptRecorder(apiClient);

  // Setup auto-recording
  promptRecorder.setupAutoRecording(context);

  // Register commands
  const recordCommand = vscode.commands.registerCommand(
    'promptRecorder.recordPrompt',
    async () => {
      await promptRecorder.recordPromptManually();
    }
  );

  const openDashboardCommand = vscode.commands.registerCommand(
    'promptRecorder.openDashboard',
    async () => {
      const config = vscode.workspace.getConfiguration('promptRecorder');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3001/api/prompts');
      const dashboardUrl = apiUrl.replace('/api/prompts', '');
      
      vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
    }
  );

  context.subscriptions.push(recordCommand, openDashboardCommand);

  // Check backend health on startup
  checkBackendHealth();

  // Listen for configuration changes
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('promptRecorder')) {
      apiClient = new ApiClient();
      promptRecorder = new PromptRecorder(apiClient);
      promptRecorder.setupAutoRecording(context);
    }
  });

  // Show status message
  vscode.window.showInformationMessage('Prompt Recorder is active. Use "Record Prompt" command to manually record prompts.');
}

async function checkBackendHealth() {
  const isHealthy = await apiClient.checkHealth();
  if (!isHealthy) {
    vscode.window.showWarningMessage(
      'Prompt Recorder: Backend not connected. Make sure the backend service is running on http://localhost:3001',
      'Open Settings'
    ).then(selection => {
      if (selection === 'Open Settings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'promptRecorder');
      }
    });
  }
}

export function deactivate() {
  // Cleanup if needed
}
