const express = require("express");
const feedbackModel = require("../models/feedbackModel");
const commentModel = require("../models/feedbackModel");
const studentModel = require("../models/studentModel");
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
    return res.status(500).json({ message: "Feedback already Present"})
  }
  if(!req.body.text.length){
    return res.status(500).json({ message: "Feeback cannot be Empty"})
  }

  const feedback = { studentId: _id, text:req.body.text, studentName:student[0].name, imageUrl:student[0].imageUrl }
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
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message})
  }
});

// update delete 
module.exports = feedbackRouter;
