const { sequelize } = require('../config/database');
const { ExamResult, GradeRule } = require('../models');

async function updateExamResultGrades() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Fetch all exam results where grade is missing
        const results = await ExamResult.findAll({
            where: {
                grade: null
            }
        });

        console.log(`Found ${results.length} exam results without grades.`);

        // Fetch all grade rules
        const gradeRules = await GradeRule.findAll();

        if (gradeRules.length === 0) {
            console.error('No grade rules found. Please seed grade rules first.');
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
                console.warn(`No grade rules found for school ID: ${result.schoolId}, skipping result ID: ${result.id}`);
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
                console.warn(`No matching grade rule for percentage: ${percentage} (School: ${result.schoolId}), skipping result ID: ${result.id}`);
            }
        }

        console.log(`Updated ${updatedCount} exam results with grades and remarks.`);
        process.exit(0);

    } catch (error) {
        console.error('Error updating exam result grades:', error);
        process.exit(1);
    }
}

updateExamResultGrades();
