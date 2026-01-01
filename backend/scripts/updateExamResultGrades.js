const { sequelize } = require('../config/database');
const { ExamResult, GradeRule } = require('../models');

async function updateExamResultGrades() {
    try {
        await sequelize.authenticate();

        // Fetch all exam results where grade is missing
        const results = await ExamResult.findAll({
            where: {
                grade: null
            }
        });


        // Fetch all grade rules
        const gradeRules = await GradeRule.findAll();

        if (gradeRules.length === 0) {
            process.exit(1);
        }

        // Group grade rules by schoolId for faster lookup
        const rulesBySchool = {};
        for (const rule of gradeRules) {
            if (!rulesBySchool[rule.schoolId]) {
                rulesBySchool[rule.schoolId] = [];
            }
            rulesBySchool[rule.schoolId].push(rule);
        }

        let updatedCount = 0;

        for (const result of results) {
            const percentage = (result.marksObtained / result.maxMarks) * 100;
            const schoolRules = rulesBySchool[result.schoolId];

            if (!schoolRules) {
                continue;
            }

            // Find matching rule
            const matchingRule = schoolRules.find(rule =>
                percentage >= rule.minPercentage && percentage <= rule.maxPercentage
            );

            if (matchingRule) {
                result.grade = matchingRule.grade;
                result.remarks = matchingRule.description;
                await result.save();
                updatedCount++;
            } else {
            }
        }

        process.exit(0);

    } catch (error) {
        process.exit(1);
    }
}

updateExamResultGrades();
