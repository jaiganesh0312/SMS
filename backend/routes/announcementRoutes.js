const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const announcementController = require('../controllers/announcementController');

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(announcementController.getAnnouncements)
  .post(
    restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN'),
    announcementController.createAnnouncement
  );

router
  .route('/:id')
  .put(
    restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN'),
    announcementController.updateAnnouncement
  )
  .delete(
    restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN'),
    announcementController.deleteAnnouncement
  );

module.exports = router;
