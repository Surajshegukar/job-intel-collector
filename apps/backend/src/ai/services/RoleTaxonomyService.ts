export class RoleTaxonomyService {
  private static ROLE_RULES: Array<{ keywords: string[]; role: string }> = [
    { keywords: ['frontend', 'front-end', 'ui', 'react developer', 'angular developer'], role: 'Frontend Developer' },
    { keywords: ['backend', 'back-end', 'node developer', 'python developer', 'java developer', 'api'], role: 'Backend Developer' },
    { keywords: ['fullstack', 'full-stack', 'full stack', 'web developer'], role: 'Full Stack Developer' },
    { keywords: ['devops', 'site reliability', 'sre', 'ci/cd', 'infrastructure'], role: 'DevOps Engineer' },
    { keywords: ['cloud engineer', 'aws engineer', 'azure engineer'], role: 'Cloud Engineer' },
    { keywords: ['data analyst', 'bi analyst', 'business intelligence'], role: 'Data Analyst' },
    { keywords: ['machine learning', 'ml ', 'mlops', 'computer vision', 'nlp'], role: 'ML Engineer' },
    { keywords: ['ai engineer', 'artificial intelligence', 'llm', 'generative ai', 'openai'], role: 'AI Engineer' },
    { keywords: ['cybersecurity', 'security analyst', 'infosec', 'penetration', 'secops'], role: 'Cybersecurity Engineer' },
    { keywords: ['product manager', 'associate product manager', 'pm'], role: 'Product Manager' },
    { keywords: ['qa engineer', 'quality assurance', 'testing', 'sdet'], role: 'QA Engineer' },
    { keywords: ['mobile developer', 'ios developer', 'android developer', 'react native', 'flutter'], role: 'Mobile Developer' }
  ];

  private static SENIORITY_RULES: Array<{ keywords: string[]; seniority: string }> = [
    { keywords: ['intern', 'co-op'], seniority: 'Intern' },
    { keywords: ['fresher', 'entry level', 'graduate'], seniority: 'Fresher' },
    { keywords: ['junior', 'jr', 'associate'], seniority: 'Junior' },
    { keywords: ['mid', 'mid-level', 'ii', '2'], seniority: 'Mid-Level' },
    { keywords: ['senior', 'sr', 'iii', '3', 'lead engineer', 'staff'], seniority: 'Senior' },
    { keywords: ['tech lead', 'technical lead', 'lead developer', 'principal'], seniority: 'Lead' },
    { keywords: ['manager', 'director', 'vp', 'head of', 'cto'], seniority: 'Manager' }
  ];

  /**
   * Classify a job title into a standardized role category.
   */
  static classifyRole(title: string, description: string = ''): string {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    for (const rule of this.ROLE_RULES) {
      if (rule.keywords.some(kw => combinedText.includes(kw))) {
        return rule.role;
      }
    }
    
    return 'Software Engineer (General)';
  }

  /**
   * Classify a job title into a standardized seniority level.
   */
  static classifySeniority(title: string): string {
    const cleanTitle = title.toLowerCase();
    
    for (const rule of this.SENIORITY_RULES) {
      if (rule.keywords.some(kw => cleanTitle.includes(kw))) {
        return rule.seniority;
      }
    }
    
    return 'Mid-Level'; // default fallback
  }
}
