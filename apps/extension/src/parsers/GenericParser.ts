import type { SiteParser } from './ParserInterface';
import type { Job, Company, HiringPost } from '../types';
import { createKeywordRegex } from '../utils/regex';

export class GenericParser implements SiteParser {
  /**
   * Parse schema.org JSON-LD if available
   */
  private findJsonLd(doc: Document, typeName: string): any {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const json = JSON.parse(script.textContent || '');
        // JSON-LD can be a single object or an array of objects
        if (Array.isArray(json)) {
          const match = json.find(item => item['@type'] === typeName);
          if (match) return match;
        } else if (json['@graph'] && Array.isArray(json['@graph'])) {
          const match = json['@graph'].find((item: any) => item['@type'] === typeName);
          if (match) return match;
        } else if (json['@type'] === typeName) {
          return json;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    return null;
  }

  extractJob(doc: Document, url: string): Partial<Job> | null {
    // 1. Try to find JobPosting JSON-LD (standard on Lever, Greenhouse, etc.)
    const jobLd = this.findJsonLd(doc, 'JobPosting');
    if (jobLd) {
      const title = jobLd.title || '';
      const company = jobLd.hiringOrganization?.name || '';
      let location = '';
      if (jobLd.jobLocation) {
        const loc = jobLd.jobLocation.address;
        if (loc) {
          location = [loc.addressLocality, loc.addressRegion, loc.addressCountry].filter(Boolean).join(', ');
        } else if (jobLd.jobLocation.name) {
          location = jobLd.jobLocation.name;
        }
      }
      
      const description = jobLd.description || '';
      const employmentType = Array.isArray(jobLd.employmentType) ? jobLd.employmentType[0] : jobLd.employmentType || '';
      const skills = Array.isArray(jobLd.skills) ? jobLd.skills : (jobLd.skills ? [jobLd.skills] : []);

      // Guess experience from description
      let experience = '';
      const expMatch = description.replace(/<[^>]*>/g, '').match(/(\d+)\+?\s*(?:-|to)?\s*(?:\d+)?\s*years?\s+of\s+experience/i);
      if (expMatch) {
        experience = `${expMatch[1]}+ years`;
      }

      if (title) {
        return {
          title,
          company: company || this.guessCompanyName(url),
          location: location || 'Remote / Unknown',
          experience,
          employmentType,
          skills,
          description,
          source: this.getHostLabel(url),
          url,
          tags: [],
          parserVersion: '1.0.0',
          savedAt: new Date().toISOString()
        };
      }
    }

    // 2. DOM-based heuristics fallback
    const title = 
      doc.querySelector('h1')?.textContent?.trim() ||
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.title.split('-')[0]?.trim() || '';

    const company = this.guessCompanyName(url);

    // Look for description tags
    const descEl = 
      doc.querySelector('article') ||
      doc.querySelector('[class*="job-description"]') ||
      doc.querySelector('[class*="description"]') ||
      doc.querySelector('main');
    const description = descEl?.innerHTML?.trim() || doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Extracted Skills tags from page
    const skills: string[] = [];
    const keywords = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'AWS', 'Docker', 'SQL'];
    const textContent = doc.body.innerText;
    keywords.forEach(kw => {
      if (createKeywordRegex(kw).test(textContent)) {
        skills.push(kw);
      }
    });

    if (!title) return null;

    return {
      title,
      company,
      location: 'Unknown',
      skills,
      description: description || textContent.substring(0, 1000),
      source: this.getHostLabel(url),
      url,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }

  extractCompany(doc: Document, url: string): Partial<Company> | null {
    // 1. Try to find Organization/NGO/LocalBusiness JSON-LD
    const companyLd = this.findJsonLd(doc, 'Organization') || this.findJsonLd(doc, 'AboutPage');
    if (companyLd) {
      const name = companyLd.name || doc.title.split('-')[0]?.trim() || '';
      const website = companyLd.url || url;
      const description = companyLd.description || '';
      if (name) {
        return {
          name,
          website,
          linkedin: '',
          description,
          tags: [],
          parserVersion: '1.0.0',
          savedAt: new Date().toISOString()
        };
      }
    }

    // 2. DOM fallback
    const name = doc.title.split('|')[0]?.split('-')[0]?.trim() || this.guessCompanyName(url);
    const website = new URL(url).origin;
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                 doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

    return {
      name,
      website,
      linkedin: '',
      description: desc,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }

  extractPost(_doc: Document, _url: string): Partial<HiringPost> | null {
    // Generic sites generally do not host short update posts, return null
    return null;
  }

  // Utilities
  private guessCompanyName(urlStr: string): string {
    try {
      const url = new URL(urlStr);
      const host = url.hostname.replace('www.', '');
      const first = host.split('.')[0] || '';
      return first.charAt(0).toUpperCase() + first.slice(1);
    } catch (e) {
      return 'Unknown';
    }
  }

  private getHostLabel(urlStr: string): string {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace('www.', '');
    } catch (e) {
      return 'Web';
    }
  }
}
