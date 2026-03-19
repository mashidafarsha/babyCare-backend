const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    DoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    UserName: {
      type: String,
      required: true,
    },
    type: {
        type: String,
        default: "SOS",
    },
    status: {
        type: String,
        enum: ["Triggered", "Acknowledged"],
        default: "Triggered"
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("emergency", emergencySchema);
