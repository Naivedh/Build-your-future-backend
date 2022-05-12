const mongoose = require("mongoose");

const responses = new mongoose.Schema({
    studentId:{
        type: String,
        required: true
    },
    studentName:{
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1.0,
        max: 5.0,
    }
});

const feedbacks = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    tutorId:{
        type: String,
        required:true
    },
    responses: [responses],
});

module.exports = mongoose.model("feedback", feedbacks);