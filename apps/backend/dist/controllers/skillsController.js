"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkills = void 0;
const Skill_1 = require("../models/Skill");
const getSkills = async (_req, res) => {
    try {
        const skills = await Skill_1.Skill.find().sort({ frequency: -1 });
        return res.json(skills);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getSkills = getSkills;
