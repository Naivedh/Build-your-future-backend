const express = require("express");
const feedbackModel = require("../models/feedbackModel");
const commentModel = require("../models/feedbackModel");

const feedbackRouter = express.Router();

//get all based on courseID (_id == courseId)
feedbackRouter.get("/feedbacks/:_id", async (req, res) => {
  try {
    const data = await commentModel.find({ courseId: req.params._id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//post one for a courseId 
feedbackRouter.post("/postFeedback", async (req, res) => {
  commentModel.findByIdAndUpdate(
    { courseId: req.body.courseId },
    { $push: { responses: req.body.responses } },
    { new: true, upsert: true },
    function (err, data) {
      if (err) {
        res.status(500).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
});

module.exports = feedbackRouter;
