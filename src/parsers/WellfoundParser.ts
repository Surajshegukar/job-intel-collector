import type { SiteParser } from './ParserInterface';
import type { Job, Company, HiringPost } from '../types';

export class WellfoundParser implements SiteParser {
  extractJob(doc: Document, url: string): Partial<Job> | null {
    if (!url.includes('wellfound.com')) return null;

    const getText = (selector: string): string => {
      return doc.querySelector(selector)?.textContent?.trim() || '';
    };

    const title =
      getText('.styles_jobTitle__3qD_G') ||
      getText('[class*="jobTitle"]') ||
      getText('[class*="title"]') ||
      doc.querySelector('h1')?.textContent?.trim() || '';

    const company =
      getText('.styles_companyName__2_h94') ||
      getText('[class*="companyName"]') ||
      doc.querySelector('h2 [class*="companyName"]')?.textContent?.trim() ||
      '';

    const location =
      getText('.styles_location__2G_bV') ||
      getText('[class*="location"]') ||
      '';

    const descEl =
      doc.querySelector('.styles_jobDescription__2U8Vd') ||
      doc.querySelector('[class*="jobDescription"]') ||
      doc.querySelector('[class*="description"]') ||
      doc.querySelector('.job-description');
    const description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

    // Compensation (Wellfound lists salary/equity under details)
    let salary = '';
    const salaryMatch = doc.body.innerText.match(/(\$\d+[\d,]*k\s*-\s*\$\d+[\d,]*k)|(\$\d+[\d,]*\s*-\s*\$\d+[\d,]*)/i);
    if (salaryMatch) {
      salary = salaryMatch[0];
    }

    // Extracted Skills
    const skills: string[] = [];
    const skillEls = doc.querySelectorAll('[class*="skillTag"], [class*="tag"]');
    skillEls.forEach(el => {
      const text = el.textContent?.trim();
      if (text && !skills.includes(text) && text.length < 25) {
        skills.push(text);
      }
    });

    if (!title && !company) return null;

    return {
      title,
      company,
      location,
      salary,
      skills,
      description,
      source: 'Wellfound',
      url,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }

  extractCompany(doc: Document, url: string): Partial<Company> | null {
    if (!url.includes('wellfound.com/companies')) return null;

    const name = doc.querySelector('h1')?.textContent?.trim() || '';
    const websiteEl = doc.querySelector('a[href*="http"]:not([href*="wellfound.com"]):not([href*="linkedin.com"])');
    const website = websiteEl?.getAttribute('href') || '';

    let size = '';
    let industry = '';
    let location = '';

    // Look for company info badges
    const infoEls = doc.querySelectorAll('[class*="infoBadge"], [class*="metaItem"]');
    infoEls.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.includes('employees')) {
        size = text;
      } else if (text.includes('Location')) {
        location = text.replace('Location', '').trim();
      } else {
        industry = text;
      }
    });

    const descEl = doc.querySelector('[class*="companyDescription"]') || doc.querySelector('.description') || doc.querySelector('[class*="tagline"]');
    const description = descEl?.textContent?.trim() || '';

    if (!name) return null;

    return {
      name,
      website,
      linkedin: '',
      industry,
      size,
      location,
      description,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }

  extractPost(_doc: Document, _url: string): Partial<HiringPost> | null {
    return null;
  }
}
