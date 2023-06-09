const doctorModel = require("../models/doctorSchema");
const departmentModel = require("../models/departmentSchema");
const slotBookingModel=require("../models/slotBookingSchema")
const userModel=require('../models/userSchema')
const planModel=require('../models/planSchema')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmailOTP,sendCancellationEmail } = require("../middleware/nodemailer");
const nodemailer = require("nodemailer");

function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}

const handleError = (err) => {
  let errors = { email: "", password: "" };

  if (err.code === 11000) {
    errors.email = "Email is already exists";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach((properties) => {
      errors[properties.path] = properties.message;
    });
    return errors;
  }
};

let signupData;
let emailOtp = null;

const doctorAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      let token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          res.json({ status: false, message: "Unauthorized" });
        } else {
          const doctor = await doctorModel.findById({ _id: decoded.id });

          if (doctor) {
            res.json({
              status: true,
              message: "Authorized",
              doctorData: doctor,
            });
          } else {
            res.json({ status: false, message: "Admin not exists" });
          }
        }
      });
    }
  } catch {}
};

const doctorGetOtp = async (req, res, next) => {
  try {
    let { name, email, password, confirmPassword } = req.body;

    const doctor = await doctorModel.findOne({ email });
    console.log(doctor, "doctor");
    if (!doctor) {
      signupData = {
        name,
        email,
        password,
        confirmPassword,
      };
      const otpEmail = Math.floor(1000 + Math.random() * 9000);
      console.log(otpEmail, "8");
      emailOtp = otpEmail;

      sendEmailOTP(email, otpEmail)
        .then((info) => {
          console.log(`Message sent: ${info.messageId}`);
          console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        })
        .catch((error) => {
          throw error;
        });
      res.status(200).json({
        message: "OTP is send to given email and phone number",
        otpSend: true,
      });
    } else {
      res.status(200).json({
        message: "There is already a doctor with same email",
        otpSend: false,
      });
    }
  } catch (error) {
    console.log(error);
    const errors = handleError(error);
    res.status(400).json({ errors, otpSend: false });
  }
};

const submitOtp = async (req, res, next) => {
  try {
    let { otp } = req.body;
    let { name, email, password, confirmPassword } = signupData;
    if (otp == emailOtp) {
      let newpassword = await bcrypt.hash(password, 10);

      let doctor = await doctorModel.create({
        name,
        email,
        password: newpassword,
        confirmPassword,
      });

      res
        .status(200)
        .json({ message: "Successfully registered", doctor, created: true });
    } else {
      res.status(200).json({
        message: "Entered OTP from email is incorrect",
        created: false,
      });
    }
  } catch (error) {
    console.log(error, "kkk");
    let errors = handleError(error);
    res.status(400).json({ errors, created: false });
  }
};

const doctorLogin = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    let doctor = await doctorModel.findOne({ email });
    console.log(doctor, "pp");
    if (doctor) {
      let validPass = await bcrypt.compare(password, doctor.password);
      if (validPass) {
        const token = generateToken(doctor._id);
        console.log(token);

        res
          .status(200)
          .json({ message: "Login Successfull", doctor, token, success: true });
      } else {
        const errors = { email: "Incorrect admin password" };
        res.json({ errors, success: false });
      }
    } else {
      const errors = { password: "email does not exist" };
      res.json({ errors, success: false });
    }
  } catch (error) {
    console.log(error);
    const errors = { email: "Incorrect admin email or password" };
    res.json({ errors, success: false });
  }
};

const doctorInfo = async (req, res, next) => {
  try {
    const formData = req.file.path.replace("public", "");
    
    console.log(formData);
    let {
      name,
      email,
      phone,
      qualification,
      department,
      experience,
      consultationFee,
    } = req.body;
    let doctor = await doctorModel.findOne({ email });
    const newData = Object.assign({}, doctor.toObject(), {
      phone,
      status: "Blocked",
      qualification,
      department,
      experience,
      consultationFee,
      rejectReason:"",
      document: formData,
    });
    const updatedDoctor = await doctorModel.findOneAndUpdate(
      { email },
      newData,
      { new: true }
    );
    if (updatedDoctor) {
      const token = generateToken(doctor._id);
      console.log(token);
      res.status(200).json({
        token,
        updatedDoctor,
        success: true,
        message: "After approvel Please Login",
      });
    } else {
      res.json({ errors, success: false });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: "its not Updated", success: false });
  }
};

const getDepartment = async (req, res, next) => {
  try {
    let departmentData = await departmentModel.find({ status: "ACTIVE" });
    console.log(departmentData, "lllll");
    res
      .status(200)
      .json({
        message: "successfully get department",
        success: true,
        departmentData,
      });
  } catch {}
};

const getRejReason = async (req, res, next) => {
  try {
    let Id = req.doctorId;
    console.log(Id, "oooo");
    let reasonData = await doctorModel.findOne({ _id: Id });
    console.log(reasonData, "pp");
    res
      .status(200)
      .json({ reasonData, success: true, message: "Successfully taken data" });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const editDoctorProfile = async (req, res, next) => {
  try {
    console.log(req.body);
    let Id = req.doctorId;
    const image = req.file.path.replace("public", "");
    console.log(image);
    let { name, email, phone, qualification, department } = req.body;
    console.log(Id, "jjjjj");
    let editedData = await doctorModel.findByIdAndUpdate(
      { _id: Id },
      {
        $set: {
          name,
          email,
          phone,
          qualification,
          department,
          image,
        },
      },
      { new: true }
    );
    console.log(editedData, "editedData");
    res.status(200).json({
      editedData,
      success: true,
      message: "Successfully updated data",
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const docorSelSlots = async (req, res, next) => {
  try {
    const _id = req.doctorId;
    let { selectedTime } = req.body;
    let editedData = await doctorModel.findByIdAndUpdate(
      { _id },
      {
        $addToSet: { slots: { $each: [...selectedTime] } },
      },
      { new: true }
    );
    res.status(200).json({
      editedData,
      success: true,
      message: "Successfully Added Your Slots ",
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const scheduledDoctorSlot = async (req, res, next) => {
  try {
    console.log("uuuuuuu");
    const _id = req.doctorId;
    let doctorSlots = await doctorModel.findById({ _id });
    let slots = doctorSlots.slots;
    res.status(200).json({
      slots,
      success: true,
      message: "Successfully get Your Slots ",
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};
const getDoctorNavData = async (req, res, next) => {
  try {
    const _id = req.doctorId;
    let doctorProfile = await doctorModel.findById({ _id });
    res.status(200).json({
      doctorProfile,
      success: true,
      message: "Successfully get Your profile ",
    });
  } catch {
    res.json({ message: "Something went wrong", success: false });
  }
};

const displayScheduledSlot=async(req,res,next)=>{
  try{
    const _id = req.doctorId;
    let doctorData = await doctorModel.findById({ _id });
    let slots=doctorData.slots
  
    res.status(200).json({
      slots,
      success: true,
      message: "Successfully get Your profile ",
    });
  }catch{
    res.json({ message: "Something went wrong", success: false });
  }
}

const cancelDoctorSchedule=async(req,res,next)=>{
  try{
let {startTime}=req.body
console.log(startTime);
const doctorId = req.doctorId;
let doctorData = await doctorModel.findByIdAndUpdate(
  {_id : doctorId},
  { $pull: { slots: startTime } }
);



const deletedData = await slotBookingModel.findOneAndDelete({
  DoctorId: doctorId,
  bookingTime: startTime
}).populate('UserId')

let email=deletedData.UserId.email


const message = "Your Slot has been canceled you can Resheduled another Slot Sorry for the inconvinience"
sendCancellationEmail(email,message)

res.status(200).json({ message: "Doctor schedule canceled successfully" });
  }catch{
    res.status(200).json({ message: "Doctor schedule canceled successfully" });
  }
}

const userBookedSlot=async(req,res,next)=>{
try{
  const doctorId = req.doctorId;
  let bookedSlots = await slotBookingModel.find({ DoctorId: doctorId, status: "Active" });

res.status(200).json({
  bookedSlots,
  success: true,
  message: "Successfully get booked Slots ",
});
}catch{
  res.json({ message: "Something went wrong", success: false });
}
}
const getActiveBookingDetails=async(req,res,next)=>{
  try{
    const doctorId = req.doctorId;
    let bookedSlots = await slotBookingModel.find({ DoctorId: doctorId, status: "Active" }).populate('UserId')
     console.log(bookedSlots);
    res.status(200).json({
      bookedSlots,
      success: true,
      message: "Successfully get booked Slots ",
    });
  }catch{
    res.json({ message: "Something went wrong", success: false });  
  }
}
const getPlanChatUser=async(req,res,next)=>{
  try{
let userData=await planModel.find({status:"ACTIVE"})
let users = userData.map((data) => data.user);

let flattenedUsers = users.flat()
console.log(flattenedUsers);
let UserDetails = await userModel.find({ _id: { $in: flattenedUsers } });

res.status(200).json({
  UserDetails,
  success: true,
  message: "Successfully get booked Slots ",
});   
  }catch{
    res.json({ message: "Something went wrong", success: false });  
  }
}
module.exports = {
  doctorGetOtp,
  submitOtp,
  doctorLogin,
  doctorInfo,
  getDepartment,
  getRejReason,
  doctorAuth,
  editDoctorProfile,
  docorSelSlots,
  scheduledDoctorSlot,
  getDoctorNavData,
  displayScheduledSlot,
  cancelDoctorSchedule,
  userBookedSlot,
  getActiveBookingDetails,
  getPlanChatUser
};
