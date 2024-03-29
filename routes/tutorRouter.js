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

  const { workingHourStart, workingHourEnd } = req.body;

  if (workingHourStart >= workingHourEnd) {
    throw { message: 'Please select proper working hours' }
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

    const feedbackId = uuidv4();
    const tutorId = uuidv4();  

    const data = new tutorModel({
                ...req.body,
                _id:tutorId,
                feedbackId:feedbackId,
                imageUrl: imageApiRes.secure_url,
                password: await generateHash(req.body.password),
              });
          await data.save();
          const feedback = new feedbackModel({_id: feedbackId, tutorId, responses: [] });
          await feedback.save();
          res.status(200).json({ message: "Tutor added" });
  } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
  }
});

//update Tutor profile
tutorRouter.put("/tutor", upload.single('image'), async (req, res) => {
  try {
    const tutorId = verfiyTokenAndExtractInfo(req.cookies["byf-session-config"], "_id");

    const currTutor = await tutorModel.find({
      _id: tutorId,
    });

    const tutor = { ...req.body, _id: tutorId }

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


    if (imageApiRes.secure_url) {
      tutor.imageUrl = imageApiRes.secure_url;
    }

    if (tutor.password) {
      tutor.password = await generateHash(req.body.password);
    }else{
      tutor.password = currTutor.password;
    }
    // if(tutor.workingHourStart === NAN){
    //   tutor.workingHourStart = currTutor.workingHourStart;
    // }
    // if(tutor.workingHourEnd===NAN){
    //   tutor.workingHourEnd =currTutor.workingHourEnd;
    // }

    tutorModel.findByIdAndUpdate(
      tutorId,
      { $set: tutor },
      { new: true },
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

//get course by id
// how to get data
//unique name no work
//give msg without image
tutorRouter.get("/course/:courseId", async (req, res) => {
  try {
    const tutorData = await tutorModel.find({ _id: req.query.tutorId });
    data = tutorData[0].courses.find((course)=>course._id == req.params.courseId)

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add course 
tutorRouter.post("/tutorCourse", upload.single('image'), async (req, res) => {  
  try {
  const { _id: tutorId, isTutor } = verfiyTokenAndExtractInfo(req.cookies['byf-session-config'], "*"); 
  checkUser(isTutor, true);
  const currTutor = await tutorModel.find({
    _id: tutorId,
  }); 
  const hasCourse = currTutor[0].courses.filter((course) => {
    return course.name === req.body.name;
  });

  if (hasCourse.length !== 0) {
    res.status(500).json({ message: "Course already present" });
  } else {
    
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

      const newCourse = { ...req.body, imageUrl: imageApiRes.secure_url};
      tutorModel.findByIdAndUpdate( 
        { _id: tutorId },
        { $push: { courses: newCourse } },
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
  }
} catch (error) {
  res.status(500).json({ message: error.message });
}
});


//update course
// send full data of a particular course to update the fields from the client side
tutorRouter.put("/tutorCourse", upload.single('image'), async (req, res) => {
  try {
    const tutorId = verfiyTokenAndExtractInfo(req.cookies['byf-session-config']);
    
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
    const newCourse = { ...req.body };

    if (imageApiRes.secure_url) {
      newCourse.imageUrl = imageApiRes.secure_url;
    }

   
    tutorModel.findByIdAndUpdate(
      tutorId,
      { $set: { "courses.$[ele]": newCourse } },
      { arrayFilters: [{ "ele._id": req.body._id }], upsert: true, new: true },
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

//delete
// you need to delete multiple places
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
