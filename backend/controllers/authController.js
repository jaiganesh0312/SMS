const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, School, StaffProfile, Parent, sequelize } = require("../models");
const { sendSchoolRegistrationEmail, sendStaffRegistrationEmail } = require("../services/emailService");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });
};

exports.registerSchool = async (req, res) => {
  try {
    const { schoolName, schoolAddress, schoolBoard, adminEmail, adminPhone, adminPassword, adminName } = req.body;

    // Basic validation
    if (!schoolName || !adminEmail || !adminPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 1. Create School
    const newSchool = await School.create({
      name: schoolName,
      address: schoolAddress,
      board: schoolBoard,
    });

    // 2. Create Admin User
    const newAdmin = await User.create({
      name: adminName,
      schoolId: newSchool.id,
      email: adminEmail,
      phone: adminPhone,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SCHOOL_ADMIN",
      isActive: true
    });

    // 3. Create Staff Profile
    await StaffProfile.create({
      schoolId: newSchool.id,
      userId: newAdmin.id,
      employeeCode: `ADMIN-${newSchool.id.split('-')[0]}`,
      designation: "Principal/Admin",
      department: "Administration",
      joiningDate: new Date()
    });

    // 4. Send Registration Email (Assumption: No logo for new school yet, or use generic)
    // For now, pass null or specific system logo if available
    await sendSchoolRegistrationEmail(newSchool.name, adminEmail, adminPassword, null);

    const token = signToken(newAdmin.id);

    res.status(201).json({
      success: true,
      message: "School registered successfully",
      token,
      data: {
        school: newSchool,
        user: newAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.registerStaff = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { schoolId, name, email, phone, password, workingAs, designation, department } = req.body;

    // Determine School ID based on User Role
    if (req.user.role === "SCHOOL_ADMIN") {
      schoolId = req.user.schoolId;
    } else if (req.user.role === "SUPER_ADMIN") {
      if (!schoolId) {
        return res.status(400).json({ success: false, message: "School ID is required for Super Admin" });
      }
    }

    if (!schoolId || !email || !password || !name || !workingAs) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify School exists
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create User (Role usually matches 'workingAs', simplistically map TEACHER->TEACHER, OFFICE->STAFF)
    const role = workingAs === "TEACHER" ? "TEACHER" : "STAFF";
    // Normalize workingAs for StaffProfile (Must be "TEACHER" or "OFFICE_STAFF")
    const profileWorkingAs = workingAs === "TEACHER" ? "TEACHER" : "OFFICE_STAFF";

    const newUser = await User.create({
      name,
      schoolId,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      isActive: true
    }, { transaction: t });

    // Generate Employee Code (Simple Random or Sequence)
    const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;

    // Create Staff Profile
    const newStaff = await StaffProfile.create({
      schoolId,
      userId: newUser.id,
      employeeCode,
      designation: designation || (workingAs === "TEACHER" ? "Teacher" : "Staff"),
      department: department || "General",
      joiningDate: new Date(),
      workingAs: profileWorkingAs
    }, { transaction: t });

    await t.commit();

    // Send Welcome Email
    const schoolLogoUrl = school.logo ? `${req.protocol}://${req.get('host')}/api/${school.logo}` : null;
    await sendStaffRegistrationEmail(school.name, name, email, password, newStaff.designation, newStaff.department, schoolLogoUrl);

    const token = signToken(newUser.id);

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      token,
      data: {
        user: newUser,
        staffProfile: newStaff
      }
    });

  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ where: { email }, include: [{ model: School }] });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Incorrect email or password" });
    }

    const token = signToken(user.id);
    user.passwordHash = undefined;

    // Fetch Role Specific Profile
    if (user.role === 'PARENT') {
      const parent = await Parent.findOne({ where: { userId: user.id } });
      if (parent) {
        user.dataValues.parent = parent;
      }
    } else if (['SCHOOL_ADMIN', 'STAFF', 'TEACHER', 'LIBRARIAN'].includes(user.role)) {
      const staff = await StaffProfile.findOne({ where: { userId: user.id } });
      if (staff) {
        user.dataValues.staffProfile = staff;
      }
    }


    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From JWT middleware

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password"
      });
    }

    // Password strength validation (min 8 characters)
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long"
      });
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password"
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await user.update({ passwordHash: newPasswordHash });

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

