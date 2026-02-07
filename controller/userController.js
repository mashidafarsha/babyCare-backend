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
    console.log(authHeader, "llll");
    if (authHeader) {
      console.log("hello");
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
    let { name, email, phone, password, cPassword } = req.body;
    userData = {
      name,
      email,
      phone,
      password,
      cPassword,
    };
    console.log(userData);
    let user = await userModel.findOne({ phone });
    console.log(user);
    if (user) {
      console.log("kkkk");
      res.json({ status: false, message: "Already Registerd" });
    } else {
      let data = await sentOtp(phone);
      console.log(data);
      res.json({ status: true, data, message: "succesfully sending Otp" });
    }
  } catch (err) {
    console.log(err);
  }
};

const verifyUserOtp = async (req, res, next) => {
  try {
    console.log("hhhh");
    let { otp } = req.body;
    console.log(otp);
    console.log(userData);
    let { name, email, phone, password, cPassword } = userData;

    let userDetails = await verifyOtp(otp, phone);
    console.log(userDetails, "yyy");
    if (userDetails.status === "approved") {
      let newpassword = await bcrypt.hash(password, 10);
      let newCpassword = await bcrypt.hash(cPassword, 10);
      let usersDetails = await userModel.create({
        name,
        email,
        phone,
        password: newpassword,
        // cPassword: newCpassword,
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
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    console.log(user);
    if (user) {
      let isValid = await bcrypt.compare(password, user.password);
      console.log(isValid);
      if (isValid) {
        const token = generateToken(user._id);

        res
          .status(200)
          .json({ message: "Login Successfull", user, token, success: true });
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

    res
      .status(200)
      .json({ message: "successfully get Banner", success: true, BannerData });
  } catch {}
};
const getAllDoctor = async (req, res, next) => {
  try {
    let doctorData = await doctorModel.find({ status: "Active" });

    res
      .status(200)
      .json({ message: "successfully get doctors", success: true, doctorData });
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

    res
      .status(200)
      .json({ message: "successfully get plans", success: true, plans });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const categoryDoctors = async (req, res, next) => {
  try {
    let { departmentNames } = req.body;
    console.log(departmentNames, "hhhhhhhh");
    let categoryDoctors = await doctorModel.find({
      department: departmentNames,
      status: "Active",
    });
    res.status(200).json({
      message: "successfully get doctors",
      success: true,
      categoryDoctors,
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const getSelectedDoctorDetails = async (req, res, next) => {
  try {
    let doctorId = req.params.Id;
    let doctor = await doctorModel.findById({ _id: doctorId });
    console.log(doctor, "jjjjj");
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
    res
      .status(200)
      .json({ message: "successfully get data", success: true, datas });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};
const razorVerifyPayment = async (req, res, next) => {
  try {
    let userId = req.userId;
    console.log(userId, "userId");
    let { razorpay_order_id, razorpay_payment_id, razorpay_signature, id } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(sign.toString())
      .digest("hex");
    console.log(expectedSign);
    console.log(razorpay_signature);
    if (razorpay_signature === expectedSign) {
      const userData = await userModel.findById({ _id: userId });
      const expDate = userData.planExpDate;

      plans = userData.plans;

      const planExpDate = new Date();
      planExpDate.setMonth(planExpDate.getMonth() + 3);

      if (plans.length === 0) {
        const userDatas = await userModel.findOneAndUpdate(
          { _id: userId },
          { $push: { plans: id }, $set: { planExpDate } }
        );
        const planDatas = await planModel.findByIdAndUpdate(
          { _id: id },
          { $push: { user: userId } }
        );
        return res
          .status(200)
          .json({ message: "Payment verified successfully", success: true });
      } else if (plans.length === 1 && expDate <= new Date()) {
        const updatedPlans = [...plans.slice(1), id];
        const userDatas = await userModel.findOneAndUpdate(
          { _id: userId },
          { $set: { plans: updatedPlans, planExpDate } }
        );
        const planDatas = await planModel.findByIdAndUpdate(
          { _id: id },
          { $push: { user: userId } }
        );
        return res
        .status(200)
        .json({ message: "Payment verified successfully", success: true });
      } else {
        return res
          .status(200)
          .json({ message: "this user have already a plan", success: false });
      }
    } else {
      return res
        .status(400)
        .json({ message: "invalid Signature", success: false });
    }
  } catch {}
};

const getUserPlanDetails = async (req, res, next) => {
  try {
    let userId = req.userId;
    let { consultationFee } = req.body;

    let user = await userModel.findById({ _id: userId });

    plans = user.plans;

    if (plans.length > 0) {
      const planData = await planModel.findById({ _id: plans });
      console.log(planData);
      let Amount = planData.offerAmount;

      let discountAmount = Amount / 100;

      let discount = consultationFee * discountAmount;

      let totalDiscount = consultationFee - consultationFee * discountAmount;

      console.log(totalDiscount, "dicount ttttttt");

      res.status(200).json({
        message: "successfully get data",
        success: true,
        discount: discount,
        totalDiscount: totalDiscount,
      });
    } else {
      console.log(consultationFee, "cnsillllllllll");
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

// Backend Controller
const SlotBookingRazorpay = async (req, res, next) => {
  console.log("Backend hit! Data received:", req.body); 
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ success: false, message: "Amount is missing" });
    }

    // Amount paise-lekku maattuka (100 * totalAmount)
    const amountInPaise = Math.round(totalAmount * 100);

    // RazorpayPayment function-il ee amount pass cheyyuka
    const datas = await RazorpayPayment(amountInPaise); 
    
    console.log("Razorpay Order Created:", datas);

    res.status(200).json({ 
      message: "Successfully created Razorpay order", 
      success: true, 
      datas 
    });
  } catch (error) {
    console.error("Razorpay Server Error:", error);
    res.status(500).json({ message: "Razorpay Order Creation Failed", success: false });
  }
};

const razorVerifySlotPayment = async (req, res, next) => {
  try {
    let userId = req.userId;
    let {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userSelectTime,
      totalAmount,
      doctorId,
      doctorName,
      doctorDep,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(sign.toString())
      .digest("hex");
    console.log(expectedSign);
    console.log(razorpay_signature);
    if (razorpay_signature === expectedSign) {
      console.log("hello");
      let BookingData = await slotBookingModel.create({
        bookingTime: userSelectTime,
        totalAmount: totalAmount,
        DoctorId: doctorId,
        UserId: userId,
        DoctorName: doctorName,
        DoctorDepartment: doctorDep,
      });

      return res.status(200).json({
        success: true,
        message: "Slot booked successfully",
        BookingData,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "invalid Signature" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "invalid Signature" });
  }
};

const getUserBookingData = async (req, res, next) => {
  try {
    let userId = req.userId;

    let bookingData = await slotBookingModel.find({ UserId: userId });

    res
      .status(200)
      .json({ message: "successfully get data", success: true, bookingData });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};
const cancelUserBooking = async (req, res, next) => {
  try {
    let bookingId = req.params.Id;
    let cancelData = await slotBookingModel.findByIdAndUpdate(
      { _id: bookingId },
      { $set: { status: "Cancel" } }
    );
    res
      .status(200)
      .json({ message: "successfully cancel the booking", success: true });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};
const getUserProfile = async (req, res, next) => {
  try {
    let userId = req.userId;
    let user = await userModel.findById({ _id: userId });
    console.log(user);
    res
      .status(200)
      .json({ message: "successfully get the user", success: true, user });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};
const editUserProfile = async (req, res, next) => {
  console.log("jjjj");
  try {
    let userId = req.userId;
    const image = req.file.path.replace("public", "");
    console.log(image);
    let { name } = req.body;
    console.log(name);
    let editedData = await userModel.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          name,

          image,
        },
      },
      { new: true }
    );
    res.status(200).json({
      editedData,
      success: true,
      message: "Successfully updated data",
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};
const getAlreadyBookedSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.Id;

    let bookedSlots = await slotBookingModel.find({
      DoctorId: doctorId,
      status: "Active",
    });
    const bookingTimes = bookedSlots.map((slot) => slot.bookingTime);

    res.status(200).json({
      bookingTimes,
      success: true,
      message: "Successfully get booked Slots ",
    });
  } catch {}
};
const checkUserAnyPlan = async (req, res, next) => {
  try {
    let userId = req.userId;
    let user = await userModel.findById({ _id: userId });
    console.log(user, "nnnnnn");
    let planExists = user.plans;
    console.log(planExists, "ooooooooo");
    if (planExists.length > 0) {
      res.status(200).json({
        success: true,
        message: "Successfully get  Slots ",
      });
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
  getAlreadyBookedSlots,
  checkUserAnyPlan,
};
