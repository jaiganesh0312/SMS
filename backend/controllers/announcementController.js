const { Announcement, School, User } = require("../models");
const { Op } = require("sequelize");

// Create Announcement
// Create Announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, expiryDate, targetSchoolIds, targetClassId } = req.body;
    const { role, schoolId: userSchoolId, id: userId } = req.user;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Validate expiry date if provided
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future",
        });
      }
    }

    let createdAnnouncements;

    if (role === "SUPER_ADMIN") {
      // SUPER_ADMIN must select schools
      if (!targetSchoolIds || !Array.isArray(targetSchoolIds) || targetSchoolIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one school",
        });
      }

      // Verify all schools exist
      const schools = await School.findAll({
        where: { id: targetSchoolIds },
      });

      if (schools.length !== targetSchoolIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more selected schools do not exist",
        });
      }

      // Bulk create announcements for each selected school
      const announcementsData = targetSchoolIds.map((schoolId) => ({
        title,
        message,
        priority: priority || "MEDIUM",
        expiryDate: expiryDate || null,
        authorId: req.user.id,
        authorRole: "SUPER_ADMIN",
        schoolId,
      }));

      createdAnnouncements = await Announcement.bulkCreate(announcementsData);

      return res.status(201).json({
        success: true,
        message: `Announcement created for ${targetSchoolIds.length} school(s)`,
        data: createdAnnouncements,
      });
    } else if (role === "SCHOOL_ADMIN") {
      // SCHOOL_ADMIN creates announcement for their own school
      const announcement = await Announcement.create({
        title,
        message,
        priority: priority || "MEDIUM",
        expiryDate: expiryDate || null,
        authorId: req.user.id,
        authorRole: "SCHOOL_ADMIN",
        schoolId: userSchoolId,
      });

      return res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        data: announcement,
      });
    } else if (role === "TEACHER") {
      // TEACHER creates announcement for their own class

      // Verify teacher is assigned to the target class
      if (!targetClassId) {
        return res.status(400).json({ success: false, message: "Target Class ID is required" });
      }

      // Check if this teacher is the class teacher of the target class
      const { Class } = require('../models');
      const classInfo = await Class.findOne({
        where: { id: targetClassId, classTeacherId: userId }
      });

      if (!classInfo) {
        return res.status(403).json({ success: false, message: "You are not the class teacher for this class" });
      }

      const announcement = await Announcement.create({
        title,
        message,
        priority: priority || "MEDIUM",
        expiryDate: expiryDate || null,
        authorId: userId,
        authorRole: "TEACHER",
        schoolId: userSchoolId,
        classId: targetClassId
      });

      return res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        data: announcement,
      });

    } else {
      return res.status(403).json({
        success: false,
        message: "Only SUPER_ADMIN, SCHOOL_ADMIN and TEACHER can create announcements",
      });
    }
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
    });
  }
};

// Get Announcements (role-based filtering)
exports.getAnnouncements = async (req, res) => {
  try {
    const { role, schoolId: userSchoolId, id: userId } = req.user;
    const now = new Date();

    let whereCondition = {
      isActive: true,
      [Op.or]: [
        { expiryDate: null }, // No expiry
        { expiryDate: { [Op.gt]: now } }, // Not expired
      ],
    };

    if (role === "SCHOOL_ADMIN") {
      // SCHOOL_ADMIN sees:
      // 1. SUPER_ADMIN announcements for their school
      // 2. SCHOOL_ADMIN announcements from their school
      whereCondition.schoolId = userSchoolId;
      // Also potentially see teacher announcements? Maybe not necessary for now.
    } else if (role === "TEACHER" || role === "STAFF") {
      whereCondition.schoolId = userSchoolId;
      whereCondition[Op.or] = [
        { authorRole: "SCHOOL_ADMIN" },
        { authorRole: "SUPER_ADMIN" }
      ]
    } else if (role === "PARENT") {
      // PARENT sees:
      // 1. SCHOOL_ADMIN/SUPER_ADMIN announcements
      // 2. TEACHER announcements for their children's classes
      // Note: This logic might need to be more complex if a parent has multiple children

      // Find all children's class IDs
      const { Student } = require('../models');
      const students = await Student.findAll({ where: { parentId: (await require('../models').Parent.findOne({ where: { userId } })).id } });
      const classIds = students.map(s => s.classId).filter(id => id);

      whereCondition.schoolId = userSchoolId;
      whereCondition[Op.or] = [
        { authorRole: { [Op.in]: ["SCHOOL_ADMIN", "SUPER_ADMIN"] } },
        { classId: { [Op.in]: classIds } }
      ];

      // whereCondition.schoolId = userSchoolId;
      // whereCondition.authorRole = "SCHOOL_ADMIN";
    }

    const announcements = await Announcement.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "role", "email"],
        },
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["priority", "DESC"], // HIGH -> MEDIUM -> LOW (assuming ENUM order)
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};

// Update Announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority, expiryDate, isActive, targetSchoolIds } = req.body;
    const { role, id: userId, schoolId: userSchoolId } = req.user;

    // Find the announcement
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check ownership
    if (announcement.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own announcements",
      });
    }

    // Validate expiry date if provided
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future",
        });
      }
    }

    // Update fields
    if (title) announcement.title = title;
    if (message) announcement.message = message;
    if (priority) announcement.priority = priority;
    if (expiryDate !== undefined) announcement.expiryDate = expiryDate;
    if (isActive !== undefined) announcement.isActive = isActive;

    await announcement.save();

    // If SUPER_ADMIN wants to update target schools, bulk create/delete announcements
    if (role === "SUPER_ADMIN" && targetSchoolIds && Array.isArray(targetSchoolIds)) {
      // Find all announcements with same title/message created by this user
      const relatedAnnouncements = await Announcement.findAll({
        where: {
          authorId: userId,
          title: announcement.title,
          message: announcement.message,
          authorRole: "SUPER_ADMIN",
        },
      });

      const currentSchoolIds = relatedAnnouncements.map((a) => a.schoolId);
      const schoolsToAdd = targetSchoolIds.filter((id) => !currentSchoolIds.includes(id));
      const schoolsToRemove = currentSchoolIds.filter((id) => !targetSchoolIds.includes(id));

      // Add new schools
      if (schoolsToAdd.length > 0) {
        const newAnnouncements = schoolsToAdd.map((schoolId) => ({
          title: announcement.title,
          message: announcement.message,
          priority: announcement.priority,
          expiryDate: announcement.expiryDate,
          authorId: userId,
          authorRole: "SUPER_ADMIN",
          schoolId,
        }));
        await Announcement.bulkCreate(newAnnouncements);
      }

      // Remove schools
      if (schoolsToRemove.length > 0) {
        await Announcement.destroy({
          where: {
            authorId: userId,
            schoolId: schoolsToRemove,
            title: announcement.title,
            message: announcement.message,
          },
        });
      }
    }

    const updatedAnnouncement = await Announcement.findByPk(id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "role"] },
        { model: School, as: "school", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
};

// Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Find the announcement
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check ownership
    if (announcement.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own announcements",
      });
    }

    // Soft delete (paranoid: true)
    await announcement.destroy();

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message,
    });
  }
};
