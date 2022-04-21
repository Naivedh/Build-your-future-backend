const express = require("express");
const studentModel = require("../models/studentModel");
const tutorModel = require("../models/tutorModel");

const loginRouter = express.Router();

const { compareHash } = require("../utils/hash");
const { generateToken } = require("../utils/token");


loginRouter.post('/login', async (req, res) => {
    try {
        const studentData = await studentModel.find({
          email: req.body.email,
        });

        const tutorData = await tutorModel.find({
            email: req.body.email,
        });

        const isTutor = Boolean(tutorData.length);

        const data = tutorData.length ? tutorData : studentData;

        console.log({ studentData, tutorData });

        if (data.length) {
          const result = await compareHash(req.body.password, data[0].password);
          if (result) {
            const { _id, email } = data[0];
            const cookieData = { _id, email, isTutor };
            res.cookie("byf-session-config", generateToken(cookieData), {
              expiresIn: new Date(Date.now() + 18000000),
              maxAge: 18000000,
              httpOnly: true  
            });
            res.json({ message: "Success", isTutor });
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

module.exports = loginRouter;

