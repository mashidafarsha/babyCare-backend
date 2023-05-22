const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    // required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    // required: true
  },
  department: {
    type: String,
    // required: true
  },
  consultationFee: {
    type: Number,
    // required: true
  },
  document: {
    type: String,
  },
  image: {
    type: String,
  },
  slots: {
    type: Array,
  },

  status: {
    type: String,
    // default: "Blocked",
  },
  rejectReason: {
    type: String,
    default: "",
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },

});

module.exports = mongoose.model("Doctor", DoctorSchema);
