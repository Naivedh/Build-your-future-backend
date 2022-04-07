const express = require("express");
const tutorModel = require("../models/tutorModel");

const tutorRouter = express.Router();

tutorRouter.get("/tutors", async (req, res) => {
  try {
    const data = await tutorModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

tutorRouter.get("/tutor/:_id", async (req, res) => {
  try {
    const data = await tutorModel.find({ _id: req.params._id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//signUp
tutorRouter.post("/postTutorSignUp", async (req, res) => {
  const data = new tutorModel({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    about: req.body.about,
    desc: req.body.desc,
    imageUrl: req.body.imageUrl,
    workingHourStart: req.body.workingHourStart,
    workingHourEnd: req.body.workingHourEnd,
    courses: req.body.courses,
    stars: req.body.stars,
    hoursTutored: req.body.hoursTutored,
  });

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// signin
tutorRouter.post("/postTutorSignIn", async (req, res) => {
  try {
    const data = await tutorModel.find({
      email: req.body.email,
      password: req.body.password,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update profile
tutorRouter.put("/updateTutor/:_id", async (req, res) => {
  try {
    tutorModel.findByIdAndUpdate(
      req.params._id,
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
  const currTutor = await tutorModel.find({
    _id: req.params._id,
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
      { $set: {"myArray.$[ele]": req.body} },
      {arrayFilters: [{ "ele._id": req.body._id }], new: true },
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
})

module.exports = tutorRouter;
