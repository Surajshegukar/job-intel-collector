import type { SiteParser } from './ParserInterface';
import type { Job, Company, HiringPost } from '../types';
import { createKeywordRegex } from '../utils/regex';

export class IndeedParser implements SiteParser {
  extractJob(doc: Document, url: string): Partial<Job> | null {
    if (!url.includes('indeed.com')) return null;

    let activeDoc = doc;
    try {
      const iframe = doc.querySelector('iframe[src*="viewjob"], iframe[src*="rc/clk"], iframe#vjs-container-iframe, iframe[title="Job details"]') as HTMLIFrameElement | null;
      if (iframe && iframe.contentDocument) {
        activeDoc = iframe.contentDocument;
      }
    } catch (e) {
      console.warn('[IndeedParser] Could not access iframe content:', e);
    }

    const detailsPane = activeDoc.querySelector('.jobsearch-RightPane, #vjs-container, .jobsearch-JobComponent');
    const container = detailsPane || activeDoc;

    const getText = (selector: string): string => {
      return container.querySelector(selector)?.textContent?.trim() || '';
    };

    // Try single job page selectors first
    let title =
      container.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
      container.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() ||
      container.querySelector('h1.is-newJS')?.textContent?.trim() ||
      (container !== activeDoc ? container.querySelector('h1')?.textContent?.trim() : '') ||
      '';
    title = title.replace(/\s*-\s*job post$/i, '').trim();

    let company =
      container.querySelector('[data-company-name="true"]')?.textContent?.trim() ||
      container.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim() ||
      container.querySelector('.jobsearch-InlineCompanyRating a')?.textContent?.trim() ||
      container.querySelector('.jobsearch-InlineCompanyRating div')?.textContent?.trim() ||
      container.querySelector('.jobsearch-CompanyInfoContainer a')?.textContent?.trim() ||
      '';

    let location =
      container.querySelector('[data-testid="inlineHeader-companyLocation"]')?.textContent?.trim() ||
      container.querySelector('[data-testid="jobsearch-JobInfoHeader-companyLocation"]')?.textContent?.trim() ||
      container.querySelector('.jobsearch-JobInfoHeader-subtitle > div:last-child')?.textContent?.trim() ||
      container.querySelector('.jobsearch-InlineCompanyRating + div')?.textContent?.trim() ||
      getText('.jobsearch-JobInfoHeader-subtitle') || '';

    const descEl =
      container.querySelector('#jobDescriptionText') ||
      container.querySelector('.jobsearch-JobComponent-description') ||
      container.querySelector('.jobsearch-jobDescriptionText');
    let description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

    // Semantic description fallback if standard ID/class is missing or changed
    if (!description) {
      const headings = container.querySelectorAll('h2, h3, h4');
      for (const h of headings) {
        const text = h.textContent?.trim().toLowerCase();
        if (text === 'job description' || text === 'full job description' || text === 'job description:') {
          let sibling = h.nextElementSibling;
          if (!sibling && h.parentElement) {
            sibling = h.parentElement.nextElementSibling;
          }
          if (sibling) {
            description = sibling.innerHTML?.trim() || sibling.textContent?.trim() || '';
            break;
          }
        }
      }
    }

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

        const titleLink = card.querySelector('h3.jobTitle a');
        if (titleLink) {
          const jk = titleLink.getAttribute('data-jk');
          if (jk) {
            finalUrl = `https://www.indeed.com/viewjob?jk=${jk}`;
          } else {
            const href = titleLink.getAttribute('href');
            if (href) {
              if (href.startsWith('http')) {
                finalUrl = href;
              } else {
                try {
                  finalUrl = new URL(href, url).href;
                } catch (e) {
                  // Ignore URL construction errors
                }
              }
            }
          }
        }
      }
    } else {
      // Single job metadata parsing
      const salaryEl = container.querySelector('#salaryInfoAndJobType') || container.querySelector('.jobsearch-JobMetadataHeader-item');
      const salaryText = salaryEl?.textContent?.trim() || '';
      salary = salaryText;

      const jobTypeEl = container.querySelector('[role="group"][aria-label="Job type"]') || 
                        container.querySelector('[class*="JobType"]') || 
                        container.querySelector('.js-match-insights-provider-1i8duct');
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
    }

    if (!title && !company) return null;

    // Try to extract skills or generate tags from description
    const skills: string[] = [];
    const keywords = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Docker', 'AWS', 'Java', 'SQL', 'CSS', 'HTML', 'C++', 'C#', 'Go', 'Rust'];
    keywords.forEach(kw => {
      if (createKeywordRegex(kw).test(description)) {
        skills.push(kw);
      }
    });

    return {
      title,
      company,
      location,
      salary,
      employmentType,
      skills,
      description,
      source: 'Indeed',
      url: finalUrl,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }

  extractCompany(_doc: Document, _url: string): Partial<Company> | null {
    return null;
  }

  extractPost(_doc: Document, _url: string): Partial<HiringPost> | null {
    return null;
  }
}
