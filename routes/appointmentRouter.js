const express = require("express");
const appointmentModel = require("../models/appointmentModel");
const appointmentRouter = express.Router();

//add appointment (array issue)
appointmentRouter.post("/postAppointment", async (req, res) => {

  const data = await appointmentModel.find({courseId: req.body.courseId, tutorId: req.body.tutorId, studentId: req.body.studentId})

  if(data.length === 0){
    const newData = new appointmentModel(req.body);
    try {
      const dataToSave = await newData.save();
      res.status(200).json(dataToSave);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  else{
    try {

      appointmentModel.findOneAndUpdate(
        {courseId: req.body.courseId, tutorId:req.body.tutorId, studentId: req.body.studentId},
        {$push: {timeSlot: req.body.timeSlot}},
        {new:true, upsert:true},
        function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).json({ message: err.message });
          } else {
            res.json(data);
          }
        }
      )
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

});

//get one
appointmentRouter.get("/appointment/:_id", async (req, res) => {
  try {
    const data = await appointmentModel.find({
      _id: req.params._id,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//getall for a student
appointmentRouter.post("/getAppointments/student", async (req, res) => {
  try {
    const data = await appointmentModel.find({
      studentId: req.body.studentId
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//getall for a tutor
appointmentRouter.post("/getAppointments/tutor", async (req, res) => {
  try {
    const data = await appointmentModel.find({
      tutorId: req.body.tutorId
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete
appointmentRouter.delete("/deleteAppointment/:_id", (req, res) => {
  appointmentModel.findOneAndDelete({ _id: req.params._id }, function (err, data) {
    if (err) {
      res.status(500).json({ message: err });
    }
    else if(data){
      res.json("Appointment Deleted");
    }
    else{
      res.json("Appointment Not Found");
    }
  })
});

module.exports = appointmentRouter;
