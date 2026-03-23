const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("./models/adminSchema");

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    const admins = await Admin.find({});
    console.log(`Found ${admins.length} Admin records:`);
    admins.forEach(admin => {
        console.log(`- ID: ${admin._id}, Email: "${admin.email}"`);
    });

    if (admins.length === 0) {
        console.log("WARNING: No Admin records found! You need to create an admin first.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error checking admins:", err);
    process.exit(1);
  }
}

checkAdmins();
