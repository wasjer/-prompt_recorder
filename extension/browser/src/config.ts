// Configuration for the browser extension
export const CONFIG = {
  // Backend API URL
  API_URL: 'http://localhost:3001/api/prompts',
  
  // AI platforms to monitor
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
    },
    {
      name: 'Qwen',
      urlPatterns: ['*://tongyi.aliyun.com/*', '*://*.tongyi.aliyun.com/*', '*://qianwen.aliyun.com/*'],
      selectors: {
        input: 'textarea[placeholder*="输入"]',
        submit: 'button[type="submit"]'
      }
    },
    {
      name: 'Doubao',
      urlPatterns: ['*://www.doubao.com/*', '*://*.doubao.com/*'],
      selectors: {
        input: 'textarea[placeholder*="输入"]',
        submit: 'button[type="submit"]'
      }
    }
  ],
  
  // Debounce delay for input capture (ms)
  DEBOUNCE_DELAY: 1000,
  
  // Minimum content length to record
  MIN_CONTENT_LENGTH: 3
};
