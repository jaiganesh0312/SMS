const { LibrarySection, Book, LibraryTransaction, User, Student, StaffProfile, School, Sequelize, sequelize } = require("../models");
const { Op } = require("sequelize");

// --- Sections ---

exports.createSection = async (req, res) => {
    try {
        const { name, description, location } = req.body;
        const { schoolId } = req.user;

        const section = await LibrarySection.create({
            schoolId,
            name,
            description,
            location,
        });

        res.status(201).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSections = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const sections = await LibrarySection.findAll({ where: { schoolId } });
        res.status(200).json({ success: true, data: sections });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, location } = req.body;

        await LibrarySection.update(
            { name, description, location },
            { where: { id, schoolId: req.user.schoolId } }
        );

        res.status(200).json({ success: true, message: "Section updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        await LibrarySection.destroy({ where: { id, schoolId: req.user.schoolId } });
        res.status(200).json({ success: true, message: "Section deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Books ---

exports.createBook = async (req, res) => {
    try {
        const { sectionId, title, author, isbn, publisher, category, quantity, description } = req.body;
        const { schoolId } = req.user;

        const book = await Book.create({
            schoolId,
            sectionId,
            title,
            author,
            isbn,
            publisher,
            category,
            quantity,
            available: quantity, // Initially all are available
            description,
        });

        res.status(201).json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBooks = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { sectionId, search } = req.query;

        let where = { schoolId };
        if (sectionId) where.sectionId = sectionId;
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } },
                { isbn: { [Op.like]: `%${search}%` } }
            ];
        }

        const books = await Book.findAll({
            where,
            include: [{ model: LibrarySection, attributes: ["name"] }]
        });
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBookDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findOne({
            where: { id, schoolId: req.user.schoolId },
            include: [
                { model: LibrarySection, attributes: ["name"] },
                {
                    model: LibraryTransaction,
                    include: [{ model: User, attributes: ["name", "email", "role"] }],
                    order: [["createdAt", "DESC"]]
                }
            ]
        });

        if (!book) return res.status(404).json({ success: false, message: "Book not found" });

        res.status(200).json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Care with quantity updates logic if needed

        // If quantity is changing, we should adjust available count too? 
        // For simplicity, let's say if total quantity increases, available increases by same amount.
        if (updates.quantity !== undefined) {
            const book = await Book.findByPk(id);
            const diff = updates.quantity - book.quantity;
            updates.available = book.available + diff;
        }

        await Book.update(updates, { where: { id, schoolId: req.user.schoolId } });
        res.status(200).json({ success: true, message: "Book updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        await Book.destroy({ where: { id, schoolId: req.user.schoolId } });
        res.status(200).json({ success: true, message: "Book deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// --- Transactions ---

exports.issueBook = async (req, res) => {
    const t = await sequelize.transaction();
    // Note: In index.js we exported sequelize as 'sequelize'. 
    // Need to correctly import sequelize instance. 
    // The top import was: const { ..., sequelize } = require("../models") - check if index.js exports sequelize directly
    // Yes index.js exports { sequelize, ... }

    try {
        const { bookId, userId, studentId, dueDate } = req.body;
        const { schoolId } = req.user;

        if (!userId && !studentId) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "User or Student is required" });
        }

        // Check book availability
        const book = await Book.findOne({ where: { id: bookId, schoolId }, transaction: t });
        if (!book || book.available < 1) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Book not available" });
        }

        // Create Transaction
        const transaction = await LibraryTransaction.create({
            schoolId,
            bookId,
            userId: userId || null, // Ensure explicit null if undefined
            studentId: studentId || null,
            issueDate: new Date(),
            dueDate,
            status: 'ISSUED'
        }, { transaction: t });

        // Decrement available count
        await book.decrement('available', { transaction: t });

        await t.commit();
        res.status(201).json({ success: true, data: transaction });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.returnBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { transactionId, returnDate, fineAmount, remarks } = req.body;

        const transaction = await LibraryTransaction.findOne({
            where: { id: transactionId },
            transaction: t
        });

        if (!transaction || transaction.status === 'RETURNED') {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Invalid transaction" });
        }

        // Update Transaction
        await transaction.update({
            returnDate: returnDate || new Date(),
            status: 'RETURNED',
            fineAmount: fineAmount || 0,
            remarks
        }, { transaction: t });

        // Increment book availability
        await Book.increment('available', {
            where: { id: transaction.bookId },
            transaction: t
        });

        await t.commit();
        res.status(200).json({ success: true, message: "Book returned" });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.renewBook = async (req, res) => {
    try {
        const { transactionId, newDueDate } = req.body;

        const transaction = await LibraryTransaction.findOne({ where: { id: transactionId } });
        if (!transaction || transaction.status !== 'ISSUED') {
            return res.status(400).json({ success: false, message: "Invalid transaction" });
        }

        await transaction.update({
            dueDate: newDueDate
        });

        res.status(200).json({ success: true, message: "Book renewed" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { userId, status } = req.query;

        let where = { schoolId };
        if (userId) where.userId = userId;
        if (status) where.status = status;

        const transactions = await LibraryTransaction.findAll({
            where,
            include: [
                { model: Book, attributes: ["title", "isbn"] },
                { model: User, attributes: ["name", "email", "role"] },
                { model: Student, attributes: ["name", "admissionNumber", "classId"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { schoolId } = req.user;

        const totalBooks = await Book.count({ where: { schoolId } });
        const totalSections = await LibrarySection.count({ where: { schoolId } });
        const issuedBooks = await LibraryTransaction.count({ where: { schoolId, status: 'ISSUED' } });
        const overdueBooks = await LibraryTransaction.count({
            where: {
                schoolId,
                status: 'ISSUED',
                dueDate: { [Op.lt]: new Date() }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalBooks,
                totalSections,
                issuedBooks,
                overdueBooks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
