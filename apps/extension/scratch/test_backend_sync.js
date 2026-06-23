const BASE_URL = 'http://localhost:5000/api';

async function testSync() {
  console.log('=== Starting Backend Sync End-to-End Test ===');
  
  // 1. Authenticate
  console.log('Testing Authentication (POST /auth/login)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'suraj@example.com',
      password: 'password123'
    })
  });
  
  if (!loginRes.ok) {
    console.error('Authentication failed!', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  
  const authData = await loginRes.json();
  const token = authData.token;
  console.log('Auth successful. Token obtained:', token.substring(0, 15) + '...');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test Job Sync
  console.log('\nTesting Job Sync (POST /jobs)...');
  const jobPayload = {
    title: 'Senior Software Engineer (Test Ingestion)',
    companyName: 'Acme Test Labs',
    location: 'Remote, US',
    experience: '4+ years',
    salary: '$130k - $165k',
    description: 'We are looking for a software developer experienced in Node.js, Express, and MongoDB. Experience with TypeScript is preferred.',
    skills: ['Node.js', 'Express', 'MongoDB', 'TypeScript'],
    source: 'Extension Test',
    url: 'https://example.com/test-job-' + Date.now(),
    status: 'Saved'
  };

  const jobRes = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(jobPayload)
  });

  if (!jobRes.ok) {
    console.error('Job sync failed!', jobRes.status, await jobRes.text());
    process.exit(1);
  }
  
  const jobData = await jobRes.json();
  console.log('Job sync successful! Action:', jobData.action, 'Job ID:', jobData.job?._id);

  // 3. Test Company Sync
  console.log('\nTesting Company Sync (POST /companies)...');
  const companyPayload = {
    name: 'Acme Test Labs',
    website: 'https://acme-test-labs.example.com',
    linkedinUrl: 'https://linkedin.com/company/acme-test-labs',
    industry: 'Ingestion Testing',
    companySize: '11-50 employees',
    locations: ['New York, NY'],
    notes: 'Manually verified via test script.',
    hiringStatus: 'Hiring'
  };

  const companyRes = await fetch(`${BASE_URL}/companies`, {
    method: 'POST',
    headers,
    body: JSON.stringify(companyPayload)
  });

  if (!companyRes.ok) {
    console.error('Company sync failed!', companyRes.status, await companyRes.text());
    process.exit(1);
  }

  const companyData = await companyRes.json();
  console.log('Company sync successful! Company ID:', companyData._id, 'Hiring Status:', companyData.hiringStatus);

  // 4. Test Hiring Post Sync
  console.log('\nTesting Hiring Post Sync (POST /hiring-posts)...');
  const postPayload = {
    author: 'Alice Tester (Director of Engineering)',
    company: 'Acme Test Labs',
    content: 'We are hiring a Senior Software Engineer remote! Check our new listing and reach out to me directly with your CV.',
    source: 'Twitter',
    url: 'https://twitter.com/alicetester/status/12345'
  };

  const postRes = await fetch(`${BASE_URL}/hiring-posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(postPayload)
  });

  if (!postRes.ok) {
    console.error('Hiring Post sync failed!', postRes.status, await postRes.text());
    process.exit(1);
  }

  const postData = await postRes.json();
  console.log('Hiring Post sync successful! Post ID:', postData._id, 'Linked Company:', postData.companyId?.name);

  console.log('\n=== All Sync Tests Passed Successfully! 🚀 ===');
}

testSync().catch(err => {
  console.error('Unhandled error during test:', err);
});
