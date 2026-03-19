const reviewModel = require("../models/reviewSchema");
const slotBookingModel = require("../models/slotBookingSchema");

const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { doctorId, rating, comment, userName, bookingId } = req.body;

    // Optional: Check if the booking exists and is completed
    const booking = await slotBookingModel.findById(bookingId);
    if (!booking || booking.status !== "Completed") {
      return res.status(400).json({ success: false, message: "Only completed consultations can be reviewed." });
    }

    const review = await reviewModel.create({
      DoctorId: doctorId,
      UserId: userId,
      UserName: userName,
      rating,
      comment,
    });

    res.status(200).json({ success: true, message: "Review submitted successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};

const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await reviewModel.find({ DoctorId: doctorId }).sort({ created: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

module.exports = {
  addReview,
  getDoctorReviews,
};
