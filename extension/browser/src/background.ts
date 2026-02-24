// Background service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompt Recorder extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_BACKEND') {
    fetch('http://localhost:3001/health')
      .then(response => response.ok)
      .then(isHealthy => sendResponse({ healthy: isHealthy }))
      .catch(() => sendResponse({ healthy: false }));
    return true; // Keep channel open for async response
  }
});
