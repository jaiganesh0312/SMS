const { Class, Subject, Timetable } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

// --- Classes ---
// --- Classes ---
exports.createClass = async (req, res) => {
  try {
    const { name, section, classTeacherId } = req.body;
    const schoolId = req.user.schoolId; // Assumes protect middleware

    const newClass = await Class.create({ schoolId, name, section, classTeacherId });

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: { class: newClass },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStandards = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const standards = await Class.findAll({
      where: { schoolId },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('name')), 'name']],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: "Standards fetched successfully",
      data: standards.map(s => s.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDivisions = async (req, res) => {
  try {
    const { standard } = req.params;
    const schoolId = req.user.schoolId;

    const divisions = await Class.findAll({
      where: { schoolId, name: standard },
      attributes: ['id', 'section', 'classTeacherId'],
      include: [
        {
          model: require('../models').User,
          as: 'classTeacher',
          attributes: ['id', 'name']
        }
      ],
      order: [['section', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: "Divisions fetched successfully",
      data: divisions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.assignClassTeacher = async (req, res) => {
  try {
    const { classId } = req.params;
    const { teacherId } = req.body;
    const schoolId = req.user.schoolId;

    const classToUpdate = await Class.findOne({ where: { id: classId, schoolId } });

    if (!classToUpdate) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    classToUpdate.classTeacherId = teacherId;
    await classToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Class teacher assigned successfully",
      data: classToUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const { literal } = require("sequelize");

exports.getAllClasses = async (req, res) => {
  try {
    let schoolId = req.user.schoolId;
    const { schoolId: querySchoolId } = req.query;

    if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
      schoolId = querySchoolId;
    }

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }

    const classes = await Class.findAll({
      where,
      attributes: {
        include: [
          [
            literal(`(
              SELECT COUNT(*)
              FROM "students" AS s
              WHERE s."classId" = "Class"."id"
            )`),
            "studentsCount"
          ]
        ]
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Classes fetched successfully",
      results: classes.length,
      data: { classes },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    let schoolId = req.user.schoolId;
    if (req.user.role === 'SUPER_ADMIN' && req.query.schoolId) {
      schoolId = req.query.schoolId;
    }

    const { User } = require('../models');

    const teachers = await User.findAll({
      where: {
        schoolId,
        role: 'TEACHER',
        isActive: true
      },
      attributes: ['id', 'name', 'email']
    });

    res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      data: teachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --- Subjects ---
exports.createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;
    const schoolId = req.user.schoolId;

    const newSubject = await Subject.create({ schoolId, name, code });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: { subject: newSubject }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    let schoolId = req.user.schoolId;
    const { schoolId: querySchoolId } = req.query;

    if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
      schoolId = querySchoolId;
    }

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }

    const subjects = await Subject.findAll({ where });

    res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      results: subjects.length,
      data: { subjects }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --- Timetable ---
exports.createTimetableEntry = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;
    let schoolId = req.user.schoolId;

    // Handle Super Admin case
    if (req.user.role === "SUPER_ADMIN") {
      schoolId = req.body.schoolId;
      if (!schoolId) {
        return res.status(400).json({ success: false, message: "School ID is required for Super Admin" });
      }
    }

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found for user" });
    }

    // Check for conflicts (Simplified)
    // 1. Teacher overlapping
    // 2. Class overlapping
    // Doing logic here or service level. For MVP Controller is fine.

    const newEntry = await Timetable.create({
      schoolId, classId, subjectId, teacherId, dayOfWeek, startTime, endTime, classroom: room
    });

    res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      data: { timetable: newEntry }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createDailyTimetable = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { classId, dayOfWeek, periods } = req.body;
    let schoolId = req.user.schoolId;

    if (req.user.role === "SUPER_ADMIN") {
      schoolId = req.body.schoolId;
      if (!schoolId) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "School ID is required for Super Admin" });
      }
    }

    if (!classId || !dayOfWeek || !periods || !Array.isArray(periods)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Invalid input. classId, dayOfWeek and periods (array) are required." });
    }

    // Normalize dayOfWeek to Title Case (e.g., "THURSDAY" -> "Thursday")
    const formattedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

    // --- Conflict Detection ---

    // 1. Check for Internal Conflicts (within the payload itself)
    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        const p1 = periods[i];
        const p2 = periods[j];
        if (p1.teacherId === p2.teacherId && p1.teacherId) {
          // Check Overlap
          // Overlap if (StartA < EndB) and (EndA > StartB)
          if (p1.startTime < p2.endTime && p1.endTime > p2.startTime) {
            await transaction.rollback();
            return res.status(409).json({ // 409 Conflict
              success: false,
              message: `Internal Conflict: Teacher is assigned to multiple overlapping periods in this request (Times: ${p1.startTime}-${p1.endTime} and ${p2.startTime}-${p2.endTime}).`
            });
          }
        }
      }
    }

    // 2. Database Conflict Check (Against other classes)
    // Gather all teacher IDs involved
    const teacherIds = periods.map(p => p.teacherId).filter(id => id);

    if (teacherIds.length > 0) {
      const existingSchedules = await Timetable.findAll({
        where: {
          schoolId,
          dayOfWeek: formattedDay,
          teacherId: { [Op.in]: teacherIds },
          classId: { [Op.ne]: classId } // Exclude the current class (since we are replacing its schedule anyway)
        },
        include: [
          { model: Class, attributes: ['name', 'section'] },
          { model: require('../models').User, attributes: ['name'] } // To get Teacher Name
        ],
        transaction
      });

      for (const newPeriod of periods) {
        if (!newPeriod.teacherId) continue;

        // Find bookings for this teacher
        const teacherBookings = existingSchedules.filter(s => s.teacherId === newPeriod.teacherId);

        for (const booking of teacherBookings) {
          // Check overlap
          // booking.startTime and booking.endTime are "HH:mm:ss" strings (TIME type)
          // newPeriod.startTime/endTime are likely "HH:mm" strings
          // String comparison works for ISO time format "HH:mm" vs "HH:mm:ss" as long as we align them or just rely on lex sort if format matches
          // StartTime usually comes as "09:00:00" from DB. Input "09:00".
          // Let's standardise to full string comparison or simple string if formats align.
          // Safest is to treat as strings. "09:00" < "09:30:00" is true.

          const newStart = newPeriod.startTime.length === 5 ? newPeriod.startTime + ":00" : newPeriod.startTime;
          const newEnd = newPeriod.endTime.length === 5 ? newPeriod.endTime + ":00" : newPeriod.endTime;
          const bookStart = booking.startTime.length === 5 ? booking.startTime + ":00" : booking.startTime;
          const bookEnd = booking.endTime.length === 5 ? booking.endTime + ":00" : booking.endTime;

          if (newStart < bookEnd && newEnd > bookStart) {
            await transaction.rollback();
            const teacherName = booking.User ? booking.User.name : "Teacher";
            const className = booking.Class ? `${booking.Class.name}-${booking.Class.section}` : "another class";
            return res.status(409).json({
              success: false,
              message: `Conflict: ${teacherName} is already assigned to ${className} from ${booking.startTime.slice(0, 5)} to ${booking.endTime.slice(0, 5)}.`
            });
          }
        }
      }
    }


    // 1. Delete existing entries for this class and day (After conflict check passes!)
    await Timetable.destroy({
      where: {
        schoolId,
        classId,
        dayOfWeek: formattedDay
      },
      transaction
    });

    // 2. Prepare new entries
    const newEntries = periods.map(period => ({
      schoolId,
      classId,
      dayOfWeek: formattedDay,
      subjectId: period.subjectId,
      teacherId: period.teacherId, // Required by model
      startTime: period.startTime,
      endTime: period.endTime,
      classroom: period.room || null
    }));

    // 3. Bulk Create
    if (newEntries.length > 0) {
      await Timetable.bulkCreate(newEntries, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: `Timetable for ${formattedDay} updated successfully`,
      results: newEntries.length
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    let schoolId = req.user.schoolId;
    const { classId, teacherId, schoolId: querySchoolId } = req.query;

    if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
      schoolId = querySchoolId;
    }

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;

    const timetable = await Timetable.findAll({
      where,
      include: ["Class", "Subject", "User"]
    });

    res.status(200).json({
      success: true,
      message: "Timetable fetched successfully",
      data: { timetable }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
