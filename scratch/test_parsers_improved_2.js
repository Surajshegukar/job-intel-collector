const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// 1. Naukri extraction logic
function testNaukri(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  const getText = (selector) => {
    return doc.querySelector(selector)?.textContent?.trim() || '';
  };

  let title =
    getText('h1') || 
    getText('[class*="jd-header-title"]') || 
    getText('[class*="job-desc-title"]') || 
    getText('[class*="title"]') || '';

  let company =
    getText('[class*="companyInfo"] a') || 
    getText('[class*="companyInfo"]') ||
    getText('[class*="jd-header-comp-name"] a') || 
    getText('[class*="jd-header-comp-name"]') ||
    getText('[class*="company-info"] .name') ||
    getText('[class*="subTitle"]') || '';

  // Use icon adjacency selectors for experience, salary, location
  let experience = 
    doc.querySelector('.ni-icon-bag + span')?.textContent?.trim() || 
    doc.querySelector('[class*="icon-bag"] + span')?.textContent?.trim() ||
    getText('[class*="exp"] span') || 
    getText('[class*="exp"]') || '';

  let salary = 
    doc.querySelector('.ni-icon-salary + span')?.textContent?.trim() || 
    doc.querySelector('[class*="salary"] + span')?.textContent?.trim() ||
    getText('[class*="jhc__salary"] span') || 
    getText('[class*="jhc__salary"]') || '';

  let location = 
    doc.querySelector('.ni-icon-location + span')?.textContent?.trim() || 
    doc.querySelector('[class*="location"] + span')?.textContent?.trim() ||
    doc.querySelector('.ni-icon-location + *')?.textContent?.trim() ||
    getText('[class*="location"] a') || 
    getText('[class*="location"]') || '';

  const descEl =
    doc.querySelector('[class*="dang-inner-html"]') ||
    doc.querySelector('[class*="job-desc"]') ||
    doc.querySelector('[class*="jd-description"]') ||
    doc.querySelector('[class*="job-description"]') ||
    doc.querySelector('#jobDescription');
  let description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

  const skills = [];
  const skillEls = doc.querySelectorAll('[class*="key-skill"] a, [class*="key-skill"] span, [class*="chip"] span, [class*="skills"] a, .tags li, .tags span');
  skillEls.forEach(el => {
    const text = el.textContent?.trim();
    if (text && !skills.includes(text) && text !== 'Key Skills') {
      skills.push(text);
    }
  });

  return { title, company, location, experience, salary, description: description.substring(0, 100) + '...', skills };
}

// 3. LinkedIn extraction logic
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

  // Get specific first span in tertiary description container for clean location
  let location =
    doc.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container span span')?.textContent?.trim() ||
    doc.querySelector('[class*="tertiary-description-container"] span span')?.textContent?.trim() ||
    getText('.job-details-jobs-unified-top-card__tertiary-description-container') ||
    getText('.jobs-unified-top-card__bullet') ||
    getText('.jobs-details-jobs-unified-top-card__primary-description-container span:nth-of-type(2)') ||
    getText('.jobs-unified-top-card__primary-description') ||
    '';
  
  // Clean location if it contains bullets or extra details
  if (location.includes('·')) {
    location = location.split('·')[0].trim();
  }

  const descEl =
    doc.querySelector('.jobs-description__content') ||
    doc.querySelector('#job-details') ||
    doc.querySelector('.jobs-description');
  const description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

  let employmentType = '';
  let experience = '';
  const insights = doc.querySelectorAll(
    '.jobs-unified-top-card__job-insight, .jobs-description-details__list-item, .job-details-fit-level-preferences button, [class*="fit-level-preferences"] button'
  );
  insights.forEach(insight => {
    const text = insight.textContent?.trim() || '';
    if (text.includes('Full-time') || text.includes('Part-time') || text.includes('Contract') || text.includes('Temporary') || text.includes('Internship')) {
      employmentType = text.split(' · ')[0] || text;
    }
    if (text.includes('Entry level') || text.includes('Associate') || text.includes('Mid-Senior') || text.includes('Director') || text.includes('Executive') || text.includes('Internship')) {
      experience = text.split(' · ')[1] || text;
    }
  });

  return { title, company, location, employmentType, experience, description: description.substring(0, 100) + '...' };
}

// Execution
console.log("=== RUNNING IMPROVED PARSERS V2 ===");

const naukriHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'nukri.html'), 'utf-8');
const linkedinHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'linkedin.html'), 'utf-8');

console.log("\nNaukri results:");
console.log(testNaukri(naukriHtml, "https://www.naukri.com/job-listings-apprentice-trainee-suryalogix-pune-0-to-0-years-180626016437"));

console.log("\nLinkedIn results:");
console.log(testLinkedIn(linkedinHtml, "https://www.linkedin.com/jobs/view/4432091545"));
