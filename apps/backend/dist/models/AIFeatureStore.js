"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIFeatureStore = void 0;
const mongoose_1 = require("mongoose");
const AIFeatureStoreSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    // Feature signals
    skillsOverlapCount: { type: Number, required: true },
    projectsMatchCount: { type: Number, required: true },
    experienceMatchYears: { type: Number, required: true },
    certificationsRelevanceScore: { type: Number, required: true },
    // Scoring output
    calculatedMatchScore: { type: Number, required: true },
    // Target Label (captured from actual interview progress outcomes)
    actualOutcome: {
        type: String,
        enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'],
        default: 'Saved'
    },
    isTrainingSample: { type: Boolean, default: false },
    exportedAt: { type: Date }
}, {
    timestamps: true
});
AIFeatureStoreSchema.index({ jobId: 1, userId: 1 }, { unique: true });
exports.AIFeatureStore = (0, mongoose_1.model)('AIFeatureStore', AIFeatureStoreSchema);
