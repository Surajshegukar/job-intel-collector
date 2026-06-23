export class SkillTaxonomyService {
  private static SYNONYM_MAP: Record<string, string> = {
    // Frontend
    'reactjs': 'React',
    'react.js': 'React',
    'react': 'React',
    'vuejs': 'Vue.js',
    'vue.js': 'Vue.js',
    'vue': 'Vue.js',
    'angularjs': 'Angular',
    'angular.js': 'Angular',
    'angular': 'Angular',
    'tailwindcss': 'Tailwind CSS',
    'tailwind': 'Tailwind CSS',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    
    // Languages
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'python3': 'Python',
    'py': 'Python',
    'golang': 'Go',
    
    // Backend & Databases
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'node': 'Node.js',
    'expressjs': 'Express',
    'express': 'Express',
    'mongodb': 'MongoDB',
    'mongo': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mysql': 'MySQL',
    'redis': 'Redis',
    
    // DevOps & Cloud
    'aws': 'AWS',
    'amazon web services': 'AWS',
    'gcp': 'GCP',
    'google cloud': 'GCP',
    'google cloud platform': 'GCP',
    'docker': 'Docker',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes'
  };

  private static CATEGORY_MAP: Record<string, string> = {
    'React': 'Frontend',
    'Vue.js': 'Frontend',
    'Angular': 'Frontend',
    'Tailwind CSS': 'Frontend',
    'Next.js': 'Frontend',
    'JavaScript': 'Languages',
    'TypeScript': 'Languages',
    'Python': 'Languages',
    'Go': 'Languages',
    'Node.js': 'Backend',
    'Express': 'Backend',
    'MongoDB': 'Databases',
    'PostgreSQL': 'Databases',
    'MySQL': 'Databases',
    'Redis': 'Databases',
    'AWS': 'Cloud/DevOps',
    'GCP': 'Cloud/DevOps',
    'Docker': 'Cloud/DevOps',
    'Kubernetes': 'Cloud/DevOps'
  };

  /**
   * Normalize a skill name string to its canonical form.
   */
  static normalizeSkill(skill: string): string {
    const clean = skill.trim().toLowerCase();
    if (this.SYNONYM_MAP[clean]) {
      return this.SYNONYM_MAP[clean];
    }
    // Return capitalized title-case by default if not mapped
    return skill
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /**
   * Normalize an array of skills.
   */
  static normalizeSkills(skills: string[]): string[] {
    const unique = new Set(skills.map(s => this.normalizeSkill(s)));
    return Array.from(unique);
  }

  /**
   * Get the category of a normalized skill name.
   */
  static getCategory(normalizedSkillName: string): string {
    return this.CATEGORY_MAP[normalizedSkillName] || 'Other';
  }
}
