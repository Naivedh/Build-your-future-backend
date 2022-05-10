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
    status: {
      default: 'ACTIVE',
      type: String,
    },
});

const appointment = new mongoose.Schema({
  tutorId: {
    required: true,
    type: String,
  },
  tutorName:{
    required:true,
    type: String
  },
  tutorImageUrl: {
    required: true,
    type: String
  },
  studentImageUrl: {
    required: true,
    type: String,
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
