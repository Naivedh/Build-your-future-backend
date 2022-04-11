const mongoose = require("mongoose");
const time = new mongoose.Schema({
    start:{
        required: true,
        type: Number
    },
    end:{
        required: true,
        type: Number
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
  tutorId: {
    required: true,
    type: String,
  },
  studentId: {
    required: true,
    type: String,
  },
  timeSlot: [time],
});

module.exports = mongoose.model("appointment", appointment);
