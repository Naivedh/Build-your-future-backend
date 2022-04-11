const mongoose = require("mongoose");

const responses = new mongoose.Schema({
    studentId:{
        type: String,
        required:true
    },
    response:{
        type: String,
        required:true
    }
});

const feedbacks = new mongoose.Schema({
    courseId:{
        type: String,
        required:true
    },
    tutorId:{
        type: String,
        required:true
    },
    responses: [responses],
});

module.exports = mongoose.model("feedback", feedbacks);