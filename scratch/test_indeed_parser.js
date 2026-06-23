const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function testIndeed(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const getText = (selector) => {
    return doc.querySelector(selector)?.textContent?.trim() || '';
  };

  // Try single job page selectors first
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

  let location =
    getText('[data-testid="inlineHeader-companyLocation"]') ||
    getText('[data-testid="jobsearch-JobInfoHeader-companyLocation"]') ||
    doc.querySelector('.jobsearch-JobInfoHeader-subtitle > div:last-child')?.textContent?.trim() ||
    doc.querySelector('.jobsearch-InlineCompanyRating + div')?.textContent?.trim() ||
    getText('.jobsearch-JobInfoHeader-subtitle') || '';

  const descEl =
    doc.querySelector('#jobDescriptionText') ||
    doc.querySelector('.jobsearch-JobComponent-description') ||
    doc.querySelector('.jobsearch-jobDescriptionText');
  let description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

  let salary = '';
  let employmentType = '';
  let finalUrl = url;

  // Fallback if we are on a list/feed page (like search results) and no job details are loaded
  if (!title && !company) {
    const card = doc.querySelector('.job_seen_beacon');
    if (card) {
      title = card.querySelector('h3.jobTitle a span[id^="jobTitle"]')?.textContent?.trim() ||
              card.querySelector('h3.jobTitle a')?.textContent?.trim() ||
              card.querySelector('h3.jobTitle')?.textContent?.trim() || '';
      title = title.replace(/\s*-\s*job post$/i, '').trim();
      
      company = card.querySelector('[data-testid="company-name"]')?.textContent?.trim() || '';
      location = card.querySelector('[data-testid="text-location"]')?.textContent?.trim() || '';
      
      const salEl = card.querySelector('.salary-snippet-container') || card.querySelector('[data-testid="attribute_snippet_testid"]');
      const salText = salEl?.textContent?.trim() || '';
      if (salText) {
        const parts = salText.split(' - ');
        salary = parts[0] || '';
        employmentType = parts[1] || '';
      }
      
      const descSnippetEl = card.querySelector('.job-snippet, div[class*="snippet"]');
      description = descSnippetEl?.innerHTML?.trim() || descSnippetEl?.textContent?.trim() || '';
    }
  } else {
    // Single job metadata parsing
    const salaryEl = doc.querySelector('#salaryInfoAndJobType') || doc.querySelector('.jobsearch-JobMetadataHeader-item');
    const salaryText = salaryEl?.textContent?.trim() || '';
    salary = salaryText;

    const jobTypeEl = doc.querySelector('[role="group"][aria-label="Job type"]') || 
                      doc.querySelector('[class*="JobType"]') || 
                      doc.querySelector('.js-match-insights-provider-1i8duct');
    if (jobTypeEl) {
      employmentType = jobTypeEl.querySelector('span')?.textContent?.trim() || '';
    }
  }

  return {
    title,
    company,
    location,
    salary,
    employmentType,
    description: description.substring(0, 100) + '...',
    fullDescLen: description.length
  };
}

const indeedHtml = fs.readFileSync(path.join(__dirname, '..', 'samples', 'indeed.html'), 'utf-8');
console.log(testIndeed(indeedHtml, "https://in.indeed.com/viewjob?jk=3ad9892a15633f57"));
