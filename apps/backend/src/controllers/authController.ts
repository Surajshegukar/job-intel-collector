import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { AIService } from '../services/AIService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserProfile } from '../models/UserProfile';
import { UserSkill } from '../models/UserSkill';
import { UserProject } from '../models/UserProject';
import { UserExperience } from '../models/UserExperience';
import { UserEducation } from '../models/UserEducation';
import { UserCertification } from '../models/UserCertification';
import { UserAchievement } from '../models/UserAchievement';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_job_intelligence_key_123';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: []
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ 
        message: `This account uses social login (via ${user.provider || 'Google/GitHub'}). Please sign in using your OAuth provider.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { 
      name, education, experience, projects, skills, certifications, resumeText, isOnboarded,
      phone, location, portfolioUrl, linkedinUrl, githubUrl, noticePeriod, summary,
      preferredRoles, preferredLocations, salaryExpectation, achievements
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (education) {
      user.education = education.map((edu: any) => ({
        school: edu.school,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        description: edu.description || ''
      }));
    }
    if (experience) {
      user.experience = experience.map((exp: any) => ({
        company: exp.company,
        title: exp.role || exp.title,
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        description: exp.description || ''
      }));
    }
    if (projects) {
      user.projects = projects.map((proj: any) => ({
        name: proj.title || proj.name,
        description: proj.description || '',
        url: proj.githubUrl || proj.liveUrl || proj.url || '',
        techStack: Array.isArray(proj.technologies) ? proj.technologies : (typeof proj.technologies === 'string' ? proj.technologies.split(',').map((t: string) => t.trim()) : [])
      }));
    }
    if (skills) user.skills = typeof skills?.[0] === 'string' ? skills : (skills || []).map((s: any) => s.skillName);
    if (certifications) user.certifications = typeof certifications?.[0] === 'string' ? certifications : (certifications || []).map((c: any) => c.name);
    if (isOnboarded !== undefined) user.isOnboarded = isOnboarded;
    
    if (resumeText !== undefined) {
      user.resumeText = resumeText;
      if (resumeText) {
        user.resumeEmbedding = await AIService.generateEmbedding(resumeText);
      }
    }

    await user.save();

    // 1. Sync UserProfile
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          name: name || user.name,
          email: user.email,
          phone: phone !== undefined ? phone : '',
          location: location !== undefined ? location : '',
          portfolioUrl: portfolioUrl !== undefined ? portfolioUrl : '',
          linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : '',
          githubUrl: githubUrl !== undefined ? githubUrl : '',
          noticePeriod: noticePeriod !== undefined ? noticePeriod : '',
          summary: summary !== undefined ? summary : '',
          preferredRoles: preferredRoles || [],
          preferredLocations: preferredLocations || [],
          salaryExpectation: salaryExpectation || { min: undefined, max: undefined, currency: 'USD' }
        }
      },
      { upsert: true, new: true }
    );

    // 2. Sync UserSkill
    if (skills && Array.isArray(skills)) {
      await UserSkill.deleteMany({ userId });
      if (skills.length > 0) {
        const skillDocs = skills.map((s: any) => {
          const skillName = typeof s === 'string' ? s : s.skillName;
          const proficiency = typeof s === 'string' ? 'intermediate' : s.proficiency || 'intermediate';
          const yearsOfExperience = typeof s === 'string' ? 1 : s.yearsOfExperience || 1;
          let category = typeof s === 'string' ? 'General' : s.category || 'General';
          
          const validCategories = ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Testing', 'Mobile', 'AI/ML', 'General'];
          if (!validCategories.includes(category)) {
            category = 'General';
          }

          return {
            userId,
            name: skillName,
            skillName,
            normalizedName: skillName.toLowerCase(),
            proficiency,
            yearsOfExperience,
            category
          };
        });
        await UserSkill.insertMany(skillDocs);
      }
    }

    // 3. Sync UserExperience
    if (experience && Array.isArray(experience)) {
      await UserExperience.deleteMany({ userId });
      if (experience.length > 0) {
        const expDocs = experience.map((exp: any) => {
          let employmentType = exp.employmentType || 'Full-Time';
          const validEmpTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
          if (!validEmpTypes.includes(employmentType)) {
            employmentType = 'Full-Time';
          }

          return {
            userId,
            company: exp.company,
            role: exp.role || exp.title,
            employmentType,
            startDate: exp.startDate,
            endDate: exp.endDate || 'Present',
            description: exp.description || '',
            technologies: typeof exp.technologies === 'string' ? exp.technologies.split(',').map((t: string) => t.trim()) : exp.technologies || [],
            achievements: typeof exp.achievements === 'string' ? exp.achievements.split('\n').map((a: string) => a.trim()) : exp.achievements || []
          };
        });
        await UserExperience.insertMany(expDocs);
      }
    }

    // 4. Sync UserProject
    if (projects && Array.isArray(projects)) {
      await UserProject.deleteMany({ userId });
      if (projects.length > 0) {
        const projDocs = projects.map((proj: any) => ({
          userId,
          title: proj.title || proj.name,
          description: proj.description || '',
          category: proj.category || '',
          technologies: typeof proj.technologies === 'string' ? proj.technologies.split(',').map((t: string) => t.trim()) : proj.technologies || [],
          githubUrl: proj.githubUrl || '',
          liveUrl: proj.liveUrl || '',
          achievements: typeof proj.achievements === 'string' ? proj.achievements.split('\n').map((a: string) => a.trim()) : proj.achievements || [],
          impactMetrics: typeof proj.impactMetrics === 'string' ? proj.impactMetrics.split('\n').map((m: string) => m.trim()) : proj.impactMetrics || []
        }));
        await UserProject.insertMany(projDocs);
      }
    }

    // 5. Sync UserEducation
    if (education && Array.isArray(education)) {
      await UserEducation.deleteMany({ userId });
      if (education.length > 0) {
        const eduDocs = education.map((edu: any) => ({
          userId,
          school: edu.school,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          description: edu.description || ''
        }));
        await UserEducation.insertMany(eduDocs);
      }
    }

    // 6. Sync UserCertification
    if (certifications && Array.isArray(certifications)) {
      await UserCertification.deleteMany({ userId });
      if (certifications.length > 0) {
        const certDocs = certifications.map((c: any) => ({
          userId,
          name: typeof c === 'string' ? c : c.name,
          issuer: typeof c === 'string' ? 'Self' : c.issuer || 'Self',
          issueDate: typeof c === 'string' ? '2025' : c.issueDate || '2025',
          credentialUrl: typeof c === 'string' ? '' : c.credentialUrl || ''
        }));
        await UserCertification.insertMany(certDocs);
      }
    }

    // 7. Sync UserAchievement
    if (achievements && Array.isArray(achievements)) {
      await UserAchievement.deleteMany({ userId });
      if (achievements.length > 0) {
        const achDocs = achievements.map((a: any) => ({
          userId,
          title: typeof a === 'string' ? a : a.title,
          description: typeof a === 'string' ? '' : a.description || '',
          category: typeof a === 'string' ? '' : a.category || ''
        }));
        await UserAchievement.insertMany(achDocs);
      }
    }

    const updatedUser = await User.findById(userId).select('-password');
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getAISuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { jobId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 1. Analyze skill gap
    const skillGap = await AIService.analyzeSkillGap(user.skills, job.skills);

    // 2. Score resume
    const matchAnalysis = await AIService.matchResume(user.resumeText || '', job.description || '', user.skills);

    // 3. Tailor cover letter
    const companyName = (job.companyId as any).name || 'Hiring Company';
    const coverLetter = await AIService.generateTailoredCoverLetter(
      user.name,
      user.skills,
      job.title,
      companyName,
      job.description || ''
    );

    return res.json({
      skillGap,
      matchAnalysis,
      coverLetter
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// ─── OAuth Controllers ────────────────────────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper to get Google Redirect URI
const getGoogleRedirectUri = () => `${BACKEND_URL}/api/auth/google/callback`;

// Helper to get GitHub Redirect URI
const getGithubRedirectUri = () => `${BACKEND_URL}/api/auth/github/callback`;

/**
 * Redirects user to Google OAuth consent screen
 */
export const googleAuth = async (_req: Request, res: Response) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Google OAuth is not configured on the backend. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the .env file.')}`);
  }

  const redirectUri = getGoogleRedirectUri();
  const scope = 'openid profile email';
  const responseType = 'code';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
  
  return res.redirect(googleAuthUrl);
};

/**
 * Handles Google OAuth callback, exchanges code for user profile, and issues JWT
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Authorization code was not provided by Google.')}`);
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getGoogleRedirectUri();

    // 1. Exchange auth code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId || '',
        client_secret: googleClientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('[Google Token Exchange Error]', errText);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Failed to exchange authorization code for Google access token.')}`);
    }

    const tokenData = await tokenResponse.json() as any;
    const { access_token } = tokenData;

    // 2. Fetch user profile from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error('[Google User Info Fetch Error]', await userinfoResponse.text());
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Failed to retrieve user profile details from Google.')}`);
    }

    const profile = await userinfoResponse.json() as any;
    const googleId = profile.sub;
    const email = profile.email;
    const name = profile.name || email.split('@')[0];

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Google account must have an email address.')}`);
    }

    // 3. Find or Create User
    let user = await User.findOne({ googleId });
    if (!user) {
      // Check if user exists with the same email
      user = await User.findOne({ email });
      if (user) {
        // Link Google ID
        user.googleId = googleId;
        if (user.provider === 'local') {
          user.provider = 'google';
        }
        await user.save();
      } else {
        // Create new user
        user = new User({
          name,
          email,
          provider: 'google',
          googleId,
          education: [],
          experience: [],
          projects: [],
          skills: [],
          certifications: []
        });
        await user.save();
      }
    }

    // 4. Generate JWT & Redirect to Frontend Callback
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error: any) {
    console.error('[Google OAuth Error]', error);
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('An unexpected error occurred during Google OAuth: ' + error.message)}`);
  }
};

/**
 * Redirects user to GitHub OAuth authorize screen
 */
export const githubAuth = async (_req: Request, res: Response) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!githubClientId || !githubClientSecret) {
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('GitHub OAuth is not configured on the backend. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the .env file.')}`);
  }

  const redirectUri = getGithubRedirectUri();
  const scope = 'user:email';
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  
  return res.redirect(githubAuthUrl);
};

/**
 * Handles GitHub OAuth callback, exchanges code for user profile, and issues JWT
 */
export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Authorization code was not provided by GitHub.')}`);
    }

    const githubClientId = process.env.GITHUB_CLIENT_ID;
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = getGithubRedirectUri();

    // 1. Exchange auth code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: githubClientId || '',
        client_secret: githubClientSecret || '',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('[GitHub Token Exchange Error]', errText);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Failed to exchange authorization code for GitHub access token.')}`);
    }

    const tokenData = await tokenResponse.json() as any;
    const { access_token } = tokenData;

    if (!access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('GitHub response did not contain an access token.')}`);
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'Job-Intelligence-App',
      },
    });

    if (!userResponse.ok) {
      console.error('[GitHub User Fetch Error]', await userResponse.text());
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Failed to retrieve user profile details from GitHub.')}`);
    }

    const profile = await userResponse.json() as any;
    const githubId = String(profile.id);
    let email = profile.email;
    const name = profile.name || profile.login;

    // 3. GitHub emails might be private; fetch primary email explicitly if not returned
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'User-Agent': 'Job-Intelligence-App',
        },
      });

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json() as any[];
        const primaryEmailObj = emails.find((e: any) => e.primary && e.verified) || 
                                emails.find((e: any) => e.primary) || 
                                emails[0];
        if (primaryEmailObj) {
          email = primaryEmailObj.email;
        }
      }
    }

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('GitHub account must have a verified email address.')}`);
    }

    // 4. Find or Create User
    let user = await User.findOne({ githubId });
    if (!user) {
      // Check if user exists with the same email
      user = await User.findOne({ email });
      if (user) {
        // Link GitHub ID
        user.githubId = githubId;
        if (user.provider === 'local') {
          user.provider = 'github';
        }
        await user.save();
      } else {
        // Create new user
        user = new User({
          name,
          email,
          provider: 'github',
          githubId,
          education: [],
          experience: [],
          projects: [],
          skills: [],
          certifications: []
        });
        await user.save();
      }
    }

    // 5. Generate JWT & Redirect to Frontend Callback
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error: any) {
    console.error('[GitHub OAuth Error]', error);
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('An unexpected error occurred during GitHub OAuth: ' + error.message)}`);
  }
};
