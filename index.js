require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const tutorRouter = require("./routes/tutorRouter");
const studentRouter = require("./routes/studentRouter");
const appointmentRouter = require("./routes/appointmentRouter");
const feedbackRouter = require("./routes/feedbackRouter");

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

app.use(express.json());
app.use(cookieParser())
app.use("/tutorapi", tutorRouter);
app.use("/studentapi", studentRouter);
app.use("/appointmentapi", appointmentRouter);
app.use("/feedbackapi", feedbackRouter);

app.listen(8000, () => {
  console.log(`Server Started at ${8000}`);
});
