import * as vscode from 'vscode';
import { ApiClient, PromptData } from './apiClient';

export class PromptRecorder {
  private apiClient: ApiClient;
  private lastRecordedContent: string = '';
  private autoRecord: boolean = true;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.updateConfig();
  }

  private updateConfig() {
    const config = vscode.workspace.getConfiguration('promptRecorder');
    this.autoRecord = config.get<boolean>('autoRecord', true);
  }

  async recordPrompt(content: string, source: 'cursor' | 'vscode' = 'vscode'): Promise<boolean> {
    if (!content || content.trim().length < 3) {
      return false;
    }

    // Avoid duplicates
    if (content.trim() === this.lastRecordedContent) {
      return false;
    }

    const activeEditor = vscode.window.activeTextEditor;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    const promptData: PromptData = {
      content: content.trim(),
      source: source,
      url: activeEditor?.document.uri.fsPath,
      metadata: {
        workspace: workspaceFolder?.name,
        file: activeEditor?.document.fileName,
        language: activeEditor?.document.languageId,
        timestamp: new Date().toISOString()
      }
    };

    const success = await this.apiClient.sendPrompt(promptData);
    
    if (success) {
      this.lastRecordedContent = content.trim();
      return true;
    }

    return false;
  }

  async recordPromptManually(): Promise<void> {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter the prompt to record',
      placeHolder: 'Type or paste your prompt here...',
      ignoreFocusOut: true
    });

    if (!input) {
      return;
    }

    const source = vscode.env.appName.toLowerCase().includes('cursor') ? 'cursor' : 'vscode';
    const success = await this.recordPrompt(input, source);

    if (success) {
      vscode.window.showInformationMessage('✅ Prompt recorded successfully');
    } else {
      vscode.window.showErrorMessage('❌ Failed to record prompt. Check if backend is running.');
    }
  }

  // Try to intercept AI chat commands
  // Note: This is a best-effort approach as Cursor/VSCode AI features may not expose direct APIs
  setupAutoRecording(context: vscode.ExtensionContext) {
    if (!this.autoRecord) {
      return;
    }

    // Note: VSCode API doesn't provide direct access to command execution events
    // The auto-recording feature is limited. Users should use the manual record command.
    // We can listen for text selection changes as a fallback
    const selectionListener = vscode.window.onDidChangeTextEditorSelection(async (e) => {
      // This is a fallback - we can't directly intercept AI chat input
      // Users can manually record using the command
      // In the future, we might be able to use workspace text document changes
    });

    context.subscriptions.push(selectionListener);

    // Show notification about manual recording
    vscode.window.showInformationMessage(
      'Prompt Recorder: Use "Record Prompt" command to manually record prompts. Auto-recording is limited due to VSCode API restrictions.',
      'Got it'
    );
  }

  getAutoRecord(): boolean {
    return this.autoRecord;
  }

  setAutoRecord(enabled: boolean) {
    this.autoRecord = enabled;
  }
}
