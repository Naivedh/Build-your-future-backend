const express = require("express");
const appointmentModel = require("../models/appointmentModel");
const tutorModel = require("../models/tutorModel");
const { checkUser } = require("../utils/checkUser");
const { verfiyTokenAndExtractInfo } = require("../utils/token");
const appointmentRouter = express.Router();

//add appointment (array issue)
// TODO: check if time in timeslot and not clashing with other
appointmentRouter.post("/appointment", async (req, res) => {
  try {
    const isTutor = verfiyTokenAndExtractInfo(req.cookies["byf-session-config"], "isTutor");
    checkUser(isTutor, false);

    reqHoursStart = req.body.timeSlot.start.getHours();
    reqHourEnd = req.body.timeSlot.end.getHours();
    reqMinuteStart = req.body.timeSlot.start.getMinutes();
    reqMinuteEnd = req.body.timeSlot.end.getMinutes();

    // within working hours
    const { workingHourStart, workingHourEnd } = await tutorModel.find({ tutorId: req.body.tutorId });
    if (reqHoursStart< workingHourStart.getHours() && reqMinuteStart < workingHourStart.getMinutes() && reqHourEnd > workingHourEnd.getHours() && req.reqMinuteEnd > workingHourEnd.getMinutes()) {
      res.status(400).json({ message: "Please select time within working Hours" });
    }

    const tutorAppointmentData = await appointmentModel.find({ tutorId: req.body.tutorId })

    tutorAppointmentData.map((specific) => {
      specific.timeSlot.map((oneAppointment) => {
        if ((oneAppointment.start.getHours() > reqHourEnd && oneAppointment.start.getMinutes() > reqMinuteEnd) || (oneAppointment.end.getHours()<reqHoursStart && oneAppointment.end.getMinutes()<reqMinuteStart)){
        res.status(400).json({ message: "Please select some other timeslot" });
      }
    })
  })


const data = await appointmentModel.find({ courseId: req.body.courseId, tutorId: req.body.tutorId, studentId: req.body.studentId })

if (data.length === 0) {
  const newData = new appointmentModel(req.body);
  try {
    const dataToSave = await newData.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
else {
  appointmentModel.findOneAndUpdate(
    { courseId: req.body.courseId, tutorId: req.body.tutorId, studentId: req.body.studentId },
    { $push: { timeSlot: req.body.timeSlot } },
    { new: true, upsert: true },
    function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
      } else {
        res.json(data);
      }
    }
  )
} 
  }
  catch (error) {
  res.status(400).json({ message: error.message });
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
appointmentRouter.post("/appointments/student", async (req, res) => {
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
appointmentRouter.post("/appointments/tutor", async (req, res) => {
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
appointmentRouter.delete("/appointment/:_id", (req, res) => {
  appointmentModel.findOneAndDelete({ _id: req.params._id }, function (err, data) {
    if (err) {
      res.status(500).json({ message: err });
    }
    else if (data) {
      res.json("Appointment Deleted");
    }
    else {
      res.json("Appointment Not Found");
    }
  })
});


module.exports = appointmentRouter;
