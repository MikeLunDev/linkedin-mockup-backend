const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    username: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

var Posts = mongoose.model("posts", postSchema);

module.exports = Posts;
