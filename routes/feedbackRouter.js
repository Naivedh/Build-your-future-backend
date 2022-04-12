const express = require("express");
const feedbackModel = require("../models/feedbackModel");
const commentModel = require("../models/feedbackModel");
const { verfiyTokenAndExtractInfo } = require("../utils/token");

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
  try {
  const tokenInfo = verfiyTokenAndExtractInfo(req.cookies['byf-session-config'], '*');

  const { isTutor, _id } = tokenInfo; // _id is studentId
  if (isTutor) { 
    return res.status(500).json({ message: 'You should be a student to post a feedback'})
  }
  const feedback = { studentId: _id, ...req.body.text }
  commentModel.findByIdAndUpdate(
    { courseId: req.body.courseId },
    { $push: { responses: feedback } },
    { new: true, upsert: true },
    function (err, data) {
      if (err) {
        res.status(500).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message})
  }
});

module.exports = feedbackRouter;
