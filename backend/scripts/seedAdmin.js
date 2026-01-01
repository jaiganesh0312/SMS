const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();

        const adminEmail = process.env.ADMIN_EMAIL || "admin@system.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        // Check if admin exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            process.exit(0);
        }

        // Create System Admin
        await User.create({
            email: adminEmail,
            passwordHash: await bcrypt.hash(adminPassword, 12),
            role: "SUPER_ADMIN",
            isActive: true
        });

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

seedAdmin();
