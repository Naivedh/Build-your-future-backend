const mongoose = require("mongoose");
const time = new mongoose.Schema({
    start:{
        required: true,
        type: Number,
        min:000000000000000,
        max:999999999999999
    },
    end:{
        required: true,
        type: Number,
        min:000000000000000,
        max:999999999999999
    },
    isActive: {
      default: true,
      type: Boolean,
    }
});
const appointment = new mongoose.Schema({
  courseId: {
    required: true,
    type: String,
  },
  courseName:{
    required:true,
    type: String
  },
  tutorId: {
    required: true,
    type: String,
  },
  tutorName:{
    required:true,
    type: String
  },
  studentId: {
    required: true,
    type: String,
  },
  studentName:{
    required:true,
    type: String
  },
  timeSlot: [time],
});

module.exports = mongoose.model("appointment", appointment);
