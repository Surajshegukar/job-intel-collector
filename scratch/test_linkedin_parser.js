const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function testLinkedIn(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const getText = (selector) => {
    return doc.querySelector(selector)?.textContent?.trim() || '';
  };

  let title =
    getText('.job-details-jobs-unified-top-card__job-title') ||
    getText('.jobs-unified-top-card__job-title') ||
    getText('.jobs-details-top-card__job-title') ||
    doc.querySelector('h1')?.textContent?.trim() || '';
  title = title.replace(/\s+/g, ' ').trim();

  const companyEl =
    doc.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
    doc.querySelector('.jobs-unified-top-card__company-name a') ||
    doc.querySelector('.job-details-jobs-unified-top-card__company-name') ||
    doc.querySelector('.jobs-unified-top-card__company-name') ||
    doc.querySelector('.jobs-details-top-card__company-name');
  const company = companyEl?.textContent?.trim() || '';

  let location =
    doc.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container span span')?.textContent?.trim() ||
    doc.querySelector('[class*="tertiary-description-container"] span span')?.textContent?.trim() ||
    getText('.job-details-jobs-unified-top-card__tertiary-description-container') ||
    getText('.jobs-unified-top-card__bullet') ||
    getText('.jobs-details-jobs-unified-top-card__primary-description-container span:nth-of-type(2)') ||
    getText('.jobs-unified-top-card__primary-description') ||
    '';
  if (location.includes('·')) {
    location = location.split('·')[0].trim();
  }
  location = location.replace(/·/g, '').replace(/\s+/g, ' ').trim();

  const descEl =
    doc.querySelector('.jobs-description__content') ||
    doc.querySelector('#job-details') ||
    doc.querySelector('.jobs-description');
  const description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

  // Recruiter URL:
  const recruiterLinkEl = doc.querySelector('.hirer-card__hirer-information a, .jobs-poster__name a, a[href*="/in/"]');
  let recruiterUrl = '';
  if (recruiterLinkEl) {
    const href = recruiterLinkEl.getAttribute('href') || '';
    try {
      recruiterUrl = href.startsWith('http') ? href : new URL(href, url).href;
    } catch (e) {
      recruiterUrl = href;
    }
  }
  
  // Recruiter Name:
  const recruiterName = doc.querySelector('.jobs-poster__name strong, .hirer-card__hirer-information strong, .jobs-poster__name')?.textContent?.trim() || '';

  // Company URL:
  const companyLinkEl = doc.querySelector('.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a, a[href*="/company/"]');
  let companyUrl = '';
  if (companyLinkEl) {
    const href = companyLinkEl.getAttribute('href') || '';
    try {
      const fullHref = href.startsWith('http') ? href : new URL(href, url).href;
      companyUrl = fullHref.split('/life')[0].split('?')[0]; // Clean suffix and query params
    } catch (e) {
      companyUrl = href;
    }
  }

  return {
    title,
    company,
    location,
    recruiterName,
    recruiterUrl,
    companyUrl,
    descriptionLen: description.length
  };
}

const linkedinHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'linkedin.html'), 'utf-8');
console.log(testLinkedIn(linkedinHtml, "https://www.linkedin.com/jobs/view/4432091545"));
