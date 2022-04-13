const express = require("express");
const feedbackModel = require("../models/feedbackModel");
const commentModel = require("../models/feedbackModel");
const { checkUser } = require("../utils/checkUser");
const { verfiyTokenAndExtractInfo } = require("../utils/token");

const feedbackRouter = express.Router();

//get all based on courseID (_id == courseId)
feedbackRouter.get("/feedbacks/:_id", async (req, res) => {
  try {
    console.log("Inside filter feedbacks");
    const data = await commentModel.find({ courseId: req.params._id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//post one for a courseId 
feedbackRouter.post("/postFeedback", async (req, res) => {
  try {
  const { _id, isTutor} = verfiyTokenAndExtractInfo(req.cookies['catch (error) {
      res.status(400).json({ message: error.message });
    }'], '*');
  checkUser(isTutor, false);
  const feedback = { studentId: _id, ...req.body }
  console.log(feedback);
  commentModel.findOneAndUpdate(
    { courseId: req.body.courseId },
    { $push: { responses: feedback } },
    { new: true, upsert: true },
    function (err, data) {
      if (err) {
        res.status(500).json({ message: err.message });
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

// update delete 
module.exports = feedbackRouter;
