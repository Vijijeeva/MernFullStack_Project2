const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/", auth, upload.array("media", 10), async (req, res) => {
  try {
    const { title, body = "" } = req.body;
    const media = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const newPost = new Post({
      title,
      body,
      media,
      author: req.user.id,
    });

    await newPost.save();
    const fullPost = await Post.findById(newPost._id).populate("author", ["username"]);
    res.json(fullPost);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ msg: "Server error while creating post" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error while fetching posts" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, body, media } = req.body;
    console.log("Update request body:", req.body);
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.author.toString() !== req.user.id)
      return res.status(401).json({ msg: "User not authorized" });
    if (title !== undefined) post.title = title;
    if (body !== undefined) post.body = body;
    if (media !== undefined) {
      console.log("Updating media from:", post.media, "to:", media);
      post.media = media;
    }

    await post.save();
    const updated = await Post.findById(post._id).populate("author", ["username"]);
    
    console.log("Post updated successfully:", updated._id);
    res.json(updated);
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).json({ msg: "Server error while updating post" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ msg: "User not authorized" });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ msg: "Server error deleting post" });
  }
});

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/comment", async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    post.comments.push({ text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;