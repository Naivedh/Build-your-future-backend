const express = require("express");
const appointmentModel = require("../models/appointmentModel");

const appointmentRouter = express.Router();

//postappointment
appointmentRouter.post("/postAppointment", async (req, res) => {
  const data = new appointmentModel(req.body);

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
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
appointmentRouter.post("/getAppointments/student", async (req, res) => {
    try {
      const data = await appointmentModel.find({
          studentId:req.body.studentId
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
          tutorId:req.body.tutorId
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

//delete (truely delete we need canceled too) => or add here
//big issue deleted any available appointment
// appointmentRouter.delete("/deleteAppointment/:_id", (req, res) => {
//   appointmentModel.findOneAndDelete(req.params._id, function (err, data) {
//     if (err) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.json("Appointment Deleted");
//     }
//   })
// });

module.exports = appointmentRouter;
