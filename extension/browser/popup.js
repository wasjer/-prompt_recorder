// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const openBtn = document.getElementById('openDashboard');

  // Check backend health
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      statusDiv.textContent = '✅ Connected';
      statusDiv.className = 'status connected';
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    statusDiv.textContent = '❌ Backend not connected';
    statusDiv.className = 'status disconnected';
  }

  // Open dashboard
  openBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3001' });
  });
});
