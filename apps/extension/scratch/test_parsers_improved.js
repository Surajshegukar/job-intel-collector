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

  let location =
    getText('[class*="location"] a') || 
    getText('[class*="location"]') || 
    getText('[class*="loc"]') || '';

  let experience =
    getText('[class*="exp"] span') || 
    getText('[class*="exp"]') || '';

  let salary =
    getText('[class*="salary"] span') || 
    getText('[class*="salary"]') || '';

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

// 2. Indeed extraction logic
function testIndeed(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  const getText = (selector) => {
    return doc.querySelector(selector)?.textContent?.trim() || '';
  };

  let title =
    getText('.jobsearch-JobInfoHeader-title') ||
    getText('h1.is-newJS') ||
    doc.querySelector('h1')?.textContent?.trim() || '';
  title = title.replace(/\s*-\s*job post$/i, '').trim();

  let company =
    getText('[data-company-name="true"]') ||
    getText('.jobsearch-InlineCompanyRating a') ||
    getText('.jobsearch-InlineCompanyRating div') ||
    getText('.jobsearch-CompanyInfoContainer a') ||
    '';

  let location = getText('[data-testid="inlineHeader-companyLocation"]') ||
                 getText('[data-testid="jobsearch-JobInfoHeader-companyLocation"]') ||
                 doc.querySelector('.jobsearch-JobInfoHeader-subtitle > div:last-child')?.textContent?.trim() ||
                 doc.querySelector('.jobsearch-InlineCompanyRating + div')?.textContent?.trim() ||
                 getText('.jobsearch-JobInfoHeader-subtitle') || '';

  const descEl =
    doc.querySelector('#jobDescriptionText') ||
    doc.querySelector('.jobsearch-JobComponent-description') ||
    doc.querySelector('.jobsearch-jobDescriptionText');
  let description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

  const salaryEl = doc.querySelector('#salaryInfoAndJobType') || doc.querySelector('.jobsearch-JobMetadataHeader-item');
  const salaryText = salaryEl?.textContent?.trim() || '';
  let salary = salaryText;
  let employmentType = '';

  const jobTypeEl = doc.querySelector('[role="group"][aria-label="Job type"]') || 
                    doc.querySelector('[class*="JobType"]') || 
                    doc.querySelector('.js-match-insights-provider-1i8duct');
  if (jobTypeEl) {
    employmentType = jobTypeEl.querySelector('span')?.textContent?.trim() || '';
  }

  if (!employmentType && salaryText.includes(' - ')) {
    const parts = salaryText.split(' - ');
    const lastPart = parts[parts.length - 1];
    if (/full\s*time|part\s*time|contract|temporary|internship/i.test(lastPart)) {
      employmentType = lastPart;
      salary = parts.slice(0, -1).join(' - ');
    }
  }

  return { title, company, location, salary, employmentType, description: description.substring(0, 100) + '...' };
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

  const location =
    getText('.job-details-jobs-unified-top-card__tertiary-description-container') ||
    getText('.jobs-unified-top-card__bullet') ||
    getText('.jobs-details-jobs-unified-top-card__primary-description-container span:nth-of-type(2)') ||
    getText('.jobs-unified-top-card__primary-description') ||
    '';

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
console.log("=== RUNNING IMPROVED PARSERS ON SAMPLE HTMLs ===");

const naukriHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'nukri.html'), 'utf-8');
const indeedHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'indeed.html'), 'utf-8');
const linkedinHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'linkedin.html'), 'utf-8');

console.log("\nNaukri results:");
console.log(testNaukri(naukriHtml, "https://www.naukri.com/job-listings-apprentice-trainee-suryalogix-pune-0-to-0-years-180626016437"));

console.log("\nIndeed results:");
console.log(testIndeed(indeedHtml, "https://in.indeed.com/viewjob?jk=3ad9892a15633f57"));

console.log("\nLinkedIn results:");
console.log(testLinkedIn(linkedinHtml, "https://www.linkedin.com/jobs/view/4432091545"));
