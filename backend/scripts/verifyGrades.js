const { sequelize } = require('../config/database');
const { ExamResult } = require('../models');

async function verifyUpdates() {
    try {
        await sequelize.authenticate();
        const count = await ExamResult.count({
            where: {
                grade: null
            }
        });
        console.log(`Remaining exam results without grades: ${count}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
verifyUpdates();
