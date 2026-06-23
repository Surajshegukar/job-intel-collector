"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiringPost = void 0;
const mongoose_1 = require("mongoose");
const HiringPostSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    author: { type: String },
    source: { type: String },
    content: { type: String },
    url: { type: String }
}, {
    timestamps: true
});
exports.HiringPost = (0, mongoose_1.model)('HiringPost', HiringPostSchema);
