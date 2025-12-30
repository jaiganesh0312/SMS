const { 
  School, 
  User, 
  Student, 
  Parent, 
  Class, 
  Subject 
} = require("../models");

const { Sequelize } = require("sequelize");

exports.getSchoolStats = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const [
      studentsCount,
      teachersCount,
      classesCount,
      parentsCount,
      recentStudents
    ] = await Promise.all([
      Student.count({ where: { schoolId } }),
      User.count({ where: { schoolId, role: 'TEACHER' } }), // Assuming TEACHER role exists
      Class.count({ where: { schoolId } }),
      Parent.count({ 
        include: [{ 
          model: User, 
          where: { schoolId },
          required: true 
        }] 
      }),
      Student.findAll({
        where: { schoolId },
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'admissionNumber', 'createdAt'],
        include: [{ model: Class, attributes: ['name', 'section'] }]
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          students: studentsCount,
          teachers: teachersCount,
          classes: classesCount,
          parents: parentsCount
        },
        recentStudents
      }
    });
  } catch (error) {
    console.error("Get school stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    // Check if user is SUPER_ADMIN (middleware usually handles this but safety check)
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [
      schoolsCount,
      usersCount,
      recentSchools
    ] = await Promise.all([
      School.count(),
      User.count(),
      School.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'createdAt', 'status', // Ensure 'status' exists or remove
        // Write raw sql query to get the School ADMIN using literal
      [
      Sequelize.literal(`(
        SELECT u.email
        FROM users u
        WHERE u."schoolId" = "School"."id"
          AND u.role = 'SCHOOL_ADMIN'
        LIMIT 1
      )`),
      'schoolAdminEmail',]
    ],

      })
    ]);

    // Mock revenue for now as we don't have subscription model fully detailed
    const totalRevenue = schoolsCount * 1500; 

    res.status(200).json({
      success: true,
      data: {
        counts: {
          schools: schoolsCount,
          users: usersCount,
          revenue: totalRevenue
        },
        recentSchools
      }
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getSchools = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const schools = await School.findAll({
      attributes: [
        'id', 'name', 'address', 'logo', 'board', 'academicYear', 'status', 'createdAt',
        [
          Sequelize.literal(`(
            SELECT u.email
            FROM users u
            WHERE u."schoolId" = "School"."id"
              AND u.role = 'SCHOOL_ADMIN'
            LIMIT 1
          )`),
          'adminEmail'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM students s
            WHERE s."schoolId" = "School"."id"
          )`),
          'studentsCount'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM users u
            WHERE u."schoolId" = "School"."id"
              AND u.role = 'TEACHER'
          )`),
          'teachersCount'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM users u
            WHERE u."schoolId" = "School"."id"
              AND u.role = 'STAFF'
          )`),
          'staffCount'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM classes c
            WHERE c."schoolId" = "School"."id"
          )`),
          'classesCount'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM subjects sub
            WHERE sub."schoolId" = "School"."id"
          )`),
          'subjectsCount'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM exams e
            WHERE e."schoolId" = "School"."id"
          )`),
          'examsCount'
        ]
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error("Get schools error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
