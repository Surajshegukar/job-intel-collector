import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { Skill } from '../models/Skill';
import { Application } from '../models/Application';
import { HiringPost } from '../models/HiringPost';
import { JobProcessingService } from '../services/JobProcessingService';

const MOCK_COMPANIES = [
  {
    name: 'Google',
    website: 'https://google.com',
    linkedinUrl: 'https://linkedin.com/company/google',
    industry: 'Technology',
    companySize: '10,000+ employees',
    locations: ['Mountain View, CA', 'New York, NY', 'Bangalore, India'],
    techStack: ['Python', 'C++', 'Java', 'TypeScript', 'Go', 'Kubernetes', 'TensorFlow'],
    hiringStatus: 'Hiring',
    notes: 'Primary target for staff-level and senior roles.'
  },
  {
    name: 'Stripe',
    website: 'https://stripe.com',
    linkedinUrl: 'https://linkedin.com/company/stripe',
    industry: 'Financial Services',
    companySize: '1,001-5,000 employees',
    locations: ['San Francisco, CA', 'Dublin, Ireland', 'Remote'],
    techStack: ['Ruby', 'Go', 'React', 'TypeScript', 'PostgreSQL', 'AWS'],
    hiringStatus: 'Hiring',
    notes: 'Known for high bar and excellent technical writing.'
  },
  {
    name: 'Vercel',
    website: 'https://vercel.com',
    linkedinUrl: 'https://linkedin.com/company/vercel',
    industry: 'Cloud Platform',
    companySize: '201-500 employees',
    locations: ['Remote', 'New York, NY'],
    techStack: ['TypeScript', 'Next.js', 'React', 'Node.js', 'AWS', 'Rust'],
    hiringStatus: 'Hiring',
    notes: 'Creator of Next.js, fast growing developer platform.'
  },
  {
    name: 'Meta',
    website: 'https://meta.com',
    linkedinUrl: 'https://linkedin.com/company/meta',
    industry: 'Social Media',
    companySize: '10,000+ employees',
    locations: ['Menlo Park, CA', 'Seattle, WA', 'London, UK'],
    techStack: ['React', 'Python', 'C++', 'PHP', 'PyTorch', 'MySQL'],
    hiringStatus: 'Not Hiring',
    notes: 'Currently undergoing restructuring, check back Q4.'
  }
];

const MOCK_JOBS = [
  {
    title: 'Senior Full Stack Engineer (Next.js & Node)',
    companyName: 'Vercel',
    source: 'LinkedIn',
    url: 'https://linkedin.com/jobs/view/101',
    location: 'Remote',
    salary: '$140,000 - $180,000',
    experience: '5+ years',
    description: 'We are seeking a Senior Full Stack Engineer to help build our core dashboard interfaces. The ideal candidate has deep expertise in React, Next.js, and TypeScript. You will collaborate with product designers and platform engineers to build high-performance, developer-friendly experiences. Experience with Node.js and AWS infrastructure is required.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'AWS', 'REST APIs'],
    status: 'Saved'
  },
  {
    title: 'Software Engineer - Stripe Billing',
    companyName: 'Stripe',
    source: 'LinkedIn',
    url: 'https://linkedin.com/jobs/view/102',
    location: 'San Francisco, CA',
    salary: '$160,000 - $210,000',
    experience: '3+ years',
    description: 'Join the Stripe Billing team to build developer APIs that power subscription business models globally. We work primarily in Ruby and Go. You will design clean APIs, write comprehensive unit tests, and maintain highly available database services using PostgreSQL. Experience with billing infrastructure is a plus.',
    skills: ['Go', 'SQL', 'PostgreSQL', 'Ruby', 'REST APIs', 'Git'],
    status: 'Applied'
  },
  {
    title: 'Staff Software Engineer - Google Cloud Platform',
    companyName: 'Google',
    source: 'Indeed',
    url: 'https://indeed.com/jobs/view/201',
    location: 'Mountain View, CA',
    salary: '$220,000 - $280,000',
    experience: '8+ years',
    description: 'Help build the next generation of cloud storage services at GCP. You will write high-performance distributed systems in Go and C++. Deep understanding of container orchestrations, Kubernetes, Docker, and system design is vital. Leading and mentoring junior developers is a key aspect of this role.',
    skills: ['Go', 'C++', 'Kubernetes', 'Docker', 'REST APIs', 'Git'],
    status: 'Interview'
  },
  {
    title: 'Machine Learning Research Engineer',
    companyName: 'Google',
    source: 'Wellfound',
    url: 'https://wellfound.com/jobs/view/301',
    location: 'Bangalore, India',
    salary: '$120,000 - $160,000',
    experience: '4+ years',
    description: 'Work with the DeepMind research team to train and evaluate large language models. The ideal candidate will have strong skills in Python, PyTorch, and TensorFlow. You will design RAG pipelines and deploy fine-tuned open-source models using Docker on Google Cloud Platform. Experience with LLMs and Deep Learning is a must.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Docker', 'Large Language Models', 'RAG', 'Machine Learning'],
    status: 'Offer'
  },
  {
    title: 'Front End Engineer',
    companyName: 'Meta',
    source: 'Naukri',
    url: 'https://naukri.com/jobs/view/401',
    location: 'Remote',
    salary: '$150,000 - $190,000',
    experience: '4+ years',
    description: 'We are looking for a Front End Engineer to join our Facebook Core Ads product team. You will write clean, well-tested React and TypeScript components, optimize web performance, and collaborate closely with product management. Solid understanding of JavaScript and CSS layout systems is essential.',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Redux'],
    status: 'Rejected'
  }
];

const MOCK_HIRING_POSTS = [
  {
    companyName: 'Vercel',
    author: 'Lee Robinson (VP of Developer Relations)',
    source: 'LinkedIn Feed',
    content: 'Vercel is looking for a Senior Full Stack Engineer to join our product team remote! If you love Next.js, React, and helping developers ship websites fast, apply here or DM me directly. Looking for people with strong frontend skills and Node backend knowledge.',
    url: 'https://linkedin.com/posts/leandro-1234'
  },
  {
    companyName: 'Stripe',
    author: 'John Collison (Co-founder)',
    source: 'Twitter / X',
    content: 'We are expanding the Stripe Billing team in SF. Hiring engineers who care about developer experience and clean API design. If you like Ruby and Go, apply via our careers page!',
    url: 'https://twitter.com/johncollison/status/987654'
  }
];

async function seed() {
  try {
    await connectDB();

    console.log('Clearing database collection records...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Skill.deleteMany({});
    await Application.deleteMany({});
    await HiringPost.deleteMany({});

    console.log('Creating default user profile...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const defaultUser = new User({
      name: 'Suraj Shegukar',
      email: 'suraj@example.com',
      password: hashedPassword,
      education: [
        {
          school: 'Boston University',
          degree: 'Master of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2022',
          endDate: '2024',
          description: 'Specialization in Software Engineering and Distributed Systems.'
        }
      ],
      experience: [
        {
          company: 'Tech Solutions Inc.',
          title: 'Full Stack Engineer',
          location: 'Boston, MA',
          startDate: '2024-06',
          endDate: 'Present',
          description: 'Developing React components, backend REST services in Node.js, and maintaining AWS serverless architectures.'
        }
      ],
      projects: [
        {
          name: 'Job Intelligence Collector Extension',
          description: 'A Chrome MV3 extension designed to scrap and parse job lists locally in IndexedDB.',
          url: 'https://github.com/Surajshegukar/Job-Intelligence-Collector',
          techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Dexie.js']
        }
      ],
      skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'SQL', 'MongoDB', 'AWS', 'Git', 'REST APIs'],
      certifications: ['AWS Certified Developer - Associate', 'Certified ScrumMaster (CSM)'],
      resumeText: 'Suraj Shegukar is a Full Stack Engineer with 2+ years of experience in React, Node.js, TypeScript, and MongoDB. He graduated from Boston University with an MS in Computer Science in 2024. He has successfully developed developer tools and chrome extensions.'
    });

    // Generate mock embedding for the default user
    defaultUser.resumeEmbedding = Array.from({ length: 1536 }, () => Math.random());
    await defaultUser.save();
    console.log(`Default User created: ${defaultUser.email} (Password: password123)`);

    console.log('Inserting companies...');
    const companyDocs = [];
    for (const c of MOCK_COMPANIES) {
      const companyDoc = new Company(c);
      await companyDoc.save();
      companyDocs.push(companyDoc);
    }
    console.log(`Seeded ${companyDocs.length} companies.`);

    console.log('Inserting jobs and processing stats...');
    // We will use JobProcessingService to process, which updates company and skill stats automatically
    for (const jobData of MOCK_JOBS) {
      await JobProcessingService.processAndSaveJob(jobData as any);
    }
    console.log(`Seeded ${MOCK_JOBS.length} jobs.`);

    console.log('Creating hiring posts...');
    for (const postData of MOCK_HIRING_POSTS) {
      const comp = await Company.findOne({ name: postData.companyName });
      if (comp) {
        const postDoc = new HiringPost({
          companyId: comp._id,
          author: postData.author,
          source: postData.source,
          content: postData.content,
          url: postData.url
        });
        await postDoc.save();
      }
    }
    console.log(`Seeded ${MOCK_HIRING_POSTS.length} hiring posts.`);

    // Log skills created
    const allSkills = await Skill.find().sort({ frequency: -1 });
    console.log(`Successfully seeded. Total skills resolved/created: ${allSkills.length}`);
    console.log('Top skills seeded:');
    allSkills.slice(0, 5).forEach(s => console.log(` - ${s.name}: ${s.frequency} jobs`));

    console.log('\nDatabase Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
