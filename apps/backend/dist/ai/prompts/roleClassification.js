"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleClassificationPrompt = void 0;
exports.roleClassificationPrompt = `
Analyze the job title and description. Classify them into one of the standard Role Categories and Seniority Levels.

Standard Role Categories (choose the closest matching category):
- Frontend Developer
- Backend Developer
- Full Stack Developer
- DevOps Engineer
- Cloud Engineer
- Data Analyst
- ML Engineer
- AI Engineer
- Cybersecurity Engineer
- Product Manager
- QA Engineer
- Mobile Developer
- Software Engineer (General)

Standard Seniority Levels:
- Intern
- Fresher
- Junior
- Mid-Level
- Senior
- Lead
- Manager
- Director / Executive

Format your response as:
{
  "roleCategory": "Frontend Developer",
  "seniority": "Junior"
}
`;
