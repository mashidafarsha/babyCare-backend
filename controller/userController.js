const userModel = require("../models/userSchema");
const bannerModel = require("../models/bannerSchema");
const doctorModel = require("../models/doctorSchema");
const departmentModel = require("../models/departmentSchema");
const planModel = require("../models/planSchema");
const slotBookingModel = require("../models/slotBookingSchema");
const { sentOtp, verifyOtp } = require("../middleware/twilio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let env = require("dotenv").config();
const { RazorpayPayment } = require("../middleware/razorPay");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { log } = require("console");

let keyId = process.env.KEY_ID;
let keyScret = process.env.KEY_SECRET;

function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}

let userData;

const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          res.json({ status: false, message: "Unauthorized" });
        } else {
          const user = await userModel.findById({ _id: decoded.id });
          if (user) {
            res.json({ status: true, message: "Authorized", userData: user });
          } else {
            res.json({ status: false, message: "Admin not exists" });
          }
        }
      });
    } else {
      res.json({ status: false, message: "Token not provided" });
    }
  } catch {}
};

const doUserSignup = async (req, res, next) => {
  try {
    let email = req.body.email?.toLowerCase().trim();
    let { name, phone, password, cPassword } = req.body;
    let user = await userModel.findOne({ phone });
    if (user) {
      res.json({ success: false, message: "Already Registered" });
    } else {
      let newpassword = await bcrypt.hash(password, 10);
      let usersDetails = await userModel.create({
        name,
        email,
        phone,
        password: newpassword,
      });
      res.status(200).json({
        success: true,
        usersDetails,
        message: "Successfully created new user",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

const verifyUserOtp = async (req, res, next) => {
  try {
    let { otp } = req.body;
    let { name, email, phone, password, cPassword } = userData;

    let userDetails = await verifyOtp(otp, phone);
    if (userDetails.status === "approved") {
      let newpassword = await bcrypt.hash(password, 10);
      let usersDetails = await userModel.create({
        name,
        email,
        phone,
        password: newpassword,
      });
      res.status(200).json({
        success: true,
        usersDetails,
        message: "succesfully created new user",
      });
    } else {
      res.json({ success: false, message: "incorrect OTP" });
    }
  } catch (err) {
    console.log(err);
  }
};

const doUserLogin = async (req, res, next) => {
  try {
    let email = req.body.email?.toLowerCase().trim();
    let { password } = req.body;
    let user = await userModel.findOne({ email });
    if (user) {
      let isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const token = generateToken(user._id);
        res.status(200).json({ message: "Login Successfull", user, token, success: true });
      } else {
        const errors = { password: "Incorrect admin password" };
        res.json({ errors, success: false });
      }
    } else {
      const errors = { email: "Incorrect admin password" };
      res.json({ errors, success: false });
    }
  } catch {
    const errors = { email: "Incorrect admin email or password" };
    res.json({ errors, success: false });
  }
};

const getAllBanner = async (req, res, next) => {
  try {
    let BannerData = await bannerModel.find({ status: "ACTIVE" });
    res.status(200).json({ message: "successfully get Banner", success: true, BannerData });
  } catch {}
};

const getAllDoctor = async (req, res, next) => {
  try {
    let doctorData = await doctorModel.find({ status: "Active" });
    res.status(200).json({ message: "successfully get doctors", success: true, doctorData });
  } catch {}
};

const getAllDepartment = async (req, res, next) => {
  try {
    let departmentData = await departmentModel.find({ status: "ACTIVE" });
    res.status(200).json({
      message: "successfully get department",
      success: true,
      departmentData,
    });
  } catch {}
};

const getAllPlan = async (req, res, next) => {
  try {
    let plans = await planModel.find({ status: "ACTIVE" });
    res.status(200).json({ message: "successfully get plans", success: true, plans });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const categoryDoctors = async (req, res, next) => {
  try {
    let { departmentNames } = req.body;
    let doctors = await doctorModel.find({
      department: departmentNames,
      status: "Active",
    });
    res.status(200).json({
      message: "successfully get doctors",
      success: true,
      categoryDoctors: doctors,
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const getSelectedDoctorDetails = async (req, res, next) => {
  try {
    let doctorId = req.params.Id;
    let doctor = await doctorModel.findById({ _id: doctorId });
    res.status(200).json({
      message: "successfully get doctors",
      success: true,
      doctor,
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const razorPayPayment = async (req, res, next) => {
  try {
    let { amount } = req.body;
    let datas = await RazorpayPayment(amount);
    res.status(200).json({ message: "successfully get data", success: true, datas });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const razorVerifyPayment = async (req, res, next) => {
  try {
    let userId = req.userId;
    let { razorpay_order_id, razorpay_payment_id, razorpay_signature, id } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(sign.toString())
      .digest("hex");
    if (razorpay_signature === expectedSign) {
      const userData = await userModel.findById({ _id: userId });
      const expDate = userData.planExpDate;
      let plans = userData.plans;
      const planExpDate = new Date();
      planExpDate.setMonth(planExpDate.getMonth() + 3);

      if (plans.length === 0) {
        await userModel.findOneAndUpdate({ _id: userId }, { $push: { plans: id }, $set: { planExpDate } });
        await planModel.findByIdAndUpdate({ _id: id }, { $push: { user: userId } });
        return res.status(200).json({ message: "Payment verified successfully", success: true });
      } else if (plans.length === 1 && expDate <= new Date()) {
        const updatedPlans = [...plans.slice(1), id];
        await userModel.findOneAndUpdate({ _id: userId }, { $set: { plans: updatedPlans, planExpDate } });
        await planModel.findByIdAndUpdate({ _id: id }, { $push: { user: userId } });
        return res.status(200).json({ message: "Payment verified successfully", success: true });
      } else {
        return res.status(200).json({ message: "this user have already a plan", success: false });
      }
    } else {
      return res.status(400).json({ message: "invalid Signature", success: false });
    }
  } catch {}
};

const getUserPlanDetails = async (req, res, next) => {
  try {
    let userId = req.userId;
    let { consultationFee } = req.body;
    let user = await userModel.findById({ _id: userId });
    let plans = user.plans;

    if (plans.length > 0) {
      const planData = await planModel.findById({ _id: plans });
      let Amount = planData.offerAmount;
      let discountAmount = Amount / 100;
      let discount = consultationFee * discountAmount;
      let totalDiscount = consultationFee - discount;
      res.status(200).json({
        message: "successfully get data",
        success: true,
        discount: discount,
        totalDiscount: totalDiscount,
      });
    } else {
      res.json({
        message: "Plan id not found in user's plans array",
        success: false,
        consultationFee,
      });
    }
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const SlotBookingRazorpay = async (req, res, next) => {
  try {
    const { totalAmount } = req.body;
    if (!totalAmount) {
      return res.status(400).json({ success: false, message: "Amount is missing" });
    }
    const amountInPaise = Math.round(totalAmount * 100);
    const datas = await RazorpayPayment(amountInPaise); 
    res.status(200).json({ message: "Successfully created Razorpay order", success: true, datas });
  } catch (error) {
    console.error("Razorpay Server Error:", error);
    res.status(500).json({ message: "Razorpay Order Creation Failed", success: false });
  }
};

const razorVerifySlotPayment = async (req, res, next) => {
  try {
    let userId = req.userId;
    let {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      userSelectTime, totalAmount, doctorId, doctorName, doctorDep,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(sign.toString())
      .digest("hex");
    if (razorpay_signature === expectedSign) {
      let BookingData = await slotBookingModel.create({
        bookingTime: userSelectTime,
        totalAmount: totalAmount,
        DoctorId: doctorId,
        UserId: userId,
        DoctorName: doctorName,
        DoctorDepartment: doctorDep,
      });
      return res.status(200).json({ success: true, message: "Slot booked successfully", BookingData });
    } else {
      return res.status(400).json({ success: false, message: "invalid Signature" });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: "invalid Signature" });
  }
};

const getUserBookingData = async (req, res, next) => {
  try {
    let userId = req.userId;
    let bookingData = await slotBookingModel.find({ UserId: userId });
    res.status(200).json({ message: "successfully get data", success: true, bookingData });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const cancelUserBooking = async (req, res, next) => {
  try {
    let bookingId = req.params.Id;
    await slotBookingModel.findByIdAndUpdate({ _id: bookingId }, { $set: { status: "Cancel" } });
    res.status(200).json({ message: "successfully cancel the booking", success: true });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const getQueueStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await slotBookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status !== "Active") {
      return res.status(200).json({ 
        success: true, position: 0, status: booking.status,
        message: `Appointment is ${booking.status}` 
      });
    }

    const activeBookings = await slotBookingModel.find({
      DoctorId: booking.DoctorId,
      status: "Active"
    }).sort({ created: 1 });

    const position = activeBookings.findIndex(b => b._id.toString() === bookingId.toString()) + 1;
    res.status(200).json({ success: true, position, totalActive: activeBookings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    let userId = req.userId;
    let user = await userModel.findById({ _id: userId });
    
    // Count real visits from slot bookings
    const visitCount = await slotBookingModel.countDocuments({ UserId: userId, status: "Active" });
    
    res.status(200).json({ 
      message: "successfully get the user", 
      success: true, 
      user,
      visitCount 
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const updateHealthStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { bloodPressure, heartRate, bloodSugar, weight, height } = req.body;
    
    const updatedUser = await userModel.findByIdAndUpdate(
      { _id: userId },
      { 
        $set: { 
          "healthProfile.bloodPressure": bloodPressure,
          "healthProfile.heartRate": heartRate,
          "healthProfile.bloodSugar": bloodSugar,
          "healthProfile.weight": weight,
          "healthProfile.height": height
        } 
      },
      { new: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Health stats updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    res.json({ success: false, message: "Error updating health stats" });
  }
};

const editUserProfile = async (req, res, next) => {
  try {
    let userId = req.userId;
    const image = req.file.path.replace("public", "");
    let { name } = req.body;
    let editedData = await userModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { name, image } },
      { new: true }
    );
    res.status(200).json({ editedData, success: true, message: "Successfully updated data" });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const getAlreadyBookedSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.Id;
    let bookedSlots = await slotBookingModel.find({ DoctorId: doctorId, status: "Active" });
    const bookingTimes = bookedSlots.map((slot) => slot.bookingTime);
    res.status(200).json({ bookingTimes, success: true, message: "Successfully get booked Slots " });
  } catch {}
};

const checkUserAnyPlan = async (req, res, next) => {
  try {
    let userId = req.userId;
    let user = await userModel.findById({ _id: userId });
    if (user.plans.length > 0) {
      res.status(200).json({ success: true, message: "Successfully get Slots " });
    } else {
      res.json({ message: "Something went wrong", success: false });
    }
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

module.exports = {
  userAuth,
  doUserSignup,
  verifyUserOtp,
  doUserLogin,
  getAllBanner,
  getAllDoctor,
  getAllDepartment,
  getAllPlan,
  categoryDoctors,
  getSelectedDoctorDetails,
  razorPayPayment,
  razorVerifyPayment,
  getUserPlanDetails,
  SlotBookingRazorpay,
  razorVerifySlotPayment,
  getUserBookingData,
  cancelUserBooking,
  getUserProfile,
  editUserProfile,
  updateHealthStats,
  getAlreadyBookedSlots,
  checkUserAnyPlan,
  getQueueStatus
};
