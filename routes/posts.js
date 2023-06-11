const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/post_model");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Protected route example - requires authentication
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    console.log("Name:", query);
    if (query == null || query == undefined || query == "") {
      const posts = await Post.find();
      const data = {
        success: true,
        data: posts,
      };
      res.status(200).json(data);
      return;
    }
    // builded a query q to which I can search with both title and description
    console.log(req.userId);
    const condition = {
      $or: [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive search on the title field
        { description: { $regex: query, $options: "i" } }, // Case-insensitive search on the description field
      ],
      $and: [{ userId: req.userId }],
    };
    const posts = await Post.find(condition);

    const data = {
      success: true,
      data: posts,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error Occurred" });
  }
});
// post a post
router.post("/", authenticateToken, async (req, res) => {
  const token = req.headers.authorization;
  const userIdA = jwt.verify(token, process.env.SECRET_KEY)._id;

  console.log(req.body);
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    userId: req.userId,
  });

  //   restricting user to post if title already exists
  const title = req.body.title;

  try {
    const savedPost = await post.save();
    const data = {
      success: true,
      data: savedPost,
    };
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Occurred" });
  }
});

module.exports = router;
