const mongoose = require("mongoose");

const comments = new mongoose.Schema({});

module.exports = mongoose.model("comments", comments);