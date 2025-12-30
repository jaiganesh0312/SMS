const { School } = require('../models');
const fs = require('fs');
const path = require('path');

// Get School Details (including Logo)
exports.getSchoolDetails = async (req, res) => {
    try {
        // Assuming single school for now or based on logged-in user's schoolId
        // Ideally, for a multi-tenant system, we use req.user.schoolId
        // But for a generic "Get School Info" it might be public or protected.
        // Let's assume protected and we get the school based on the user's schoolId.

        let schoolId;
        if (req.user && req.user.schoolId) {
            schoolId = req.user.schoolId;
        } else {
            // Fallback for public access if needed, or error. 
            // For now, let's assume one school or param id.
            // If just fetching "THE" school logo for login page, might need a public endpoint with domain logic.
            // Here we stick to authenticated user's school.
            return res.status(400).json({ success: false, message: "School ID not found in context" });
        }

        const school = await School.findByPk(schoolId);

        if (!school) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        res.status(200).json({
            success: true,
            data: school
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload School Logo
exports.uploadLogo = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const school = await School.findByPk(schoolId);

        if (!school) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a file" });
        }

        // Delete old logo if exists
        if (school.logo) {
            // Assuming logo is stored as relative path e.g., 'uploads/school/logo.png'
            // Construct absolute path to delete
            // Fix: Clean up path handling
            const oldPath = path.join(__dirname, '..', school.logo);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new logo path
        // req.file.path is absolute, we want relative for DB
        // But multer destination is set.
        // Let's assume the middleware saves it to 'uploads/school/'
        // We will store 'uploads/school/filename' in DB.

        // Adjust this depending on how static files are served.
        // detailed path construction happens in middleware usually.

        const relativePath = `uploads/school/${req.file.filename}`;

        school.logo = relativePath;
        await school.save();

        res.status(200).json({
            success: true,
            message: "School logo uploaded successfully",
            data: { logo: relativePath }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
