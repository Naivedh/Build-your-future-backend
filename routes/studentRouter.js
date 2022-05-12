const express = require("express");
const studentModel = require("../models/studentModel");
const tutorModel = require("../models/tutorModel");

const studentRouter = express.Router();

const { generateHash, compareHash } = require("../utils/hash");
const { verfiyTokenAndExtractInfo, generateToken } = require("../utils/token");

const cloudinary = require("cloudinary").v2;

const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const multer  = require('multer')
const upload = multer();

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
studentRouter.post("/studentSignUp", upload.single('image'), async (req, res) => {
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

  const data = new studentModel({
    ...req.body,
    imageUrl: imageApiRes.secure_url,
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
studentRouter.put("/student", upload.single('image'), async (req, res) => {
  try {
    const studentId = verfiyTokenAndExtractInfo(
      req.cookies["byf-session-config"],
      "_id"
    );
    const currStudent = await studentModel.find({
      _id: studentId,
    });

    let imageApiRes = {};
    if (req.file) {
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
      imageApiRes = await streamUpload(req);
    }

    const student = { ...req.body, _id: studentId };
    if (imageApiRes.secure_url) {
      student.imageUrl = imageApiRes.secure_url;
    }

    if (student.password) {
      student.password = await generateHash(req.body.password);
    }else{
      student.password = currStudent.password;
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
//tutorId and coursId coursename course imageurl
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

//Enroll
//checkEnroll
studentRouter.get("/studentCourse/:_id", async (req, res) => {
  try {
    const studentId = verfiyTokenAndExtractInfo(
      req.cookies["byf-session-config"],
      "_id"
    );
    const student = await studentModel.findById(studentId);
    const isEnroll = student.enrolledCourses.find((course)=>course.courseId===req.params._id)
    res.send(isEnroll?true:false);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//make course favourite => requirement must be enrolled
//req.body only courseId
studentRouter.post("/studentFavourite", async (req, res) => {
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
          const newData = data.enrolledCourses.filter((course)=>course.isFavourite===true)
          res.json(newData);
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
