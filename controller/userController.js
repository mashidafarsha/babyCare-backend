const userModel = require("../models/userSchema");
const bannerModel=require("../models/bannerSchema")
const doctorModel=require("../models/doctorSchema")
const departmentModel=require("../models/departmentSchema")
const { sentOtp, verifyOtp } = require("../middleware/twilio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let env = require("dotenv").config();


function generateToken(id) {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
  }
let userData;

const userAuth=(req,res,next)=>{
  try{
    const authHeader = req.headers.authorization;
    console.log(authHeader,"llll");
    if (authHeader) {
      console.log("hello");
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
           
          if (err) {
      
              res.json({ status: false, message: "Unauthorized" });
          } else {
       
              const user = userModel.findById({ _id: decoded.id });
              if (user) {
                  res.json({ status: true, message: "Authorized" });
  
              } else {
                  res.json({ status: false, message: "Admin not exists" })
              }
          }
      });
  } else {
      res.json({ status: false, message: 'Token not provided' })
  }
  }catch{

  }
}
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
    let user = await userModel.findOne({ phone});
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
      let usersDetails =await userModel.create({
        name,
        email,
        phone,
        password: newpassword,
        cPassword: newCpassword,
      });
      res.status(200).json({status: true,usersDetails, message: "succesfully created new user" })
    }else{
        res.json({status:false,message:"incorrect OTP"})
    }
  } catch {
    console.log(err);
  }
};

const doUserLogin=async(req,res,next)=>{
    try{
        let {email,password}=req.body
    let user=await userModel.findOne({email})
    console.log(user);
    if(user){
       
        let isValid=await bcrypt.compare(password,user.password)
        console.log(isValid);
        if(isValid){
        
            const token = generateToken(user._id);
           
    
            res
              .status(200)
              .json({ message: "Login Successfull",user, token, success: true });
        }else{
            const errors = { password: "Incorrect admin password" };
            res.json({ errors, success: false });
        }
    }else{
        const errors = { email: "Incorrect admin password" };
        res.json({ errors, success: false });
    }

    }catch{
        const errors = { email: "Incorrect admin email or password" };
        res.json({ errors, success: false });
    }
}

const getAllBanner=async(req,res,next)=>{
try{
  let BannerData=await bannerModel.find({status:"ACTIVE"})
  console.log(BannerData);
  res.status(200).json({message:"successfully get Banner",success:true, BannerData})
}catch{

}
}
const getAllDoctor=async(req,res,next)=>{

try{

  let doctorData=await doctorModel.find({status:"Active"})
  console.log(doctorData,"lllll");
  res.status(200).json({message:"successfully get doctors",success:true, doctorData})
}catch{

}
}

const getAllDepartment=async(req,res,next)=>{
try{
  let departmentData=await departmentModel.find({status:"ACTIVE"})
  console.log(departmentData,"lllll");
  res.status(200).json({message:"successfully get department",success:true, departmentData})
}catch{

}
}
module.exports = { userAuth,doUserSignup, verifyUserOtp,doUserLogin,getAllBanner,getAllDoctor,getAllDepartment };
