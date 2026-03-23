const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("./models/adminSchema");
const Doctor = require("./models/doctorSchema");
const User = require("./models/userSchema");

async function normalizeEmails() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    // Normalize Admins
    const admins = await Admin.find({});
    for (const admin of admins) {
      const normalizedEmail = admin.email.toLowerCase().trim();
      if (admin.email !== normalizedEmail) {
        admin.email = normalizedEmail;
        await admin.save();
        console.log(`Normalized Admin email: ${normalizedEmail}`);
      }
    }

    // Normalize Doctors
    const doctors = await Doctor.find({});
    for (const doctor of doctors) {
      const normalizedEmail = doctor.email.toLowerCase().trim();
      if (doctor.email !== normalizedEmail) {
        doctor.email = normalizedEmail;
        await doctor.save();
        console.log(`Normalized Doctor email: ${normalizedEmail}`);
      }
    }

    // Normalize Users
    const users = await User.find({});
    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase().trim();
      if (user.email !== normalizedEmail) {
        user.email = normalizedEmail;
        await user.save();
        console.log(`Normalized User email: ${normalizedEmail}`);
      }
    }

    console.log("Email normalization complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error normalizing emails:", err);
    process.exit(1);
  }
}

normalizeEmails();
