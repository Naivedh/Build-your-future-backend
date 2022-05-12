const mongoose = require("mongoose");
const course = new mongoose.Schema({
  tutorId: {
    type: String,
    required:true
  },
  courseId: {
    type: String,
    required: true
  },
  courseName:{
    type:String,
    required:true
  },
  courseImageUrl:{
    type:String,
    required:true
  },
  courseRating: {
    type: Number,
    default:0,
  },
  // isFavourite: {
  //   type: Boolean,
  //   default: false,
  // },
});

const favouriteTutor = new mongoose.Schema({
  tutorId: {
    type: String,
    required: true,
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
  favouriteTutors: [favouriteTutor],
  enrolledCourses: [course],
  hoursStudied: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("student", student);
