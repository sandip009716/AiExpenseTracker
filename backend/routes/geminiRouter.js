const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuth");
const {
  sendUserDataToGemini,
  sendUserChatToGemini,
  extractCategoryFromVoice,
  extractTransactionFromVoice
} = require("../controllers/geminiCtrl");

// Send user data initially
router.post("/gemini/start", isAuthenticated, sendUserDataToGemini);

// Handle follow-up chat
router.post("/gemini/chat", isAuthenticated, sendUserChatToGemini);

// Extract category type and name from user input
router.post("/gemini/extract-category", isAuthenticated, extractCategoryFromVoice);

// Extract transaction from voice
router.post("/gemini/extract-transaction", isAuthenticated, extractTransactionFromVoice);

module.exports = router;
