const express = require("express");
const studentModel = require("../models/studentModel");

const studentRouter = express.Router();

const generateHash = require("../utils/hashGen");

//for update user get data
studentRouter.get("/student/:_id", async (req, res) => {
  try {
    const data = await studentModel.find({ _id: req.params._id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// signup
studentRouter.post("/postStudentSignUp", async (req, res) => {

  const user = await studentModel.find({ email: req.body.email });
    
  if (user.length !== 0) {
    return res.status(500).json({ message: "Email already taken" });
  }

  const data = new studentModel({
    email: req.body.email,
    password: await generateHash(req.body.password),
    name: req.body.name,
    imageUrl: req.body.imageUrl,
    enrolledCourses: req.body.enrolledCourses,
    hoursStudied: req.body.hoursStudied,
  });

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// signin
studentRouter.post("/postStudentSignIn", async (req, res) => {
  try {
    const data = await studentModel.find({
      email: req.body.email,
      password: req.body.password,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = studentRouter;
