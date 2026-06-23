/**
 * Helper to trigger browser downloads for files
 */
function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes values for CSV cells
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return '';
  }
  
  let stringValue = '';
  if (Array.isArray(val)) {
    stringValue = val.join(', ');
  } else if (typeof val === 'object') {
    stringValue = JSON.stringify(val);
  } else {
    stringValue = String(val);
  }

  // Escape quotes and wrap in quotes if commas/newlines/quotes exist
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Convert list of objects to CSV string
 */
function convertToCsv<T extends Record<string, any>>(data: T[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Headers row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => escapeCsvValue(row[header]));
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export jobs data
 */
export function exportJobsJson(jobs: any[]) {
  downloadFile(JSON.stringify(jobs, null, 2), `jobs-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

export function exportJobsCsv(jobs: any[]) {
  const cleanJobs = jobs.map(job => {
    // Flatten or clean job fields for clean spreadsheet presentation
    return {
      ID: job.id,
      Title: job.title,
      Company: job.company,
      Location: job.location,
      Experience: job.experience || '',
      Salary: job.salary || '',
      EmploymentType: job.employmentType || '',
      Skills: job.skills,
      Description: job.description,
      Source: job.source,
      URL: job.url,
      Tags: job.tags,
      ParserVersion: job.parserVersion,
      SavedAt: job.savedAt,
      Notes: job.notes || ''
    };
  });
  const csvContent = convertToCsv(cleanJobs);
  downloadFile(csvContent, `jobs-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export companies data
 */
export function exportCompaniesJson(companies: any[]) {
  downloadFile(JSON.stringify(companies, null, 2), `companies-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

export function exportCompaniesCsv(companies: any[]) {
  const cleanCompanies = companies.map(company => ({
    ID: company.id,
    Name: company.name,
    Website: company.website || '',
    LinkedIn: company.linkedin || '',
    Industry: company.industry || '',
    Size: company.size || '',
    Location: company.location || '',
    Description: company.description || '',
    Tags: company.tags,
    ParserVersion: company.parserVersion,
    SavedAt: company.savedAt,
    Notes: company.notes || ''
  }));
  const csvContent = convertToCsv(cleanCompanies);
  downloadFile(csvContent, `companies-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export posts data
 */
export function exportPostsJson(posts: any[]) {
  downloadFile(JSON.stringify(posts, null, 2), `posts-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

export function exportPostsCsv(posts: any[]) {
  const cleanPosts = posts.map(post => ({
    ID: post.id,
    Author: post.author,
    AuthorProfile: post.authorProfile || '',
    Company: post.company || '',
    Content: post.content,
    Source: post.source,
    URL: post.url,
    Tags: post.tags,
    ParserVersion: post.parserVersion,
    SavedAt: post.savedAt
  }));
  const csvContent = convertToCsv(cleanPosts);
  downloadFile(csvContent, `posts-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}
