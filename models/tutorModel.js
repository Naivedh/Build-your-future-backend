const mongoose = require("mongoose");
const course = new mongoose.Schema({
  title: {
    required: true,
    type: String,
    unique: true,
  },
  description: {
    required: true,
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  feedbackId: {
    type: String,
    required: true
  },
  _id: {
    type: String,
    required: true,
  },
  ratingCount:{
    type: Number,
    default:0
  },
});

const tutor = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true,
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
  //coursea
  courses: [course],
  //check with rating count first before changing
  rating: {
    type: Number,
    default: 0
  },
  hoursTutored: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("tutor", tutor);
