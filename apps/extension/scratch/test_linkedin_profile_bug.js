const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function testProfileLeak(html, url) {
  // Prepend a mock header containing the logged-in user's profile link to simulate a real page
  const fullHtml = `
    <html>
      <body>
        <header id="global-nav">
          <a class="nav-profile-link" href="https://www.linkedin.com/in/logged-in-user-suraj/">
            <span>My Profile</span>
          </a>
        </header>
        <main>
          ${html}
        </main>
      </body>
    </html>
  `;

  const dom = new JSDOM(fullHtml);
  const doc = dom.window.document;

  const getText = (selector) => {
    const el = doc.querySelector(selector);
    return el?.textContent?.trim() || '';
  };

  // --- BUGGY WAY (finds logged-in user first) ---
  const buggyProfileLinkEl = doc.querySelector('a[href*="/in/"]');
  const buggyAuthorProfile = buggyProfileLinkEl?.getAttribute('href');

  // --- FIXED WAY ---
  // Find the post card/container first, separate from global navigation
  const postContainer = 
    doc.querySelector('.feed-shared-update-v2, article, [role="listitem"], [class*="update-v2"]') || 
    doc.querySelector('[data-testid="expandable-text-box"]')?.closest('.feed-shared-update-v2, article, [role="listitem"], div') || 
    doc;

  const fixedProfileLinkEl = postContainer.querySelector('a[href*="/in/"]');
  const fixedAuthorProfile = fixedProfileLinkEl?.getAttribute('href');
  
  let author = '';
  if (fixedProfileLinkEl) {
    let text = fixedProfileLinkEl.textContent?.trim() || '';
    if (text) {
      text = text.split('\n')[0].split('•')[0].split('·')[0].trim();
      if (text) author = text;
    }
    if (!author) {
      const img = fixedProfileLinkEl.querySelector('img');
      if (img) {
        const alt = img.getAttribute('alt') || '';
        const match = alt.match(/View\s+([^’'’]+)’s\s+profile/i) || alt.match(/([^’'’]+)/i);
        if (match && match[1]) author = match[1].trim();
      }
    }
  }

  return {
    buggyAuthorProfile,
    fixedAuthorProfile,
    author
  };
}

const html = fs.readFileSync(path.join(__dirname, '..', 'samples', 'linkedIn-post.html'), 'utf-8');
console.log(testProfileLeak(html, "https://www.linkedin.com/posts/harpreet-gaba_were-hiring-php-laravel-developer-frontend-share-7475070524193144832-Uctq"));
