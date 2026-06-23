"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillExtractionService = void 0;
const Skill_1 = require("../models/Skill");
const SKILL_CATALOG = [
    // Languages
    { name: 'JavaScript', category: 'Programming Languages', keywords: ['javascript', 'js', 'es6'] },
    { name: 'TypeScript', category: 'Programming Languages', keywords: ['typescript', 'ts'] },
    { name: 'Python', category: 'Programming Languages', keywords: ['python', 'py'] },
    { name: 'Java', category: 'Programming Languages', keywords: ['java'] },
    { name: 'C++', category: 'Programming Languages', keywords: ['c\\+\\+'] },
    { name: 'C#', category: 'Programming Languages', keywords: ['c#', 'csharp'] },
    { name: 'Ruby', category: 'Programming Languages', keywords: ['ruby', 'rails'] },
    { name: 'Go', category: 'Programming Languages', keywords: ['golang', '\\bgo\\b'] }, // Case-sensitive or bounded
    { name: 'Rust', category: 'Programming Languages', keywords: ['rust'] },
    { name: 'PHP', category: 'Programming Languages', keywords: ['php'] },
    { name: 'Kotlin', category: 'Programming Languages', keywords: ['kotlin'] },
    { name: 'Swift', category: 'Programming Languages', keywords: ['swift'] },
    { name: 'SQL', category: 'Programming Languages', keywords: ['sql'] },
    { name: 'HTML', category: 'Programming Languages', keywords: ['html', 'html5'] },
    { name: 'CSS', category: 'Programming Languages', keywords: ['css', 'css3'] },
    // Frontend
    { name: 'React', category: 'Frontend', keywords: ['react', 'reactjs', 'react.js'] },
    { name: 'Angular', category: 'Frontend', keywords: ['angular', 'angularjs'] },
    { name: 'Vue.js', category: 'Frontend', keywords: ['vue', 'vuejs', 'vue.js'] },
    { name: 'Next.js', category: 'Frontend', keywords: ['nextjs', 'next.js'] },
    { name: 'Svelte', category: 'Frontend', keywords: ['svelte'] },
    { name: 'Tailwind CSS', category: 'Frontend', keywords: ['tailwind', 'tailwindcss'] },
    { name: 'Redux', category: 'Frontend', keywords: ['redux'] },
    { name: 'Webpack', category: 'Frontend', keywords: ['webpack'] },
    { name: 'Vite', category: 'Frontend', keywords: ['vite'] },
    // Backend
    { name: 'Node.js', category: 'Backend', keywords: ['node', 'nodejs', 'node.js'] },
    { name: 'Express.js', category: 'Backend', keywords: ['express', 'expressjs'] },
    { name: 'NestJS', category: 'Backend', keywords: ['nestjs', 'nest.js'] },
    { name: 'Django', category: 'Backend', keywords: ['django'] },
    { name: 'FastAPI', category: 'Backend', keywords: ['fastapi'] },
    { name: 'Flask', category: 'Backend', keywords: ['flask'] },
    { name: 'Spring Boot', category: 'Backend', keywords: ['spring boot', 'springboot', 'spring-boot'] },
    { name: 'GraphQL', category: 'Backend', keywords: ['graphql'] },
    { name: 'REST APIs', category: 'Backend', keywords: ['rest api', 'restful api', 'rest apis'] },
    // Databases
    { name: 'MongoDB', category: 'Databases', keywords: ['mongodb', 'mongo'] },
    { name: 'PostgreSQL', category: 'Databases', keywords: ['postgres', 'postgresql'] },
    { name: 'MySQL', category: 'Databases', keywords: ['mysql'] },
    { name: 'Redis', category: 'Databases', keywords: ['redis'] },
    { name: 'DynamoDB', category: 'Databases', keywords: ['dynamodb'] },
    { name: 'Elasticsearch', category: 'Databases', keywords: ['elasticsearch'] },
    // Cloud & DevOps
    { name: 'AWS', category: 'Cloud & DevOps', keywords: ['aws', 'amazon web services', 'ec2', 's3'] },
    { name: 'Docker', category: 'Cloud & DevOps', keywords: ['docker'] },
    { name: 'Kubernetes', category: 'Cloud & DevOps', keywords: ['kubernetes', 'k8s'] },
    { name: 'Terraform', category: 'Cloud & DevOps', keywords: ['terraform'] },
    { name: 'Google Cloud Platform', category: 'Cloud & DevOps', keywords: ['gcp', 'google cloud'] },
    { name: 'Azure', category: 'Cloud & DevOps', keywords: ['azure'] },
    { name: 'CI/CD', category: 'Cloud & DevOps', keywords: ['ci/cd', 'github actions', 'jenkins', 'gitlab ci'] },
    { name: 'Git', category: 'Cloud & DevOps', keywords: ['\\bgit\\b', 'github'] },
    // Mobile
    { name: 'React Native', category: 'Mobile', keywords: ['react native', 'reactnative'] },
    { name: 'Flutter', category: 'Mobile', keywords: ['flutter'] },
    // AI & Data Science
    { name: 'Machine Learning', category: 'AI & Data Science', keywords: ['machine learning', 'ml'] },
    { name: 'Deep Learning', category: 'AI & Data Science', keywords: ['deep learning', 'dl'] },
    { name: 'NLP', category: 'AI & Data Science', keywords: ['nlp', 'natural language processing'] },
    { name: 'TensorFlow', category: 'AI & Data Science', keywords: ['tensorflow'] },
    { name: 'PyTorch', category: 'AI & Data Science', keywords: ['pytorch'] },
    { name: 'Large Language Models', category: 'AI & Data Science', keywords: ['llm', 'llms', 'large language model'] },
    { name: 'RAG', category: 'AI & Data Science', keywords: ['rag', 'retrieval-augmented generation'] }
];
class SkillExtractionService {
    /**
     * Extract skills from description text.
     */
    static extractSkills(description) {
        if (!description)
            return [];
        const foundSkills = new Set();
        for (const skillDef of SKILL_CATALOG) {
            for (const keyword of skillDef.keywords) {
                // Use word boundaries. If keyword contains regex chars (like ++ or #), handle appropriately.
                let patternStr = keyword;
                if (!keyword.startsWith('\\b') && /^[a-zA-Z0-9]/.test(keyword)) {
                    patternStr = '\\b' + patternStr;
                }
                if (!keyword.endsWith('\\b') && /[a-zA-Z0-9]$/.test(keyword)) {
                    patternStr = patternStr + '\\b';
                }
                // Custom case for Golang / Go to avoid general word "go" match
                const isCaseSensitive = keyword === '\\bgo\\b';
                const flags = isCaseSensitive ? '' : 'i';
                const regex = new RegExp(patternStr, flags);
                if (regex.test(description)) {
                    foundSkills.add(skillDef.name);
                    break; // Stop testing other keywords for this skill
                }
            }
        }
        return Array.from(foundSkills);
    }
    /**
     * Update frequencies for a list of skills.
     */
    static async updateSkillFrequencies(skills) {
        if (!skills || skills.length === 0)
            return;
        for (const skillName of skills) {
            // Find matching skill definition to assign proper category
            const skillDef = SKILL_CATALOG.find(s => s.name === skillName);
            const category = skillDef ? skillDef.category : 'General';
            await Skill_1.Skill.findOneAndUpdate({ name: skillName }, {
                $set: { category },
                $inc: { frequency: 1 }
            }, { upsert: true, new: true });
        }
    }
    /**
     * Decrement frequencies when a job is deleted.
     */
    static async decrementSkillFrequencies(skills) {
        if (!skills || skills.length === 0)
            return;
        for (const skillName of skills) {
            await Skill_1.Skill.findOneAndUpdate({ name: skillName }, { $inc: { frequency: -1 } }, { new: true });
        }
        // Clean up skills with <= 0 frequency if needed
        await Skill_1.Skill.deleteMany({ frequency: { $lte: 0 } });
    }
}
exports.SkillExtractionService = SkillExtractionService;
