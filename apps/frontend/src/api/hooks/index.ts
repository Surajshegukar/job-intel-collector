// Per-domain hook files
export * from './useJobs';
export * from './useCompanies';
export * from './useSkills';
export * from './useApplications';
export * from './useAnalytics';

// Profile, Resume hooks (from root api/hooks.ts)
export {
  useProfileData,
  useUpdateProfileData,
  useImportResume,
  useAddSkill,
  useUpdateSkill,
  useDeleteSkill,
  useAddProject,
  useUpdateProject,
  useDeleteProject,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useAddCertification,
  useDeleteCertification,
  useAddAchievement,
  useDeleteAchievement,
  useResumeTemplates,
  useResumeVersions,
  useGenerateResume,
  useUpdateResumeOutcome,
  useCompareResumes,
} from '../hooks';
