import type { SiteParser } from './ParserInterface';
import type { Job, Company, HiringPost } from '../types';
import { createKeywordRegex } from '../utils/regex';

export class NaukriParser implements SiteParser {
  extractJob(doc: Document, url: string): Partial<Job> | null {
    if (!url.includes('naukri.com')) return null;

    const getText = (selector: string): string => {
      return doc.querySelector(selector)?.textContent?.trim() || '';
    };

    const isSingleJobPage = url.includes('/job-listings');

    let title = '';
    let company = '';
    let location = '';
    let experience = '';
    let salary = '';
    let description = '';
    const skills: string[] = [];
    let finalUrl = url;

    if (isSingleJobPage) {
      title =
        getText('[class*="jd-header-title"]') || 
        getText('[class*="job-desc-title"]') || 
        (doc.querySelector('[class*="jd-header"] h1') || doc.querySelector('main h1'))?.textContent?.trim() ||
        '';

      company =
        getText('[class*="companyInfo"] a') || 
        getText('[class*="jd-header-comp-name"] a') || 
        getText('[class*="jd-header-comp-name"]') ||
        getText('[class*="companyInfo"]') ||
        getText('[class*="company-info"] .name') ||
        getText('[class*="subTitle"]') || '';

      location = 
        doc.querySelector('.ni-icon-location + span')?.textContent?.trim() || 
        doc.querySelector('[class*="location"] + span')?.textContent?.trim() ||
        doc.querySelector('.ni-icon-location + *')?.textContent?.trim() ||
        getText('[class*="location"] a') || 
        getText('[class*="location"]') || '';

      experience = 
        doc.querySelector('.ni-icon-bag + span')?.textContent?.trim() || 
        doc.querySelector('[class*="icon-bag"] + span')?.textContent?.trim() ||
        getText('[class*="exp"] span') || 
        getText('[class*="exp"]') || '';

      salary = 
        doc.querySelector('.ni-icon-salary + span')?.textContent?.trim() || 
        doc.querySelector('[class*="salary"] + span')?.textContent?.trim() ||
        getText('[class*="jhc__salary"] span') || 
        getText('[class*="jhc__salary"]') || '';

      const descEl =
        doc.querySelector('[class*="dang-inner-html"]') ||
        doc.querySelector('[class*="job-desc"]') ||
        doc.querySelector('[class*="jd-description"]') ||
        doc.querySelector('[class*="job-description"]') ||
        doc.querySelector('#jobDescription');
      description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

      // Semantic description fallback if standard ID/class is missing or changed
      if (!description) {
        const headings = doc.querySelectorAll('h2, h3, h4, h5');
        for (const h of headings) {
          const text = h.textContent?.trim().toLowerCase();
          if (text === 'job description' || text === 'job description:') {
            let sibling = h.nextElementSibling;
            if (!sibling && h.parentElement) {
              sibling = h.parentElement.nextElementSibling;
            }
            if (sibling) {
              const inner = sibling.querySelector('[class*="dang-inner-html"]') || sibling;
              description = inner.innerHTML?.trim() || inner.textContent?.trim() || '';
              break;
            }
          }
        }
      }

      const skillEls = doc.querySelectorAll('[class*="key-skill"] a, [class*="key-skill"] span, [class*="chip"] span, [class*="skills"] a, .tags li, .tags span');
      skillEls.forEach(el => {
        const text = el.textContent?.trim();
        if (text && !skills.includes(text) && text !== 'Key Skills') {
          skills.push(text);
        }
      });
    } else {
      // Fallback if we are on a list/feed page (like recommended jobs or search results)
      const card = doc.querySelector('.jobTuple, article.jobTuple');
      if (card) {
        title = card.querySelector('.title, .jobTupleHeader .title')?.textContent?.trim() || '';
        company = card.querySelector('.subTitle, .companyInfo .subTitle')?.textContent?.trim() || '';
        
        const locEl = card.querySelector('.location span, .location');
        location = locEl?.getAttribute('title')?.trim() || locEl?.textContent?.trim() || '';
        
        const expEl = card.querySelector('.experience span, .experience');
        experience = expEl?.getAttribute('title')?.trim() || expEl?.textContent?.trim() || '';
        
        const salEl = card.querySelector('.salary span, .salary');
        salary = salEl?.getAttribute('title')?.trim() || salEl?.textContent?.trim() || '';
        
        const descElCard = card.querySelector('.job-description span, .job-description, .job-desc');
        description = descElCard?.getAttribute('title')?.trim() || descElCard?.innerHTML?.trim() || descElCard?.textContent?.trim() || '';

        card.querySelectorAll('.tags li, .tags span').forEach(el => {
          const txt = el.textContent?.trim();
          if (txt && !skills.includes(txt)) {
            skills.push(txt);
          }
        });

        const jobId = card.getAttribute('data-job-id');
        if (jobId) {
          const slug = `${title}-${company}`.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          finalUrl = `https://www.naukri.com/job-listings-${slug}-${jobId}`;
        }
      }
    }

    if (!title && !company) return null;

    // Extract job highlights if present
    const highlightEls = doc.querySelectorAll('[class*="job-highlight-list"] li, .styles_JDC__job-highlight-list__QZC12 li');
    const highlightsArr: string[] = [];
    highlightEls.forEach(el => {
      const txt = el.textContent?.trim();
      if (txt) highlightsArr.push(txt);
    });

    // Semantic highlights fallback if standard selectors fail
    if (highlightsArr.length === 0) {
      const spanElements = doc.querySelectorAll('span, h2, h3, h4, div');
      for (const el of spanElements) {
        if (el.textContent?.trim().toLowerCase() === 'job highlights') {
          let container = el.nextElementSibling;
          if (!container && el.parentElement) {
            container = el.parentElement.nextElementSibling;
          }
          if (container) {
            const list = container.tagName === 'UL' ? container : container.querySelector('ul');
            if (list) {
              list.querySelectorAll('li').forEach(li => {
                const txt = li.textContent?.trim();
                if (txt) highlightsArr.push(txt);
              });
              break;
            }
          }
        }
      }
    }

    const highlights = highlightsArr.length > 0 ? highlightsArr.map(item => `• ${item}`).join('\n') : '';

    // Determine employment type if mentioned
    let employmentType = '';
    const detailsText = doc.body.innerText || '';
    if (/full\s*time/i.test(detailsText)) {
      employmentType = 'Full-time';
    } else if (/part\s*time/i.test(detailsText)) {
      employmentType = 'Part-time';
    } else if (/contract/i.test(detailsText)) {
      employmentType = 'Contract';
    }

    // Enrich skills with keyword scanning from description/text if any are missing
    const commonSkills = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB'];
    const textToScan = description || detailsText;
    commonSkills.forEach(skill => {
      if (createKeywordRegex(skill).test(textToScan) && !skills.includes(skill)) {
        skills.push(skill);
      }
    });

    return {
      title,
      company,
      location: location.replace(/·/g, '').replace(/\s+/g, ' ').trim(),
      experience: experience.trim(),
      salary: salary.trim(),
      employmentType,
      skills,
      description,
      source: 'Naukri',
      url: finalUrl,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString(),
      highlights
    };
  }

  extractCompany(_doc: Document, _url: string): Partial<Company> | null {
    return null;
  }

  extractPost(_doc: Document, _url: string): Partial<HiringPost> | null {
    return null;
  }
}
