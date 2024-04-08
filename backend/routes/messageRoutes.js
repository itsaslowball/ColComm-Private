const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessages,
  reportUser
} = require("../controllers/messageControllers");
const router = express.Router();



router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.route("/report").post(protect, reportUser);

module.exports = router;
