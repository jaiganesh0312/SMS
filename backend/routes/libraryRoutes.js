const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// All routes protected
router.use(protect);

// Librarian/Admin routes
router.use(restrictTo("SCHOOL_ADMIN", "LIBRARIAN"));

// Section Routes
router.post("/sections", libraryController.createSection);
router.get("/sections", libraryController.getSections);
router.put("/sections/:id", libraryController.updateSection);
router.delete("/sections/:id", libraryController.deleteSection);

// Book Routes
router.post("/books", libraryController.createBook);
router.get("/books", libraryController.getBooks);
router.get("/books/:id", libraryController.getBookDetails);
router.put("/books/:id", libraryController.updateBook);
router.delete("/books/:id", libraryController.deleteBook);

// Transaction Routes
router.post("/issue", libraryController.issueBook);
router.post("/return", libraryController.returnBook);
router.post("/renew", libraryController.renewBook);
router.get("/transactions", libraryController.getTransactions);
router.get("/stats", libraryController.getDashboardStats);

module.exports = router;
