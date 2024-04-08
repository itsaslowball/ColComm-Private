const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const axios = require("axios");
const FormData = require("form-data");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const reportUser = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  if (userId) {
    let user = await User.findById(userId);
    console.log(user);
    user = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalReports: 1 } },
      { new: true }
    );

    if (user.totalReports > 3) {
      try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
          console.log(`User with ID ${userId} not found.`);
          return;
        }

        // Generate a random password
        const randomPassword = Math.random().toString(36).slice(-8);

        // Hash the random password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        const randomEmail = `${uuidv4()}@example.com`;
        // Update user's password, name, and email
        user.password = hashedPassword;
        user.name = "Deleted User";
        user.email = randomEmail;
        user.pic ="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

        await user.save();

        console.log(`User ${userId} soft deleted successfully.`);
        console.log(`New password for ${user.name}: ${randomPassword}`);
      } catch (error) {
        console.error("Error soft deleting user:", error);
      }
    }
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const content = req.body.content;
  const chatId = req.body.chatId;
  const imageUrl = req.body.imageUrl;

  if (!chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  if (!content && !imageUrl) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  if (imageUrl) {
    let formData = new FormData();

    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("url", imageUrl);
    formData.append("iscreatesearchablepdf", "false");
    formData.append("issearchablepdfhidetextlayer", "false");
    const headers = {
      apikey: "K89977488288957",
    };

    const imgData = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      { headers }
    );
    const imageText = imgData.data.ParsedResults[0].ParsedText;

    if (imageText.length > 2) {
      try {
        const flaskApiEndpoint =
          "https://monthly-caring-bear.ngrok-free.app/predictSentiment";
        const modelResponse = await axios.post(flaskApiEndpoint, {
          text: imageText,
        });

        const label = modelResponse.data[0].label;

        if (label === "negative") {
          throw new Error("Hateful or Abusive Image");
        }
      } catch (error) {
        console.error(error.message);
        return res.status(400).json({ error: error.message });
      }
    }
  }

  // sentimental analysis for text

  try {
    const flaskApiEndpoint =
      "https://monthly-caring-bear.ngrok-free.app/predictSentiment";
    const modelResponse = await axios.post(flaskApiEndpoint, {
      text: content,
    });

    const label = modelResponse.data[0].label;
    const score = modelResponse.data[0].score;
    console.log("...............");
    console.log(label, score);
    if (label === "negative" || (label === "neutral" && score < 0.3)) {
      throw new Error("Hateful or Abusive Text");
    }
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ error: error.message });
  }

  // Create a new message object
  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    imageUrl: imageUrl,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const message = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages, reportUser };
