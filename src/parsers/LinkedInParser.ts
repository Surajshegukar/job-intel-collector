import type { SiteParser } from './ParserInterface';
import type { Job, Company, HiringPost } from '../types';
import { createKeywordRegex } from '../utils/regex';

export class LinkedInParser implements SiteParser {
  extractJob(doc: Document, url: string): Partial<Job> | null {
    if (!url.includes('linkedin.com/jobs')) return null;

    const detailsPane = doc.querySelector('.jobs-search__job-details--wrapper, .jobs-search__job-details--container, .jobs-search-two-pane__details, .job-view-layout, #main-content');
    const container = detailsPane || doc;

    // Helper to get text from selector inside the container
    const getText = (selector: string): string => {
      const el = container.querySelector(selector);
      return el?.textContent?.trim() || '';
    };

    // Attempt to extract Title
    let title =
      getText('.job-details-jobs-unified-top-card__job-title') ||
      getText('.jobs-unified-top-card__job-title') ||
      getText('.jobs-details-top-card__job-title') ||
      container.querySelector('h1')?.textContent?.trim() ||
      '';
    title = title.replace(/\s+/g, ' ').trim();

    // Attempt to extract Company name
    const companyEl =
      container.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
      container.querySelector('.jobs-unified-top-card__company-name a') ||
      container.querySelector('.job-details-jobs-unified-top-card__company-name') ||
      container.querySelector('.jobs-unified-top-card__company-name') ||
      container.querySelector('.jobs-details-top-card__company-name');
    const company = companyEl?.textContent?.trim() || '';

    // Attempt to extract Location
    let location =
      container.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container span span')?.textContent?.trim() ||
      container.querySelector('[class*="tertiary-description-container"] span span')?.textContent?.trim() ||
      getText('.job-details-jobs-unified-top-card__tertiary-description-container') ||
      getText('.jobs-unified-top-card__bullet') ||
      getText('.jobs-details-jobs-unified-top-card__primary-description-container span:nth-of-type(2)') ||
      getText('.jobs-unified-top-card__primary-description') ||
      '';
    if (location.includes('·')) {
      location = location.split('·')[0].trim();
    }
    location = location.replace(/·/g, '').replace(/\s+/g, ' ').trim();

    // Attempt to extract Description HTML/Text
    const descEl =
      container.querySelector('.jobs-description__content') ||
      container.querySelector('#job-details') ||
      container.querySelector('.jobs-description');
    let description = descEl?.innerHTML?.trim() || descEl?.textContent?.trim() || '';

    // Semantic description fallback if standard ID/class is missing or changed
    if (!description) {
      const headings = container.querySelectorAll('h2, h3, h4');
      for (const h of headings) {
        const text = h.textContent?.trim().toLowerCase();
        if (text === 'about the job' || text === 'job description' || text === 'description') {
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

    // Extract Employment Type and Experience from insights
    let employmentType = '';
    let experience = '';
    const insights = container.querySelectorAll(
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

    // Try to parse salary if visible
    let salary = '';
    const textToScan = container.textContent || doc.body.innerText || '';
    const salaryMatch = textToScan.match(/(\$\d+[\d,]*\s*-\s*\$\d+[\d,]*)|(\$\d+[\d,]*\s*\/yr)|(\$\d+[\d,]*\s*\/hr)/i);
    if (salaryMatch) {
      salary = salaryMatch[0];
    }

    // Try to extract skills list
    const skills: string[] = [];
    const skillElements = container.querySelectorAll('.jobs-description__content-skills-item, .jobs-opinion-card__skills-list-item');
    skillElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text) skills.push(text);
    });

    // If description mentions common programming skills, add them as tags
    const commonSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'C++', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB'];
    const descText = descEl?.textContent || '';
    commonSkills.forEach(skill => {
      if (createKeywordRegex(skill).test(descText) && !skills.includes(skill)) {
        skills.push(skill);
      }
    });

    if (!title && !company) return null;

    // Extract recruiter details specifically from the Meet the hiring team card/container
    let recruiterName = '';
    let recruiterUrl = '';
    const recruiterContainer = container.querySelector(
      '.job-details-people-who-can-help__section--two-pane, .jobs-post-author, [class*="people-who-can-help"]'
    );
    if (recruiterContainer) {
      const link = recruiterContainer.querySelector('a[href*="/in/"]');
      if (link) {
        const href = link.getAttribute('href') || '';
        try {
          recruiterUrl = href.startsWith('http') ? href : new URL(href, url).href;
        } catch {
          recruiterUrl = href;
        }
      }
      recruiterName = recruiterContainer.querySelector('.jobs-poster__name, strong, [class*="poster__name"]')?.textContent?.trim() || '';
      recruiterName = recruiterName.replace(/\s+/g, ' ').trim();
    }

    // Fallback recruiter check
    if (!recruiterName) {
      const fallbackRecruiterContainer = container.querySelector('.hirer-card__hirer-information, .jobs-poster');
      if (fallbackRecruiterContainer) {
        const link = fallbackRecruiterContainer.querySelector('a[href*="/in/"]') || fallbackRecruiterContainer.closest('a') || fallbackRecruiterContainer.querySelector('a');
        if (link) {
          const href = link.getAttribute('href') || '';
          try {
            recruiterUrl = href.startsWith('http') ? href : new URL(href, url).href;
          } catch {
            recruiterUrl = href;
          }
        }
        recruiterName = fallbackRecruiterContainer.querySelector('strong, .jobs-poster__name')?.textContent?.trim() || fallbackRecruiterContainer.textContent?.trim() || '';
        recruiterName = recruiterName.replace(/\s+/g, ' ').trim();
      }
    }

    // Extract company LinkedIn URL
    const companyLinkEl = container.querySelector('.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a, .jobs-details-top-card__company-name a, [class*="company-name"] a, a[href*="/company/"]');
    let companyUrl = '';
    if (companyLinkEl) {
      const href = companyLinkEl.getAttribute('href') || '';
      try {
        const fullHref = href.startsWith('http') ? href : new URL(href, url).href;
        companyUrl = fullHref.split('/life')[0].split('/about')[0].split('?')[0]; // Clean suffix and query params
      } catch (e) {
        companyUrl = href;
      }
    }

    return {
      title,
      company,
      location,
      experience: experience.trim(),
      salary: salary.trim(),
      employmentType: employmentType.trim(),
      skills,
      description,
      source: 'LinkedIn',
      url,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString(),
      recruiterName,
      recruiterUrl,
      companyUrl
    };
  }

  extractCompany(doc: Document, url: string): Partial<Company> | null {
    if (!url.includes('linkedin.com/company')) return null;

    const getText = (selector: string): string => {
      const el = doc.querySelector(selector);
      return el?.textContent?.trim() || '';
    };

    const name =
      getText('.org-top-card-summary__title') ||
      doc.querySelector('h1')?.textContent?.trim() || '';

    // Parse using semantic dl overview layout
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
    let website = parsedWebsite || websiteEl?.getAttribute('href') || '';
    if (website && !website.startsWith('http')) {
      try {
        website = new URL(website, url).href;
      } catch {
        // Keep original
      }
    }

    const industry = parsedIndustry || getText('.org-top-card-summary-info-list__info-item') || getText('.org-top-card-summary__industry') || '';
    
    const sizeFallback = doc.querySelector('[href*="currentCompany"] span')?.textContent?.trim() || '';
    const size = parsedSize || sizeFallback || getText('.org-top-card-summary__employee-count') || '';
    
    const location = parsedLocation || getText('.org-top-card-summary-info-list__info-item:nth-of-type(2)') || '';
    
    const description = 
      getText('.org-page-details-module__card-spacing p') ||
      getText('.org-about-module__margin-bottom p') ||
      getText('.org-about-us-organization-description__text') || 
      getText('.org-about-us-organization-description__text-wrap') || '';

    if (!name) return null;

    // Merge specialties into description or notes if needed, or keep it clean
    let fullDescription = description.trim();
    if (parsedSpecialties) {
      fullDescription += `\n\nSpecialties: ${parsedSpecialties}`;
    }

    return {
      name,
      website,
      linkedin: url,
      industry: industry.trim(),
      size: size.trim(),
      location: location.trim(),
      description: fullDescription,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }

  extractPost(doc: Document, url: string): Partial<HiringPost> | null {
    if (!url.includes('linkedin.com')) return null;

    // Scope the selector to the post container to avoid matching global navigation links (like the logged-in user's profile)
    const postContainer = 
      doc.querySelector('.feed-shared-update-v2, article, [role="listitem"], [class*="update-v2"], [class*="feed-shared-update"]') ||
      doc.querySelector('[data-testid="expandable-text-box"]')?.closest('.feed-shared-update-v2, article, [role="listitem"], div') ||
      doc;

    const getText = (selector: string): string => {
      const el = postContainer.querySelector(selector);
      return el?.textContent?.trim() || '';
    };

    let author = '';
    let authorProfile = '';

    // Try finding the profile link inside the post container
    const profileLinkEl = 
      postContainer.querySelector('a[href*="/in/"]') || 
      postContainer.querySelector('.update-components-actor__meta-link') ||
      postContainer.querySelector('.feed-shared-actor__container a');

    if (profileLinkEl) {
      const href = profileLinkEl.getAttribute('href') || '';
      try {
        authorProfile = href.startsWith('http') ? href : new URL(href, url).href;
      } catch {
        authorProfile = href;
      }

      // Extract author name from the text content of the link
      let text = profileLinkEl.textContent?.trim() || '';
      if (text) {
        text = text.split('\n')[0].split('•')[0].split('·')[0].trim();
        if (text) author = text;
      }

      // If no name text, try fetching from the avatar image alt
      if (!author) {
        const img = profileLinkEl.querySelector('img');
        if (img) {
          const alt = img.getAttribute('alt') || '';
          const match = alt.match(/View\s+([^’'’]+)’s\s+profile/i) || alt.match(/([^’'’]+)/i);
          if (match && match[1]) author = match[1].trim();
        }
      }
    }

    // Fallbacks for author name using common classes inside the post container
    if (!author) {
      author = 
        getText('.update-components-actor__title span span') ||
        getText('.feed-shared-actor__name') ||
        getText('.update-components-actor__title') ||
        '';
      author = author.split('\n')[0].split('•')[0].split('·')[0].trim();
    }

    // Secondary fallback using aria-label of the actor container inside the post container
    if (!author) {
      const actorLabelEl = postContainer.querySelector('[aria-label*="profile"], [aria-label*="Profile"]');
      if (actorLabelEl) {
        const label = actorLabelEl.getAttribute('aria-label') || '';
        const match = label.match(/^([^,]+),/);
        if (match && match[1]) author = match[1].trim();
      }
    }

    const contentEl =
      postContainer.querySelector('[data-testid="expandable-text-box"]') ||
      postContainer.querySelector('.feed-shared-update-v2__commentary span') ||
      postContainer.querySelector('.update-components-text') ||
      postContainer.querySelector('.feed-shared-update-v2__commentary') ||
      postContainer.querySelector('.feed-shared-update-v2__description');
    const content = (contentEl as HTMLElement)?.innerText?.trim() || contentEl?.textContent?.trim() || '';

    // Find post URL inside the post container
    const postLinkEl = postContainer.querySelector('a[href*="/posts/"], a[href*="feed/update"]');
    let finalUrl = url;
    if (postLinkEl) {
      const href = postLinkEl.getAttribute('href') || '';
      try {
        finalUrl = href.startsWith('http') ? href : new URL(href, url).href;
      } catch {
        finalUrl = href;
      }
    }

    // Guess company name
    let company = '';
    const bioEl = 
      postContainer.querySelector('.update-components-actor__description') || 
      postContainer.querySelector('.feed-shared-actor__description') ||
      postContainer.querySelector('.update-components-actor__meta-link + div') ||
      postContainer.querySelector('[class*="actor__description"]');
    if (bioEl) {
      const authorBio = bioEl.textContent?.trim() || '';
      const companyMatch = authorBio.match(/at\s+([A-Za-z0-9\s\-&]+)/i) || authorBio.match(/Founder\s+&\s+Director\s+@\s+([A-Za-z0-9\s\-&]+)/i) || authorBio.match(/@\s+([A-Za-z0-9\s\-&]+)/i);
      if (companyMatch && companyMatch[1]) {
        company = companyMatch[1].trim();
      }
    }

    if (!company && content) {
      const companyMatch = content.match(/Company\s*:\s*([^\n\r<]+)/i) || content.match(/hiring\s+for\s+([^\n\r<]+)/i);
      if (companyMatch && companyMatch[1]) {
        company = companyMatch[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
      }
    }

    if (!author && !content) return null;

    return {
      author,
      authorProfile: authorProfile ? new URL(authorProfile, url).href : '',
      company: company.trim(),
      content,
      source: 'LinkedIn',
      url: finalUrl,
      tags: [],
      parserVersion: '1.0.0',
      savedAt: new Date().toISOString()
    };
  }
}
