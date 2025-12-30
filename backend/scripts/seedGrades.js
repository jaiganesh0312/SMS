const { Sequelize } = require('sequelize');
const { School, GradeRule } = require('../models');
const { sequelize } = require('../config/database');

async function seedGrades() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Get the first school (or specific one if needed)
        const school = await School.findOne();
        if (!school) {
            console.error('No school found to seed grades for.');
            process.exit(1);
        }

        const schoolId = school.id;
        console.log(`Seeding grades for School: ${school.name} (${schoolId})`);

        const rules = [
            { grade: 'A+', minPercentage: 95, maxPercentage: 100, description: 'Outstanding' },
            { grade: 'A', minPercentage: 85, maxPercentage: 94.99, description: 'Excellent' },
            { grade: 'B+', minPercentage: 75, maxPercentage: 84.99, description: 'Very Good' },
            { grade: 'B', minPercentage: 65, maxPercentage: 74.99, description: 'Good' },
            { grade: 'C+', minPercentage: 55, maxPercentage: 64.99, description: 'Above Average' },
            { grade: 'C', minPercentage: 45, maxPercentage: 54.99, description: 'Average' },
            { grade: 'D+', minPercentage: 35, maxPercentage: 44.99, description: 'Below Average' },
            { grade: 'D', minPercentage: 30, maxPercentage: 34.99, description: 'Marginal' },
            { grade: 'F', minPercentage: 0, maxPercentage: 29.99, description: 'Fail' },
        ];

        // Clear existing rules for this school to avoid duplicates/conflicts
        await GradeRule.destroy({ where: { schoolId } });

        for (const rule of rules) {
            await GradeRule.create({
                ...rule,
                schoolId
            });
        }

        console.log('Grade rules seeded successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding grades:', error);
        process.exit(1);
    }
}

seedGrades();
