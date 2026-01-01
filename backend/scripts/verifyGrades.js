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
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}
verifyUpdates();
