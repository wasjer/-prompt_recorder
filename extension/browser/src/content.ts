import { CONFIG } from './config';
import { sendPrompt } from './apiClient';

// Track the last recorded content to avoid duplicates
let lastRecordedContent = '';
let lastRecordedTime = 0;
let debounceTimer: number | null = null;
// Store current input content in real-time
let currentInputContent = '';
let inputContentTimer: number | null = null;

// Detect which AI platform we're on
function detectPlatform(): string | null {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) {
    return 'ChatGPT';
  } else if (hostname.includes('claude.ai')) {
    return 'Claude';
  } else if (hostname.includes('gemini.google.com')) {
    return 'Gemini';
  } else if (hostname.includes('perplexity.ai')) {
    return 'Perplexity';
  } else if (hostname.includes('tongyi.aliyun.com') || hostname.includes('qianwen.aliyun.com')) {
    return 'Qwen';
  } else if (hostname.includes('doubao.com')) {
    return 'Doubao';
  }

  return null;
}

// Get input element based on platform
function findInputElement(): HTMLElement | null {
  const platform = detectPlatform();
  if (!platform) return null;

  console.log(`Prompt Recorder: Searching for input element on ${platform}...`);

  // Try multiple strategies to find input element
  const strategies = [
    // Strategy 1: Try platform-specific selectors
    () => {
      const platformConfig = CONFIG.AI_PLATFORMS.find(p => p.name === platform);
      if (platformConfig) {
        try {
          const element = document.querySelector(platformConfig.selectors.input) as HTMLElement;
          if (element) {
            console.log('Prompt Recorder: Found via platform-specific selector:', platformConfig.selectors.input);
            return element;
          }
        } catch (e) {
          console.warn('Prompt Recorder: Invalid selector:', platformConfig.selectors.input);
        }
      }
      return null;
    },
    // Strategy 2: ChatGPT specific patterns - prioritize contenteditable div
    () => {
      if (platform === 'ChatGPT') {
        // ChatGPT uses contenteditable div with id="prompt-textarea"
        const contentEditable = document.querySelector('#prompt-textarea[contenteditable="true"]') as HTMLElement;
        if (contentEditable) {
          const rect = contentEditable.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            console.log('Prompt Recorder: Found ChatGPT contenteditable input (id=prompt-textarea)');
            return contentEditable;
          }
        }
        
        // Fallback: Try various ChatGPT selectors
        const selectors = [
          'textarea[placeholder*="Message"]',
          'textarea[placeholder*="message"]',
          'textarea[placeholder*="Send a message"]',
          'textarea[id*="prompt"]',
          'textarea[data-id="root"]',
          'textarea',
        ];
        for (const selector of selectors) {
          const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 20 && rect.top > 0) {
              console.log('Prompt Recorder: Found ChatGPT input via selector:', selector);
              return el;
            }
          }
        }
      }
      return null;
    },
    // Strategy 3: Gemini specific patterns
    () => {
      if (platform === 'Gemini') {
        const selectors = [
          'textarea[aria-label*="prompt"]',
          'textarea[aria-label*="message"]',
          'textarea[aria-label*="Enter"]',
          'textarea[placeholder*="prompt"]',
          'textarea',
        ];
        for (const selector of selectors) {
          const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 20 && rect.top > 0) {
              console.log('Prompt Recorder: Found Gemini input via selector:', selector);
              return el;
            }
          }
        }
      }
      return null;
    },
    // Strategy 3.5: Qwen (千问) specific patterns
    () => {
      if (platform === 'Qwen') {
        const selectors = [
          'textarea[placeholder*="输入"]',
          'textarea[placeholder*="请输入"]',
          'textarea[placeholder*="说点什么"]',
          'div[contenteditable="true"]',
          'textarea',
        ];
        for (const selector of selectors) {
          const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 20 && rect.top > 0) {
              console.log('Prompt Recorder: Found Qwen input via selector:', selector);
              return el;
            }
          }
        }
      }
      return null;
    },
    // Strategy 3.6: Doubao (豆包) specific patterns
    () => {
      if (platform === 'Doubao') {
        const selectors = [
          'textarea[placeholder*="输入"]',
          'textarea[placeholder*="请输入"]',
          'textarea[placeholder*="说点什么"]',
          'div[contenteditable="true"]',
          'textarea',
        ];
        for (const selector of selectors) {
          const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 20 && rect.top > 0) {
              console.log('Prompt Recorder: Found Doubao input via selector:', selector);
              return el;
            }
          }
        }
      }
      return null;
    },
    // Strategy 4: Find all textareas and contenteditable divs (generic)
    () => {
      // Try textareas first
      const textareas = Array.from(document.querySelectorAll('textarea'));
      console.log(`Prompt Recorder: Found ${textareas.length} textareas`);
      for (const textarea of textareas) {
        const rect = textarea.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isLarge = rect.width > 100 && rect.height > 20;
        const isInViewport = rect.top >= 0 && rect.top < window.innerHeight;
        
        console.log('Prompt Recorder: Textarea check:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          isVisible,
          isLarge,
          isInViewport,
          placeholder: (textarea as HTMLTextAreaElement).placeholder
        });
        
        if (isVisible && isLarge && isInViewport) {
          console.log('Prompt Recorder: Found textarea input');
          return textarea as HTMLElement;
        }
      }
      
      // Try contenteditable divs
      const contentEditables = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
      console.log(`Prompt Recorder: Found ${contentEditables.length} contenteditable divs`);
      for (const div of contentEditables) {
        const rect = div.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 20 && rect.top > 0) {
          console.log('Prompt Recorder: Found contenteditable input');
          return div as HTMLElement;
        }
      }
      return null;
    },
    // Strategy 5: Find by common patterns (last resort)
    () => {
      // Generic large textarea
      const allTextareas = Array.from(document.querySelectorAll('textarea'));
      const largeTextarea = allTextareas.find(ta => {
        const rect = ta.getBoundingClientRect();
        return rect.width > 200 && rect.height > 40;
      });
      if (largeTextarea) {
        console.log('Prompt Recorder: Found large textarea');
        return largeTextarea as HTMLElement;
      }
      
      return null;
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    const element = strategies[i]();
    if (element) {
      console.log(`Prompt Recorder: ✅ Found input element using strategy ${i + 1}`, {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        placeholder: (element as HTMLTextAreaElement).placeholder || (element as HTMLElement).getAttribute('aria-label')
      });
      return element;
    }
  }

  console.warn('Prompt Recorder: ❌ Could not find input element after trying all strategies');
  return null;
}

// Extract text content from element
function getTextContent(element: HTMLElement): string {
  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    return (element as HTMLTextAreaElement | HTMLInputElement).value;
  } else if (element.contentEditable === 'true') {
    // For contenteditable divs (like ChatGPT's ProseMirror), try multiple methods
    // ChatGPT uses ProseMirror which may have nested structure
    let text = '';
    
    // Method 1: Try innerText first (handles line breaks better)
    text = element.innerText || '';
    if (text.trim().length > 0) {
      console.log('Prompt Recorder: Extracted text via innerText, length:', text.length);
      return text.trim();
    }
    
    // Method 2: Try textContent
    text = element.textContent || '';
    if (text.trim().length > 0) {
      console.log('Prompt Recorder: Extracted text via textContent, length:', text.length);
      return text.trim();
    }
    
    // Method 3: Try to find text in child nodes (for ProseMirror)
    const textNodes: string[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text) {
        textNodes.push(text);
      }
    }
    if (textNodes.length > 0) {
      text = textNodes.join(' ');
      console.log('Prompt Recorder: Extracted text via TreeWalker, length:', text.length);
      return text.trim();
    }
    
    console.warn('Prompt Recorder: Could not extract text from contenteditable element');
    return '';
  }
  return '';
}

// Record prompt
async function recordPrompt(content: string) {
  if (content.length < CONFIG.MIN_CONTENT_LENGTH) {
    console.log('Prompt Recorder: Content too short, skipping');
    return;
  }

  const trimmedContent = content.trim();
  const now = Date.now();
  
  // Enhanced duplicate detection: same content within 5 seconds is considered duplicate
  if (trimmedContent === lastRecordedContent && (now - lastRecordedTime) < 5000) {
    console.log('Prompt Recorder: Duplicate content detected (same content within 5s), skipping');
    return;
  }

  const platform = detectPlatform();
  console.log('Prompt Recorder: Attempting to record prompt...', {
    platform,
    contentLength: trimmedContent.length,
    preview: trimmedContent.substring(0, 50) + '...'
  });

  // Convert to Beijing time (UTC+8)
  // Create a date object in Beijing timezone
  const beijingDate = new Date(now);
  const beijingTime = new Date(beijingDate.getTime() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00');

  const success = await sendPrompt({
    content: trimmedContent,
    source: 'browser',
    url: window.location.href,
    metadata: {
      platform: platform || 'Unknown',
      userAgent: navigator.userAgent,
      timestamp: beijingTime
    }
  });

  if (success) {
    lastRecordedContent = trimmedContent;
    lastRecordedTime = now;
    console.log('✅ Prompt Recorder: Successfully recorded prompt:', trimmedContent.substring(0, 50) + '...');
  } else {
    console.error('❌ Prompt Recorder: Failed to record prompt. Check if backend is running at http://localhost:3001');
  }
}

// Handle input events - save content in real-time
function handleInput(event: Event) {
  const target = event.target as HTMLElement;
  const inputElement = findInputElement();

  if (!inputElement) {
    return;
  }

  // Check if the event target is within the input element
  const isRelated = inputElement === target || inputElement.contains(target);
  if (!isRelated) {
    return;
  }

  // Immediately extract and save content (before it might be cleared)
  const content = getTextContent(inputElement);
  if (content && content.length > 0) {
    currentInputContent = content;
    console.log('Prompt Recorder: Input captured, length:', content.length, 'preview:', content.substring(0, 30));
    
    // Clear previous timer
    if (inputContentTimer !== null) {
      clearTimeout(inputContentTimer);
      inputContentTimer = null;
    }
    
    // Don't auto-save on input - only save on submit to avoid duplicates
    // The debounce is just for logging, not for saving
  } else {
    // If content is empty, don't update saved content (keep previous)
    console.log('Prompt Recorder: Input event but content is empty, keeping previous saved content');
  }
}

// Handle form submission - use saved content if available
function handleSubmit(event: Event) {
  const platform = detectPlatform();
  console.log('Prompt Recorder: Submit event detected on', platform);
  
  // Try to get content immediately (before it's cleared)
  const inputElement = findInputElement();
  let content = '';
  
  if (inputElement) {
    content = getTextContent(inputElement);
    console.log('Prompt Recorder: Submit - extracted content length:', content.length);
    
    // If we got content, update saved content
    if (content && content.length > 0) {
      currentInputContent = content;
    }
  }
  
  // Use saved content if extraction failed or content is empty
  if (!content || content.length === 0) {
    content = currentInputContent;
    console.log('Prompt Recorder: Submit - using saved content, length:', content.length);
  }
  
  // Don't clear saved content yet - wait until after recording
  
  if (content && content.length >= CONFIG.MIN_CONTENT_LENGTH) {
    console.log('Prompt Recorder: Recording prompt on submit, length:', content.length, 'preview:', content.substring(0, 50));
    recordPrompt(content);
    // Clear saved content after successful recording
    currentInputContent = '';
  } else {
    console.warn('Prompt Recorder: No valid content to record on submit', {
      extractedLength: content.length,
      savedLength: currentInputContent.length,
      minLength: CONFIG.MIN_CONTENT_LENGTH
    });
  }
}

// Initialize content script
function init() {
  const platform = detectPlatform();
  if (!platform) {
    console.log('Prompt Recorder: Not on a supported AI platform');
    return;
  }

  console.log(`Prompt Recorder: Monitoring ${platform}`);

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupListeners);
  } else {
    setupListeners();
  }
}

function setupListeners() {
  console.log('Prompt Recorder: Setting up listeners...');
  
  // Find and mark input element
  const inputElement = findInputElement();
  if (inputElement) {
    inputElement.setAttribute('data-prompt-recorder', 'true');
    console.log('Prompt Recorder: Input element found and marked', {
      tagName: inputElement.tagName,
      id: inputElement.id,
      className: inputElement.className
    });
    
    // Directly attach listener to the input element
    inputElement.addEventListener('input', handleInput, true);
    inputElement.addEventListener('keyup', handleInput, true);
    console.log('Prompt Recorder: Direct listeners attached to input element');
  } else {
    console.warn('Prompt Recorder: Input element not found initially, will retry...');
  }

  // Also listen at document level (capture phase)
  document.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    const inputElement = findInputElement();
    if (inputElement && (inputElement === target || inputElement.contains(target))) {
      console.log('Prompt Recorder: Document-level input event detected', {
        targetTag: target.tagName,
        targetId: target.id
      });
      handleInput(e);
    }
  }, true);

  // Listen for Enter key - capture immediately
  document.addEventListener('keydown', (e) => {
    // Capture Enter key (but not Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const inputElement = findInputElement();
      if (inputElement && (inputElement === e.target || inputElement.contains(e.target as Node))) {
        console.log('Prompt Recorder: Enter key pressed in input element - capturing immediately');
        // Capture immediately, don't wait
        handleSubmit(e);
      }
    }
  }, true); // Use capture phase

  // Use MutationObserver to handle dynamically loaded content
  // Throttle to avoid excessive calls
  let observerTimer: number | null = null;
  const observer = new MutationObserver(() => {
    // Throttle observer callbacks
    if (observerTimer !== null) {
      return;
    }
    
    observerTimer = window.setTimeout(() => {
      observerTimer = null;
      // Re-check for input elements periodically
      const inputElement = findInputElement();
      if (inputElement && !inputElement.hasAttribute('data-prompt-recorder')) {
        inputElement.setAttribute('data-prompt-recorder', 'true');
        console.log('Prompt Recorder: New input element detected and marked', inputElement);
        inputElement.addEventListener('input', handleInput, true);
        inputElement.addEventListener('keyup', handleInput, true);
      }
    }, 500); // Throttle to once per 500ms
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also check for submit buttons - ChatGPT specific
  // Capture BEFORE the click event propagates (capture phase)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const platform = detectPlatform();
    
    // ChatGPT specific: check for send button
    if (platform === 'ChatGPT') {
      // ChatGPT send button has data-testid="send-button"
      const button = target.closest('button[data-testid*="send"]') || 
                     target.closest('button') || 
                     (target.tagName === 'BUTTON' ? target : null);
      
      if (button) {
        const buttonDataTestId = button.getAttribute('data-testid') || '';
        const buttonAriaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        const hasSvg = button.querySelector('svg') !== null;
        
        // ChatGPT send button detection
        const isSendButton = 
          buttonDataTestId.includes('send') ||
          buttonDataTestId === 'send-button' ||
          (hasSvg && buttonDataTestId !== '') ||
          buttonAriaLabel.includes('send');
        
        if (isSendButton) {
          console.log('Prompt Recorder: ChatGPT send button clicked', {
            buttonDataTestId,
            buttonAriaLabel,
            hasSvg,
            savedContentLength: currentInputContent.length
          });
          // Capture immediately
          handleSubmit(e);
          return;
        }
      }
    }
    
    // Generic button detection for other platforms
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      const button = target.closest('button') || target as HTMLButtonElement;
      const buttonText = button.textContent?.toLowerCase() || '';
      const buttonAriaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
      const buttonDataTestId = button.getAttribute('data-testid') || '';
      
      const isSendButton = 
        buttonDataTestId.includes('send') ||
        buttonText.includes('send') || 
        buttonText.includes('submit') || 
        buttonAriaLabel.includes('send') ||
        buttonAriaLabel.includes('submit');
      
      if (isSendButton) {
        console.log('Prompt Recorder: Send button clicked', {
          buttonText,
          buttonAriaLabel,
          buttonDataTestId,
          savedContentLength: currentInputContent.length
        });
        handleSubmit(e);
      }
    }
  }, true); // Use capture phase to intercept before default behavior

  console.log('Prompt Recorder: Listeners set up successfully');
}

// Start initialization immediately
console.log('Prompt Recorder: Content script loaded');
init();

// Also try to initialize after delays in case page loads slowly
// Some AI platforms use dynamic loading
const retryDelays = [2000, 5000, 10000];
retryDelays.forEach((delay, index) => {
  setTimeout(() => {
    console.log(`Prompt Recorder: Retry ${index + 1} - Checking for input element after ${delay}ms`);
    const platform = detectPlatform();
    if (platform) {
      const inputElement = findInputElement();
      if (inputElement) {
        console.log('Prompt Recorder: ✅ Input element found on retry', inputElement);
        // Re-setup listeners if element was found
        if (!inputElement.hasAttribute('data-prompt-recorder')) {
          inputElement.setAttribute('data-prompt-recorder', 'true');
          inputElement.addEventListener('input', handleInput);
          console.log('Prompt Recorder: Re-attached listeners to newly found input');
        }
      } else {
        console.warn(`Prompt Recorder: ⚠️ Input element not found on retry ${index + 1}`);
      }
    }
  }, delay);
});
