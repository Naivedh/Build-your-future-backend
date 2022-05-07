require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const tutorRouter = require("./routes/tutorRouter");
const studentRouter = require("./routes/studentRouter");
const appointmentRouter = require("./routes/appointmentRouter");
const feedbackRouter = require("./routes/feedbackRouter");
const loginRouter = require("./routes/loginRouter");

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString, { 
  autoIndex: true,
});

mongoose.connection.on("error", (error) => {
  console.log(error);
});

mongoose.connection.once("connected", () => {
  console.log("Database Connected");
});

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser())
app.use("/authapi", loginRouter);
app.use("/tutorapi", tutorRouter);
app.use("/studentapi", studentRouter);
app.use("/appointmentapi", appointmentRouter);
app.use("/feedbackapi", feedbackRouter);

app.listen(8000, () => {
  console.log(`Server Started at ${8000}`);
});
