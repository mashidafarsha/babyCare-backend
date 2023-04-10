const doctorModel = require("../models/doctorSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmailOTP } = require("../middleware/nodemailer");
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

const doctorGetOtp = async (req, res, next) => {
  try {
    let { name, phone, email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });
    console.log(doctor, "doctor");
    if (!doctor) {
      signupData = {
        name,
        email,
        phone,
        password,
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
    let { name, email, password } = signupData;
    if (otp == emailOtp) {
      let newpassword = await bcrypt.hash(password,10);

      let doctor =await doctorModel.create({
        name,
        email,
        password: newpassword
      });
    
      res
        .status(200)
        .json({  message: "Successfully registered",doctor, created: true });
    }else{
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

const doctorLogin=async(req,res,next)=>{
  try{
  let{email,password}=req.body
 let doctor=await doctorModel.findOne({email})
 console.log(doctor,"pp");
 if(doctor){
  let validPass =await bcrypt.compare(password,doctor.password);
  if(validPass){
    const token = generateToken(doctor._id);
        console.log(token);
        
        res
        .status(200)
        .json({ message: "Login Successfull", doctor, token, success: true });
  }else{
    const errors = { email: "Incorrect admin password" };
        res.json({ errors, success: false });
  }
 }else{
  const errors = { password: "email does not exist" };
  res.json({ errors, success: false });
 }


  }catch(error){
    console.log(error);
    const errors = { email: "Incorrect admin email or password" };
    res.json({ errors, success: false });
  }
}

const doctorInfo=async(req,res,next)=>{
  try{
    let{name,email,phone,qualification,department,experience,consultationFee}=req.body
    let doctor=await doctorModel.findOne({email})
    const newData = Object.assign({}, doctor.toObject(), {
     phone,
     qualification,
     department,
     experience,
     consultationFee
    });
    const updatedDoctor = await doctorModel.findOneAndUpdate(
      {email},
      newData,
      { new: true }
    );
    res.status(200).json({updatedDoctor,success:true,message:"After approvel Please Login"})
  }catch{
    
    res.json({ message:"its not Updated", success: false });
  }
 
  

}

module.exports = {
  doctorGetOtp,
  submitOtp,
  doctorLogin,
  doctorInfo
};
