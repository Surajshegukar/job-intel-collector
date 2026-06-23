import { LinkedInParser } from '../parsers/LinkedInParser';
import { NaukriParser } from '../parsers/NaukriParser';
import { IndeedParser } from '../parsers/IndeedParser';
import { WellfoundParser } from '../parsers/WellfoundParser';
import { GenericParser } from '../parsers/GenericParser';
import type { SiteParser } from '../parsers/ParserInterface';

console.log('[Job Intelligence Collector] Content script loaded.');

function getParser(url: string): SiteParser {
  if (url.includes('linkedin.com')) return new LinkedInParser();
  if (url.includes('naukri.com')) return new NaukriParser();
  if (url.includes('indeed.com')) return new IndeedParser();
  if (url.includes('wellfound.com')) return new WellfoundParser();
  return new GenericParser();
}

/**
 * Perform DOM extraction based on current URL
 */
function runExtraction() {
  const url = window.location.href;
  const parser = getParser(url);

  console.log(`[Job Intelligence Collector] Running parser for: ${url}`);
  
  const job = parser.extractJob(document, url);
  const company = parser.extractCompany(document, url);
  const post = parser.extractPost(document, url);

  // Determine which type was successfully extracted
  let detectedType: 'job' | 'company' | 'post' | 'none' = 'none';
  if (job) {
    detectedType = 'job';
  } else if (company) {
    detectedType = 'company';
  } else if (post) {
    detectedType = 'post';
  }

  return {
    job,
    company,
    post,
    detectedType,
    url
  };
}

// Listen for message requests from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extract') {
    try {
      const data = runExtraction();
      sendResponse({ success: true, data });
    } catch (error: any) {
      console.error('[Job Intelligence Collector] Extraction error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open for async response
});

// Set up MutationObserver to handle SPA state changes or delayed rendering
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log(`[Job Intelligence Collector] URL changed dynamically to: ${lastUrl}`);
    chrome.runtime.sendMessage({ action: 'urlChanged', url: lastUrl }).catch(() => {
      // Catch error silently if no extension receiver (e.g. popup is closed)
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
