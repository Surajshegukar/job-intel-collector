"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileCompletenessEngine = void 0;
const UserProfile_1 = require("../../models/UserProfile");
const UserExperience_1 = require("../../models/UserExperience");
const UserProject_1 = require("../../models/UserProject");
const UserSkill_1 = require("../../models/UserSkill");
const UserCertification_1 = require("../../models/UserCertification");
const UserAchievement_1 = require("../../models/UserAchievement");
const UserEducation_1 = require("../../models/UserEducation");
class ProfileCompletenessEngine {
    static async calculateCompleteness(userId) {
        let score = 0;
        try {
            // 1. User Profile fields (name, email, phone, location) = 10%
            const profile = await UserProfile_1.UserProfile.findOne({ userId });
            if (profile) {
                let profileSubscore = 0;
                if (profile.name)
                    profileSubscore += 2.5;
                if (profile.email)
                    profileSubscore += 2.5;
                if (profile.phone)
                    profileSubscore += 2.5;
                if (profile.location)
                    profileSubscore += 2.5;
                score += profileSubscore;
            }
            // 2. Education (at least one school record) = 10%
            const educationCount = await UserEducation_1.UserEducation.countDocuments({ userId });
            if (educationCount > 0) {
                score += 10;
            }
            // 3. Skills (at least one skill) = 20%
            const skillCount = await UserSkill_1.UserSkill.countDocuments({ userId });
            if (skillCount > 0) {
                score += 20;
            }
            // 4. Projects (at least one project) = 25%
            const projectCount = await UserProject_1.UserProject.countDocuments({ userId });
            if (projectCount > 0) {
                score += 25;
            }
            // 5. Experience (at least one experience record) = 25%
            const experienceCount = await UserExperience_1.UserExperience.countDocuments({ userId });
            if (experienceCount > 0) {
                score += 25;
            }
            // 6. Certifications & Achievements = 10%
            const certCount = await UserCertification_1.UserCertification.countDocuments({ userId });
            const achCount = await UserAchievement_1.UserAchievement.countDocuments({ userId });
            if (certCount > 0 || achCount > 0) {
                score += 10;
            }
        }
        catch (err) {
            console.error('[ProfileCompletenessEngine] Error calculating completeness:', err);
        }
        return Math.round(score);
    }
}
exports.ProfileCompletenessEngine = ProfileCompletenessEngine;
