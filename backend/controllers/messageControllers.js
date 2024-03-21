const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const axios = require("axios");
const FormData = require("form-data");

const sendMessage = asyncHandler(async (req, res) => {
  const content = req.body.content;
  const chatId = req.body.chatId;
  const imageUrl = req.body.imageUrl;
  console.log(imageUrl)

  console.log(".................into the backend............");

  if (!chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  if (!content && !imageUrl) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  if (imageUrl) {
    console.log("into the image part")
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

    try {
      const flaskApiEndpoint =
        "https://monthly-caring-bear.ngrok-free.app/predictSentiment";
      const modelResponse = await axios.post(flaskApiEndpoint, {
        text: imageText,
      });
      console.log(modelResponse);
      const label = modelResponse.data[0].label;
      console.log(label);
      if (label === "negative") {
        throw new Error("Hateful or Abusive Image");
      }
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ error: error.message });
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
    console.log(label);
    if (label === "negative") {
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

  // If an image file is uploaded, add image data to the message object
  // if (imageFile) {
  //       newMessage.imageName = imageFile.filename;
  // }
  // console.log(newMessage);

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

module.exports = { sendMessage, allMessages };
