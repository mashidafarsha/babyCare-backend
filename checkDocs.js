const mongoose = require("mongoose");
require("dotenv").config();
const Doctor = require("./models/doctorSchema");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const docs = await Doctor.find({});
  console.log("Doctors in DB:", docs);
  process.exit(0);
}).catch((err) => console.log(err));
