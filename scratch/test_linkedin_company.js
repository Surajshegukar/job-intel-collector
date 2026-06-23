const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function testLinkedInCompany(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const getText = (selector) => {
    const el = doc.querySelector(selector);
    return el?.textContent?.trim() || '';
  };

  const name =
    getText('.org-top-card-summary__title') ||
    doc.querySelector('h1')?.textContent?.trim() || '';

  // Parse using semantic dl layout
  const dl = doc.querySelector('dl.overflow-hidden, dl');
  let parsedWebsite = '';
  let parsedIndustry = '';
  let parsedSize = '';
  let parsedLocation = '';
  let parsedSpecialties = '';

  if (dl) {
    const dts = dl.querySelectorAll('dt');
    dts.forEach(dt => {
      const title = dt.textContent?.trim().toLowerCase() || '';
      const dd = dt.nextElementSibling;
      if (dd && dd.tagName.toLowerCase() === 'dd') {
        const val = dd.textContent?.trim() || '';
        if (title.includes('website')) {
          const link = dd.querySelector('a');
          parsedWebsite = link?.getAttribute('href') || val;
        } else if (title.includes('industry')) {
          parsedIndustry = val;
        } else if (title.includes('company size')) {
          parsedSize = val.split('\n')[0].trim();
        } else if (title.includes('headquarters')) {
          parsedLocation = val;
        } else if (title.includes('specialties')) {
          parsedSpecialties = val;
        }
      }
    });
  }

  // Fallbacks
  const websiteEl = doc.querySelector('.org-top-card-primary-actions__action, a[href*="utm_source=linkedin"], a[href*="careers"]');
  const website = parsedWebsite || websiteEl?.getAttribute('href') || '';

  const industry = parsedIndustry || getText('.org-top-card-summary-info-list__info-item') || getText('.org-top-card-summary__industry') || '';
  
  const sizeFallback = doc.querySelector('[href*="currentCompany"] span')?.textContent?.trim() || '';
  const size = parsedSize || sizeFallback || getText('.org-top-card-summary__employee-count') || '';
  
  const location = parsedLocation || getText('.org-top-card-summary-info-list__info-item:nth-of-type(2)') || '';
  
  const description = 
    getText('.org-page-details-module__card-spacing p') ||
    getText('.org-about-module__margin-bottom p') ||
    getText('.org-about-us-organization-description__text') || 
    getText('.org-about-us-organization-description__text-wrap') || '';

  return {
    name,
    website,
    industry,
    size,
    location,
    description: description.substring(0, 150) + '...',
    specialties: parsedSpecialties
  };
}

const html = fs.readFileSync(path.join(__dirname, '..', 'samples', 'linkedin-company.html'), 'utf-8');
console.log(testLinkedInCompany(html, "https://www.linkedin.com/company/capgemini/about/"));
