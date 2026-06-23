/**
 * Safely creates a RegExp for matching a keyword as a standalone word.
 * Handles special characters like C++, C#, .NET, etc. without crashing or boundary issues.
 */
export function createKeywordRegex(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const start = /^\w/.test(keyword) ? '\\b' : '(?<!\\w)';
  const end = /\w$/.test(keyword) ? '\\b' : '(?!\\w)';
  return new RegExp(start + escaped + end, 'i');
}
