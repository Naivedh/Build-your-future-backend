const express = require("express");
const tutorModel = require("../models/tutorModel");

const tutorRouter = express.Router();

const { generateHash, compareHash } = require("../utils/hash");

const { verfiyTokenAndExtractInfo, generateToken } = require("../utils/token");

//all Tutors
tutorRouter.get("/tutors", async (req, res) => {
  try {
    const data = await tutorModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//one Tutor
tutorRouter.get("/tutor/:_id", async (req, res) => {
  try {
    const token = req.cookies["byf-session-config"];
    verfiyTokenAndExtractInfo(token)
    const data = await tutorModel.find({ _id: req.params._id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//signUp (add Tutor)
tutorRouter.post("/postTutorSignUp", async (req, res) => {
  //unique user needed
  const user = await tutorModel.find({ email: req.body.email });

  if (user.length !== 0) {
    return res.status(500).json({ message: "Email already taken" });
  }

  const data = new tutorModel({
    ...req.body,
    password: await generateHash(req.body.password),
  });

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// signin
tutorRouter.post("/postTutorSignIn", async (req, res) => {
  try {
    const data = await tutorModel.find({
      email: req.body.email,
    });

    if (data.length) {
      const result = await compareHash(req.body.password, data[0].password);
      if (result) {
        const { _id, email } = data[0];
        const cookieData = { _id, email, isTutor: true };
        res.cookie("byf-session-config", generateToken(cookieData), {
          expiresIn: new Date(Date.now() + 18000000),
          maxAge: 18000000 
        });
        res.json("Success");
      }
    } else {
      throw "Password mismatch"
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});

//update Tutor profile
tutorRouter.put("/updateTutor", async (req, res) => {
  try {
    const tutorId = verfiyTokenAndExtractInfo(req.cookies["byf-session-config"], "_id");
    tutorModel.findByIdAndUpdate(
      tutorId,
      { $set: req.body },
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

//tutor add course (work on multi push same data can bee pushed again)
tutorRouter.put("/updateTutor/addCourse/:_id", async (req, res) => {

  const _id = verfiyTokenAndExtractInfo(req.cookies['byf-session-config'])
  const currTutor = await tutorModel.find({
    _id,
  });

  //return array[]
  const hasCourse = currTutor[0].courses.filter((course) => {
    console.log(course.title === req.body.title)
    return course.title === req.body.title;
  });

  if (hasCourse.length !== 0) {
    res.status(500).json({ message: "Course already present" });
  } else {
    try {
      tutorModel.findByIdAndUpdate(
        { _id: req.params._id },
        { $push: { courses: req.body } },
        { new: true, upsert: true },
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
  }
});

//update course //issue what if we update course name with something else that is already present
tutorRouter.put("/updateTutor/updateCourse/:_id", (req, res) => {
  try {
    tutorModel.findByIdAndUpdate(
      req.params._id,
      { $set: { "myArray.$[ele]": req.body } },
      { arrayFilters: [{ "ele._id": req.body._id }], new: true },
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

//delete
tutorRouter.delete("/deleteTutor/:_id", (req, res) => {
  tutorModel.findOneAndDelete({ _id: req.params._id }, function (err, data) {
    if (err) {
      res.status(500).json({ message: err });
    }
    else if(data){
      res.json("Tutor Deleted");
    }
    else{
      res.json("User Not Found");
    }
  })
});

module.exports = tutorRouter;
