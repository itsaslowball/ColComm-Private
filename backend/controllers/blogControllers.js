const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const axios = require("axios");

const allBlogs = asyncHandler(async (req, res) => {
  if (req.query.search) {
    const keyword = req.query.search
      ? {
          $or: [{ title: { $regex: req.query.search, $options: "i" } }],
        }
      : {};

    const blogs = await Blog.find(keyword)
      .sort({ createdAt: -1 })
      .populate("user", "-password");
    res.send(blogs);
  } else {
    const blog = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("user", "-password");
    res.send(blog);
  }
});

const composeBlog = asyncHandler(async (req, res) => {
  const { title, postContent, user } = req.body;

  const content = title + " " + postContent;

  try {
    const flaskApiEndpoint =
      "https://monthly-caring-bear.ngrok-free.app/predictSentiment";
    const modelResponse = await axios.post(flaskApiEndpoint, {
      text: content,
    });

    const label = modelResponse.data[0].label;
    const score = modelResponse.data[0].score;

    if (label === "negative") {
      throw new Error("Hateful or Abusive Text");
    }
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ error: error.message });
  }

  console.log(title, postContent);

  var newBlog = {
    user: user._id,
    title: title,
    postContent: postContent,
  };

  try {
    const blog = await Blog.create(newBlog);
    res.json(blog);
  } catch (error) {
    res.status(400);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  console.log(blogId);

  try {
    const blog = await Blog.findByIdAndDelete(blogId);
    res.send(blog);
  } catch (error) {
    res.status(400);
  }
});

module.exports = {
  allBlogs,
  composeBlog,
  deleteBlog,
};
