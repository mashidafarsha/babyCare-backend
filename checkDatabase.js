const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("./models/adminSchema");
const Doctor = require("./models/doctorSchema");
const User = require("./models/userSchema");
const Category = require("./models/departmentSchema");
const Banner = require("./models/bannerSchema");
const Plan = require("./models/planSchema");

async function checkDatabase() {
  try {
    console.log("Connecting with MONGODB_URL from .env...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully!");

    const stats = {
      Admins: await Admin.countDocuments(),
      Doctors: await Doctor.countDocuments(),
      Users: await User.countDocuments(),
      Categories: await Category.countDocuments(),
      Banners: await Banner.countDocuments(),
      Plans: await Plan.countDocuments(),
    };

    console.table(stats);

    if (stats.Admins > 0) {
      const admin = await Admin.findOne();
      console.log(`Sample Admin Email: "${admin.email}"`);
    }

    if (stats.Banners > 0) {
        const banners = await Banner.find({ status: "ACTIVE" });
        console.log(`Banners with status 'ACTIVE': ${banners.length}`);
    } else {
        console.log("WARNING: Banners collection is EMPTY!");
    }

    if (stats.Categories > 0) {
        const categories = await Category.find({ status: "ACTIVE" });
        console.log(`Categories with status 'ACTIVE': ${categories.length}`);
    } else {
        console.log("WARNING: Categories collection is EMPTY!");
    }

    process.exit(0);
  } catch (err) {
    console.error("Connection Error:", err.message);
    process.exit(1);
  }
}

checkDatabase();
