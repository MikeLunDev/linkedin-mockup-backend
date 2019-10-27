const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: false
    },
    description: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: false
    },
    image: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("experienceSchema", experienceSchema);
