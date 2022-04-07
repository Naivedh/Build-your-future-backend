const mongoose = require("mongoose");
const course = new mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  rating: {
    type: Number,
  },
  feedback_id: {
    type: String,
  },
});

const tutor = new mongoose.Schema({
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  about: {
    type: String,
    default: "",
  },
  desc: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
  },
  workingHourStart: {
    required: true,
    type: Number,
  },
  workingHourEnd: {
    required: true,
    type: Number,
  },
  //course
  courses: [course],
  stars: {
    type: Number,
  },
  hoursTutored: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("tutor", tutor);
