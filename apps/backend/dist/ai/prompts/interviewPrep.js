"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewPrepPrompt = void 0;
exports.interviewPrepPrompt = `
Generate typical technical and behavioral interview preparation topics and questions based on the job requirements.
Provide 3 to 5 realistic questions, each with a brief structured suggested answer, categorized by a technical topic, and marked with a difficulty level (easy, medium, hard).

Format your response as a JSON array of questions:
{
  "topics": ["React Hooks", "TypeScript Types", "REST API design"],
  "questions": [
    {
      "question": "What is the difference between an interface and a type in TypeScript?",
      "suggestedAnswer": "Interfaces are open for extension (declaration merging), whereas types can define unions, primitives, and tuples and are closed.",
      "topic": "TypeScript",
      "difficulty": "medium"
    }
  ]
}
`;
