const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");
const rateLimit = require("express-rate-limit");

// Additional rate limiting specific to chat to prevent spam
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many chat requests from this IP, please try again later"
});

router.use(protect);
router.use(chatLimiter);

router.get("/conversations", chatController.getConversations);
router.post("/conversations/:userId", chatController.getOrCreateConversation);
router.get("/messages", chatController.getMessages);
router.post("/messages", chatController.sendMessage);
router.patch("/messages/:id/read", chatController.markRead);
router.get("/users", chatController.getChatUsers);

module.exports = router;
