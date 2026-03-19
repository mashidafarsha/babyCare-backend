const emergencyModel = require("../models/emergencySchema");

const triggerSOS = async (req, res) => {
  try {
    const userId = req.userId;
    const { doctorId, userName, bookingId } = req.body;

    const sosLog = await emergencyModel.create({
      DoctorId: doctorId,
      UserId: userId,
      UserName: userName,
      type: "SOS",
      status: "Triggered"
    });

    res.status(200).json({ success: true, message: "SOS log created", sosLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to log SOS" });
  }
};

module.exports = {
  triggerSOS,
};
