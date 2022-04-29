const express = require("express");
// const axios = require('axios');

const cloudinary = require("cloudinary").v2;

const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const tutorModel = require("../models/tutorModel");
const { v4: uuidv4 } = require('uuid');

const multer  = require('multer')

// const storage = multer.diskStorage({
//   destination: "images/",
//   filename: (req, file, cb) => {
//     // console.log(req.files);
//     cb(null, file.originalname);
//   },
// });

const upload = multer();

const tutorRouter = express.Router();

const { generateHash, compareHash } = require("../utils/hash");

const { verfiyTokenAndExtractInfo, generateToken } = require("../utils/token");
const feedbackModel = require("../models/feedbackModel");
const { checkUser } = require("../utils/checkUser");
const studentModel = require("../models/studentModel");

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
tutorRouter.post("/tutorSignUp", upload.single('image'), async (req, res) => {
  try {
  const tutor = await tutorModel.find({ email: req.body.email });

  const student = await studentModel.find({ email: req.body.email });

  if (tutor.length !== 0 || student.length !== 0) {
    return res.status(500).json({ message: "Email already taken" });
  }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const imageApiRes = await streamUpload(req);

    const data = new tutorModel({
                ...req.body,
                imageUrl: imageApiRes.secure_url,
                password: await generateHash(req.body.password),
              });
          await data.save();
          res.status(200).json({ message: "Tutor added" });
  } catch (err) {
        res.status(500).json({ message: err.message });
  }
});

// signin
tutorRouter.post("/tutorSignIn", async (req, res) => {
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
          maxAge: 18000000,
          httpOnly: true 
        });
        res.json({ message: "Success" });
      } else {
        throw { message: "Password mismatch" }
      }
    } else {
      throw { message: "User not found" }
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});

//update Tutor profile
tutorRouter.put("/tutor", async (req, res) => {
  try {
    const tutorId = verfiyTokenAndExtractInfo(req.cookies["byf-session-config"], "_id");
    const tutor = { ...req.body, _id: tutorId }
    if (tutor.password) {
      tutor.password = await req.body.password;
    }
    tutorModel.findByIdAndUpdate(
      tutorId,
      { $set: tutor },
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


// add course image upload 
//made put => post check working
tutorRouter.post("/tutorCourse", async (req, res) => {  
  try {
  const { _id: tutorId, isTutor } = verfiyTokenAndExtractInfo(req.cookies['byf-session-config'], "*"); 
  checkUser(isTutor, true);
  const currTutor = await tutorModel.find({
    _id: tutorId,
  });

  const feedbackId = uuidv4();
  const courseId = uuidv4();  
  const hasCourse = currTutor[0].courses.filter((course) => {
    return course.name === req.body.name;
  });

  if (hasCourse.length !== 0) {
    res.status(500).json({ message: "Course already present" });
  } else {
      const newCourse = { ...req.body, feedbackId, _id: courseId };
      tutorModel.findByIdAndUpdate( 
        { _id: tutorId },
        { $push: { courses: newCourse } },
        { new: true, upsert: true },
        async function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).json({ message: err.message });
          } else {
            const feedback = new feedbackModel({ courseId, _id: feedbackId, tutorId, responses: [] });
            await feedback.save();
            res.json(data);
          }
        }
      );
  }
} catch (error) {
  res.status(500).json({ message: error.message });
}
});


//update course
// send full data of a particular course to update the fields from the client side

tutorRouter.put("/tutorCourse", async (req, res) => {
  try {
    const tutorId = verfiyTokenAndExtractInfo(req.cookies['byf-session-config']);
    const currTutor = await tutorModel.find({
      _id: tutorId,
    });
    const hasCourse = currTutor[0].courses.filter((course) => {
      return course.name === req.body.name && course._id !== req.body._id;
    });
    
    if (hasCourse.length !== 0) {
      res.status(500).json({ message: "Course already present" });
    } else {
    tutorModel.findByIdAndUpdate(
      tutorId,
      { $set: { "courses.$[ele]": req.body } },
      { arrayFilters: [{ "ele._id": req.body._id }], upsert: true, new: true },
      function (err, data) {
        if (err) {
          res.status(500).json({ message: err.message });
        } else {
          res.json(data);
        }
      }
    );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete
tutorRouter.delete("/tutor/:_id", (req, res) => {
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
