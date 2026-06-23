const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function testLinkedInPostImproved(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const getText = (selector) => {
    const el = doc.querySelector(selector);
    return el?.textContent?.trim() || '';
  };

  let author = '';
  let authorProfile = '';

  // Try finding the profile link
  const profileLinkEl = 
    doc.querySelector('a[href*="/in/"]') || 
    doc.querySelector('.update-components-actor__meta-link') ||
    doc.querySelector('.feed-shared-actor__container a');

  if (profileLinkEl) {
    const href = profileLinkEl.getAttribute('href') || '';
    try {
      authorProfile = href.startsWith('http') ? href : new URL(href, url).href;
    } catch {
      authorProfile = href;
    }

    // Extract author name from the text content of the link
    let text = profileLinkEl.textContent?.trim() || '';
    if (text) {
      // Strip any sub-text or bullets like "• 3rd+"
      text = text.split('\n')[0].split('•')[0].split('·')[0].trim();
      if (text) author = text;
    }

    // If no name text, try fetching from the avatar image alt or SVG labels
    if (!author) {
      const img = profileLinkEl.querySelector('img');
      if (img) {
        const alt = img.getAttribute('alt') || '';
        const match = alt.match(/View\s+([^’'’]+)’s\s+profile/i) || alt.match(/([^’'’]+)/i);
        if (match && match[1]) author = match[1].trim();
      }
    }
  }

  // Fallbacks for author name using common classes
  if (!author) {
    author = 
      getText('.update-components-actor__title span span') ||
      getText('.feed-shared-actor__name') ||
      getText('.update-components-actor__title') ||
      '';
    author = author.split('\n')[0].split('•')[0].split('·')[0].trim();
  }

  // Secondary fallback using aria-label of the actor container
  if (!author) {
    const actorLabelEl = doc.querySelector('[aria-label*="profile"], [aria-label*="Profile"]');
    if (actorLabelEl) {
      const label = actorLabelEl.getAttribute('aria-label') || '';
      const match = label.match(/^([^,]+),/);
      if (match && match[1]) author = match[1].trim();
    }
  }

  const contentEl =
    doc.querySelector('[data-testid="expandable-text-box"]') ||
    doc.querySelector('.feed-shared-update-v2__commentary span') ||
    doc.querySelector('.update-components-text') ||
    doc.querySelector('.feed-shared-update-v2__commentary') ||
    doc.querySelector('.feed-shared-update-v2__description');
  const content = contentEl?.innerHTML?.trim() || contentEl?.textContent?.trim() || '';

  // Find post URL
  const postLinkEl = doc.querySelector('a[href*="/posts/"], a[href*="feed/update"]');
  let finalUrl = url;
  if (postLinkEl) {
    const href = postLinkEl.getAttribute('href') || '';
    try {
      finalUrl = href.startsWith('http') ? href : new URL(href, url).href;
    } catch {
      finalUrl = href;
    }
  }

  // Guess company name
  let company = '';
  const bioEl = 
    doc.querySelector('.update-components-actor__description') || 
    doc.querySelector('.feed-shared-actor__description') ||
    doc.querySelector('.update-components-actor__meta-link + div') ||
    doc.querySelector('[class*="actor__description"]');
  if (bioEl) {
    const authorBio = bioEl.textContent?.trim() || '';
    const companyMatch = authorBio.match(/at\s+([A-Za-z0-9\s\-&]+)/i) || authorBio.match(/Founder\s+&\s+Director\s+@\s+([A-Za-z0-9\s\-&]+)/i) || authorBio.match(/@\s+([A-Za-z0-9\s\-&]+)/i);
    if (companyMatch && companyMatch[1]) {
      company = companyMatch[1].trim();
    }
  }

  if (!company && content) {
    const companyMatch = content.match(/Company\s*:\s*([^\n\r<]+)/i) || content.match(/hiring\s+for\s+([^\n\r<]+)/i);
    if (companyMatch && companyMatch[1]) {
      company = companyMatch[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
    }
  }

  return {
    author,
    authorProfile,
    company,
    content: content.substring(0, 150) + '...',
    finalUrl
  };
}

const html = fs.readFileSync(path.join(__dirname, '..', 'samples', 'linkedIn-post.html'), 'utf-8');
console.log(testLinkedInPostImproved(html, "https://www.linkedin.com/posts/harpreet-gaba_were-hiring-php-laravel-developer-frontend-share-7475070524193144832-Uctq"));
