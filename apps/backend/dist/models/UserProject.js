"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProject = void 0;
const mongoose_1 = require("mongoose");
const UserProjectSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    technologies: [{ type: String }],
    achievements: [{ type: String }]
}, {
    timestamps: true
});
UserProjectSchema.index({ userId: 1 });
exports.UserProject = (0, mongoose_1.model)('UserProject', UserProjectSchema);
