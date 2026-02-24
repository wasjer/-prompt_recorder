// Simple bundler to combine all JS files into one for browser extension
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const outputFile = path.join(distDir, 'content.bundle.js');

// Read source files
const configCode = fs.readFileSync(path.join(distDir, 'config.js'), 'utf8');
const apiClientCode = fs.readFileSync(path.join(distDir, 'apiClient.js'), 'utf8');
const contentCode = fs.readFileSync(path.join(distDir, 'content.js'), 'utf8');

let bundledCode = `// Prompt Recorder - Bundled Content Script
(function() {
'use strict';

// === CONFIG ===
const CONFIG = {
    API_URL: 'http://localhost:3001/api/prompts',
    AI_PLATFORMS: [
        {
            name: 'ChatGPT',
            urlPatterns: ['*://chat.openai.com/*', '*://chatgpt.com/*'],
            selectors: {
                input: 'textarea[data-id="root"]',
                submit: 'button[data-testid="send-button"]'
            }
        },
        {
            name: 'Claude',
            urlPatterns: ['*://claude.ai/*', '*://*.claude.ai/*'],
            selectors: {
                input: 'div[contenteditable="true"]',
                submit: 'button:has-text("Send")'
            }
        },
        {
            name: 'Gemini',
            urlPatterns: ['*://gemini.google.com/*'],
            selectors: {
                input: 'textarea[aria-label*="Enter a prompt"]',
                submit: 'button[aria-label*="Send"]'
            }
        },
        {
            name: 'Perplexity',
            urlPatterns: ['*://www.perplexity.ai/*'],
            selectors: {
                input: 'textarea[placeholder*="Ask anything"]',
                submit: 'button[type="submit"]'
            }
        }
    ],
    DEBOUNCE_DELAY: 1000,
    MIN_CONTENT_LENGTH: 10
};

// === API Client ===
async function sendPrompt(data) {
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

async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:3001/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// === Main Content Script ===
`;

// Process content.js - remove all module-related code
let mainCode = contentCode
  // Remove module system code
  .replace(/^"use strict";\s*/gm, '')
  .replace(/Object\.defineProperty\(exports, "__esModule".*?;\s*/g, '')
  .replace(/const config_1 = require\("\.\/config"\);?\s*/g, '')
  .replace(/const apiClient_1 = require\("\.\/apiClient"\);?\s*/g, '')
  // Replace references
  .replace(/config_1\.CONFIG/g, 'CONFIG')
  .replace(/apiClient_1\.sendPrompt/g, 'sendPrompt')
  .replace(/apiClient_1\.checkBackendHealth/g, 'checkBackendHealth')
  // Fix function calls like (0, sendPrompt) -> sendPrompt
  .replace(/\(0,\s*sendPrompt\)/g, 'sendPrompt')
  .replace(/\(0,\s*checkBackendHealth\)/g, 'checkBackendHealth')
  // Remove exports
  .replace(/exports\.\w+\s*=\s*/g, '')
  // Clean up extra blank lines
  .replace(/\n{3,}/g, '\n\n');

bundledCode += mainCode;
bundledCode += '\n})();\n';

// Write bundled file
fs.writeFileSync(outputFile, bundledCode, 'utf8');
console.log('✅ Bundled content script created: content.bundle.js');
console.log(`   File size: ${bundledCode.length} bytes`);