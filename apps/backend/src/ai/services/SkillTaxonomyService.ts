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

  private static CATEGORY_MAP: Record<string, 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'Testing' | 'Mobile' | 'AI/ML' | 'General'> = {
    'React': 'Frontend',
    'Vue.js': 'Frontend',
    'Angular': 'Frontend',
    'Tailwind CSS': 'Frontend',
    'Next.js': 'Frontend',
    'HTML': 'Frontend',
    'CSS': 'Frontend',
    'JavaScript': 'Backend',
    'TypeScript': 'Backend',
    'Python': 'Backend',
    'Go': 'Backend',
    'Node.js': 'Backend',
    'Express': 'Backend',
    'Ruby': 'Backend',
    'PHP': 'Backend',
    'MongoDB': 'Database',
    'PostgreSQL': 'Database',
    'MySQL': 'Database',
    'Redis': 'Database',
    'AWS': 'Cloud',
    'GCP': 'Cloud',
    'Docker': 'DevOps',
    'Kubernetes': 'DevOps',
    'Git': 'DevOps',
    'Jest': 'Testing',
    'Cypress': 'Testing',
    'React Native': 'Mobile',
    'Flutter': 'Mobile',
    'TensorFlow': 'AI/ML',
    'PyTorch': 'AI/ML',
    'Large Language Models': 'AI/ML',
    'RAG': 'AI/ML',
    'Machine Learning': 'AI/ML'
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
  static getCategory(normalizedSkillName: string): 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'Testing' | 'Mobile' | 'AI/ML' | 'General' {
    return this.CATEGORY_MAP[normalizedSkillName] || 'General';
  }
}
