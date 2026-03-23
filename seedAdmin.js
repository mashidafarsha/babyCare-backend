const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const Admin = require("./models/adminSchema");

async function createInitialAdmin() {
  const email = "admin@truecare.com"; // Change this if needed
  const password = "adminpassword123"; // Change this if needed
  const name = "Super Admin";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists!`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    console.log("Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createInitialAdmin();
