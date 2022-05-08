const mongoose = require("mongoose");
const course = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  desc: {
    required: true,
    type: String,
    default:""
  },
  imageUrl: {
    type: String,
  },
  _id: {
    type: String,
    required: true,
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
    min:000000000000000,
    max:999999999999999
  },
  workingHourEnd: {
    required: true,
    type: Number,
    min:000000000000000,
    max:999999999999999
  },
  //coursea
  courses: [course],
  //check with rating count first before changing
  rating: {
    type: Number,
    default: 0,
  },
  ratingCount:{
    type: Number,
    default:0
  },
  hoursTutored: {
    type: Number,
    default: 0,
  },
  feedbackId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("tutor", tutor);
