"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillExtractionPrompt = void 0;
exports.skillExtractionPrompt = `
Analyze the following Job Description text and extract all relevant technical, soft, and domain-specific skills.
List the skills as clean, plain-text strings. Do not include duplicates or version numbers unless critical (e.g. use 'React' instead of 'React 18' or 'ReactJS').

Format your response as a JSON array of strings:
{
  "skills": ["Skill1", "Skill2", "Skill3"]
}
`;
