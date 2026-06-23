// Background Service Worker (Manifest V3)

console.log('[Job Intelligence Collector] Background worker initialized.');

// Open dashboard on installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log('[Job Intelligence Collector] Opening dashboard on first install.');
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
  }
});
