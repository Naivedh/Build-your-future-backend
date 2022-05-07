const express = require("express");
const studentModel = require("../models/studentModel");
const tutorModel = require("../models/tutorModel");

const studentRouter = express.Router();

const { generateHash, compareHash } = require("../utils/hash");
const { verfiyTokenAndExtractInfo, generateToken } = require("../utils/token");

//user get data
studentRouter.get("/student/:_id", async (req, res) => {
  try {
    const data = await studentModel.find({ _id: req.params._id });
    delete data["password"];
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// signup
studentRouter.post("/studentSignUp", async (req, res) => {
  const tutor = await tutorModel.find({ email: req.body.email });

  const student = await studentModel.find({ email: req.body.email });

  if (tutor.length !== 0 || student.length !== 0) {
    return res.status(500).json({ message: "Email already taken" });
  }

  const data = new studentModel({
    ...req.body,
    password: await generateHash(req.body.password),
  });

  try {
    await data.save();
    res.status(200).json({ message: "Student added" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//update student
studentRouter.put("/student", async (req, res) => {
  try {
    const studentId = verfiyTokenAndExtractInfo(
      req.cookies["byf-session-config"],
      "_id"
    );
    const student = { ...req.body, _id: studentId };
    
    if (student.password) {
      student.password = await req.body.password;
    }
    studentModel.findByIdAndUpdate(
      studentId,
      { $set: student },
      { new: true },
      function (err, data) {
        if (err) {
          res.status(500).json({ message: error.message });
        } else {
          res.json(data);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Enroll
//tutorId and coursId req.body
studentRouter.post("/studentCourse", async (req, res) => {
  try {
    const studentId = verfiyTokenAndExtractInfo(
      req.cookies["byf-session-config"],
      "_id"
    );
    studentModel.findByIdAndUpdate(
      studentId,
      { $push: { enrolledCourses: req.body } },
      { new: true, upsert: true },
      async function (err, data) {
        if (err) {
          console.log(err);
          res.status(500).json({ message: err.message });
        } else {
          res.json(data);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//make course favourite => requirement must be enrolled
//req.body only courseId
studentRouter.put("/studentFavourite", async (req, res) => {
  try {
    const studentId = verfiyTokenAndExtractInfo(
      req.cookies["byf-session-config"],
      "_id"
    );

    const currStudent = await studentModel.find({
      _id: studentId,
    });

    const course = currStudent[0].enrolledCourses.find((course) => course.courseId == req.body.courseId);

    course.isFavourite = !course.isFavourite;

    studentModel.findByIdAndUpdate(
      studentId,
      { $set: { "enrolledCourses.$[ele]": course } },
      { arrayFilters: [{ "ele.courseId": req.body.courseId }], upsert: true, new: true },
      function (err, data) {
        if (err) {
          res.status(500).json({ message: err.message });
        } else {
          res.json(data);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//getfovourite
studentRouter.get("/studentFavourite", async (req, res) => {
  try {
    const studentId = verfiyTokenAndExtractInfo(
      req.cookies["byf-session-config"],
      "_id"
    );

    const currStudent = await studentModel.find({
      _id: studentId,
    });
   
    const favouriteCourses = currStudent[0].enrolledCourses.filter((course) => course.isFavourite == true);
    res.json(favouriteCourses);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = studentRouter;
