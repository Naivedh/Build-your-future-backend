const mongoose = require("mongoose");
const course = new mongoose.Schema({
  tutorId: {
    type: String,
  },
  courseId: {
    type: String,
  },
  courseRating: {
    type: Number,
  },
  isFavourite: {
    type: Boolean,
    default: false,
  },
});

const student = new mongoose.Schema({
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
  //course
  enrolledCourses: [course],
  hoursStudied: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("student", student);
