const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, default: "" },
  media: [{ type: String }], 
  likes: { type: Number, default: 0 },
  comments: [
    {
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
