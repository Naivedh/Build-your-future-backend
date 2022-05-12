const express = require("express");
const feedbackModel = require("../models/feedbackModel");
const commentModel = require("../models/feedbackModel");
const studentModel = require("../models/studentModel");
const tutorModel = require("../models/tutorModel");
const { checkUser } = require("../utils/checkUser");
const { verfiyTokenAndExtractInfo } = require("../utils/token");

const feedbackRouter = express.Router();

//get all based on tutorId (_id == tutorId)
feedbackRouter.get("/feedbacks/:_id", async (req, res) => {
  try {
    const data = await commentModel.find({ tutorId: req.params._id });
    console.log(data)
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//post one for tutorid
//ome student one feedback baki
feedbackRouter.post("/feedback", async (req, res) => {
  try {
  const { _id, isTutor} = verfiyTokenAndExtractInfo(req.cookies['byf-session-config'], '*');
  checkUser(isTutor, false);
  const student = await studentModel.find({ _id });

  const tutorFeedback = await commentModel.find({ tutorId: req.body.tutorId  });
  const data = tutorFeedback[0].responses.find((student)=>student.studentId === _id);
  if(data){
    return res.status(500).json({ message: "Comment already present"})
  }
  if(!req.body.text.length){
    return res.status(500).json({ message: "Comment cannot be Empty"})
  }

  const feedback = { studentId: _id, text:req.body.text, studentName:student[0].name, imageUrl:student[0].imageUrl, rating: Number(req.body.rating) }
  commentModel.findOneAndUpdate(
    { tutorId: req.body.tutorId },
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
  try {
    const [tutor] = await tutorModel.find({ _id: req.body.tutorId });

  const newAverageRating = ((tutor.ratingCount * tutor.rating) + feedback.rating)/(tutor.ratingCount+1);

  tutor.ratingCount += 1;
  tutor.rating = newAverageRating;

  tutorModel.findByIdAndUpdate(
    req.body.tutorId,
    { $set: tutor },
    { new: true },
    function (err, data) {
      if (err) {
        throw err;
      }
    }
  );
  } catch (err) {
    console.log("Average rating error", err);
  }
  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message})
  }
});

// update delete 
module.exports = feedbackRouter;
