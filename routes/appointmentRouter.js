const express = require("express");
const appointmentModel = require("../models/appointmentModel");
const studentModel = require("../models/studentModel");
const tutorModel = require("../models/tutorModel");
const { checkUser } = require("../utils/checkUser");
const { verfiyTokenAndExtractInfo } = require("../utils/token");
const appointmentRouter = express.Router();

//add appointment (array issue)
// TODO: check if time in timeslot and not clashing with other
//cannot send everything get coursename student name tutorname
appointmentRouter.post("/appointment", async (req, res) => {
  try {
    const { isTutor, _id: studentId } = verfiyTokenAndExtractInfo(req.cookies["byf-session-config"], "*");
    checkUser(isTutor, false);

    const { tutorId, timeSlot } = req.body;
    const reqStartHour = new Date(timeSlot.start).getHours();
    const reqEndHour = new Date(timeSlot.end).getHours();
    const reqStartMinute = new Date(timeSlot.start).getMinutes();
    const reqEndMinute = new Date(timeSlot.end).getMinutes();

    // within working hours
    const tutor = await tutorModel.find({ _id: tutorId });
    const student = await studentModel.find({ _id: studentId });

    const { imageUrl: studentImageUrl, name: studentName } = student[0];
    
    const { workingHourStart, workingHourEnd, name: tutorName, imageUrl: tutorImageUrl } = tutor[0];
    
    const workingHours = {
      start: new Date(workingHourStart).setDate(new Date().getDate()),
      end: new Date(workingHourEnd).setDate(new Date().getDate())
    }

    workingHours.startHour = new Date(workingHours.start).getHours();
    workingHours.startMinute = new Date(workingHours.start).getMinutes();
    workingHours.endHour = new Date(workingHours.end).getHours();
    workingHours.endMinute = new Date(workingHours.end).getMinutes();
    
    if ((timeSlot.end - timeSlot.start) > 3600000) {
      throw { message: "You cannot book an appointment for more than an hour" };
    }

    if ((timeSlot.end - timeSlot.start) < 900000) {
      throw { message: "You need to book an appointment for minimum 15 minutes" };
    }
    
    if (timeSlot.start < new Date().getTime() || timeSlot.end < new Date().getTime) {
      throw { message: 'Cannot book an appointment for past time' };
    }

    if (reqStartHour >= workingHours.startHour && reqEndHour <= workingHours.endHour && (timeSlot.start < timeSlot.end)) {
      if (reqStartHour === workingHours.startHour && reqStartMinute < workingHours.startMinute) {
        throw { message: "Please select time within working Hours" };
      } else if (reqEndHour === workingHours.endHour && reqEndMinute > workingHours.endMinute) {
        throw { message: "Please select time within working Hours" };
      }
    } else {
      throw { message: "Please select time within working Hours" };
    }

    const tutorAppointmentData = await appointmentModel.find({ tutorId });
    
    const studentAppointmentData = await appointmentModel.find({ studentId, tutorId: { '$ne': tutorId } });

   const mergedAppointmentData = [...tutorAppointmentData, ...studentAppointmentData];

    mergedAppointmentData.map((pair) => {
      pair.timeSlot.map((appointment) => {
        if (appointment.status === 'ACTIVE') {
          const oldAppointment = {
            start: new Date(appointment.start).getTime(),
            end: new Date(appointment.end).getTime(), 
          }

          if (timeSlot.start === oldAppointment.start || (timeSlot.start > oldAppointment.start && timeSlot.start < oldAppointment.end)) {    // 10:40 - 17:40 
            throw { message: 'Please select some other slot'};
          } 

          if (timeSlot.end === oldAppointment.end || (timeSlot.end > oldAppointment.start && timeSlot.end < oldAppointment.end)) {        // 
            throw { message: 'Please select some other slot'};
          }
        }
      });
    })


    const data = await appointmentModel.find({ tutorId, studentId })

    if (data.length === 0) {
      const newData = new appointmentModel({ ...req.body, tutorId, studentId, studentImageUrl, tutorImageUrl, studentName, tutorName });
      try {
        const dataToSave = await newData.save();
        res.status(200).json(dataToSave);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
    else {
      appointmentModel.findOneAndUpdate(
        { tutorId, studentId },
        { $push: { timeSlot: timeSlot } },
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


appointmentRouter.get('/appointments', async (req, res) => {
  try {
    const { isTutor, _id } = verfiyTokenAndExtractInfo(req.cookies["byf-session-config"], "*");
    
    const identifier = {};

    if (isTutor) {
      identifier.tutorId = _id;
    } else {
      identifier.studentId = _id;
    }

    const appointments = await appointmentModel.find(identifier);
    return res.json({ appointments, serverTimestamp: new Date().getTime() });
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
});

//getall for a student
appointmentRouter.get("/appointments/student/:_id", async (req, res) => {
  try {
    const data = await appointmentModel.find({
      studentId: req.params._id
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//getall for a tutor
appointmentRouter.get("/appointments/tutor/:_id", async (req, res) => {
  try {
    const data = await appointmentModel.find({
      tutorId: req.params._id
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
