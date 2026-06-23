"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
const mongoose_1 = require("mongoose");
const UserProfileSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    preferredRoles: [{ type: String }],
    preferredLocations: [{ type: String }],
    salaryExpectation: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' }
    },
    githubUrl: { type: String },
    linkedinUrl: { type: String }
}, {
    timestamps: true
});
exports.UserProfile = (0, mongoose_1.model)('UserProfile', UserProfileSchema);
