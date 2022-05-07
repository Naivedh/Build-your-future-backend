const { response } = require("express");
const express = require("express");
const studentModel = require("../models/studentModel");
const tutorModel = require("../models/tutorModel");

const loginRouter = express.Router();

const { compareHash } = require("../utils/hash");
const { generateToken } = require("../utils/token");

//TODO: ADIT Remove student tutor signin if not required
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

        if (data.length) {
          const result = await compareHash(req.body.password, data[0].password);
          if (result) {
            const { _id, email } = data[0];
            const cookieData = { _id, email, isTutor };
            res.cookie("byf-session-config", generateToken(cookieData), {
              expiresIn: new Date(Date.now() + 18000000),
              maxAge: 18000000,
              // httpOnly: true  
            });
            const responseData = { message: "Success", isTutor };
            if (isTutor) {
                const tutorData = data[0];
                delete tutorData['password'];
                // console.log({ tutorData });
                responseData.tutor = tutorData;
            }
            res.json(responseData);
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

