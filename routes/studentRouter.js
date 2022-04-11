const express = require("express");
const studentModel = require("../models/studentModel");

const studentRouter = express.Router();

const { generateHash, compareHash } = require("../utils/hash");

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
    });
    if (data.length) {
      const result = await compareHash(req.body.password, data[0].password);
      if (result) {
        const { _id, email } = data[0];
        const cookieData = { _id, email, isTutor: false };
        res.cookie("byf-session-config", generateToken(cookieData), {
          expiresIn: new Date(Date.now() + 18000000),
          maxAge: 18000000,
          httpOnly: true  
        });
        res.json("Success");
      }
    } else {
      throw "Password mismatch"
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = studentRouter;
