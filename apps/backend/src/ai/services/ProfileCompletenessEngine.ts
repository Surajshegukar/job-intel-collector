import { UserProfile } from '../../models/UserProfile';
import { UserExperience } from '../../models/UserExperience';
import { UserProject } from '../../models/UserProject';
import { UserSkill } from '../../models/UserSkill';
import { UserCertification } from '../../models/UserCertification';
import { UserAchievement } from '../../models/UserAchievement';
import { UserEducation } from '../../models/UserEducation';

export class ProfileCompletenessEngine {
  static async calculateCompleteness(userId: string): Promise<number> {
    let score = 0;

    try {
      // 1. User Profile fields (name, email, phone, location) = 10%
      const profile = await UserProfile.findOne({ userId });
      if (profile) {
        let profileSubscore = 0;
        if (profile.name) profileSubscore += 2.5;
        if (profile.email) profileSubscore += 2.5;
        if (profile.phone) profileSubscore += 2.5;
        if (profile.location) profileSubscore += 2.5;
        score += profileSubscore;
      }

      // 2. Education (at least one school record) = 10%
      const educationCount = await UserEducation.countDocuments({ userId });
      if (educationCount > 0) {
        score += 10;
      }

      // 3. Skills (at least one skill) = 20%
      const skillCount = await UserSkill.countDocuments({ userId });
      if (skillCount > 0) {
        score += 20;
      }

      // 4. Projects (at least one project) = 25%
      const projectCount = await UserProject.countDocuments({ userId });
      if (projectCount > 0) {
        score += 25;
      }

      // 5. Experience (at least one experience record) = 25%
      const experienceCount = await UserExperience.countDocuments({ userId });
      if (experienceCount > 0) {
        score += 25;
      }

      // 6. Certifications & Achievements = 10%
      const certCount = await UserCertification.countDocuments({ userId });
      const achCount = await UserAchievement.countDocuments({ userId });
      if (certCount > 0 || achCount > 0) {
        score += 10;
      }

    } catch (err) {
      console.error('[ProfileCompletenessEngine] Error calculating completeness:', err);
    }

    return Math.round(score);
  }
}
