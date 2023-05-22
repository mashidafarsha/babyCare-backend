const adminModel = require("../models/adminSchema");
const departmentModel=require("../models/departmentSchema")
const planModel=require("../models/planSchema")
const doctorModel=require("../models/doctorSchema")
const userModel=require("../models/userSchema")
const slotBookingModel=require("../models/slotBookingSchema")
const jwt = require("jsonwebtoken");
let env = require("dotenv").config();
const bcrypt = require("bcrypt");
const bannerModel=require("../models/bannerSchema")


function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}

const handleError = (err) => {
  let errors = { message: "" };

  if (err.code === 11000) {
    errors.message = "the Item is already exists";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach((properties) => {
      errors[properties.path] = properties.message;
    });
    return errors;
  }
};

const adminAuth=(req,res,next)=>{
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
       
              const admin =await adminModel.findById({ _id: decoded.id });
              if (admin) {
                  res.json({ status: true, message: "Authorized",adminData:admin });
  
              } else {
                  res.json({ status: false, message: "Admin not exists" })
              }
          }
      });
  } else {
      res.json({ status: false, message: 'Token not provided' })
  }
  }catch(err){
    res.json({ status: false, message: 'Token not provided' })
  }
  

}

const adminLogin = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    console.log(email, password);
    let admin = await adminModel.findOne({ email });

    if (admin) {
      let validPass = await bcrypt.compare(password, admin.password);

      if (validPass) {
        const token = generateToken(admin._id);
        console.log(token);

        res
          .status(200)
          .json({ message: "Login Successfull", admin, token, success: true });
      } else {
        const errors = { password: "Incorrect admin password" };
        res.json({ errors, success: false });
      }
    }  else {
        const errors = { email: "email does not exist" };
      res.json({ errors, success: false });
    }
  } catch (error) {
    console.log(error);
    const errors = { email: "Incorrect admin email or password" };
    res.json({ errors, success: false });
  }
};
const addCategory=async(req,res,next)=>{
  try{
    console.log('hyyy');
    const image = req.file.path.replace("public", "");
    let {categoryName,description}=req.body
    let department =await departmentModel.create({
      categoryName,
      description,
      image
      
    });
    console.log(department);
  res.status(200).json({message:"successfully add new category",success:true,department})

  }catch(err){
    const errors = handleError(err);
res.json({message:"something wrong",success:false,errors})
  }
}

const getAllCategory=async(req,res,next)=>{
  try{
    let department=await departmentModel.find({status:"ACTIVE"})
    console.log(department,"lllllllll");
    res.status(200).json({message:"successfully get category",success:true,department})

  }catch(err){
    res.json({message:"something wrong",success:false})
  }
}

const deleteCategory =async(req,res,next)=>{
  try{
    let categoryId=req.params.Id
    departmentModel.findOneAndUpdate({_id:categoryId},{$set:{status:"Blocked"}},{ new: true }).then((response)=>{
      res.status(200).json({message:"Deleted Successful",success:true})
    })
   
  }catch(err){
    res.json({ message: "Something went wrong", status: false })

  }
 
  
}
const editCategory=async(req,res,next)=>{
try{
  const image = req.file.path.replace("public", "");
const{id,categoryName,description}=req.body
let editDep=await departmentModel.findByIdAndUpdate({_id:id},{$set:{categoryName,description,image}},{ new: true })
res.status(200).json({message:"successfully edit Department",success:true, editDep})
}catch(err){
  console.log(err);
  res.json({ message: "Something went wrong", status: false })
}
 
}
const getDoctorDetails=async(req,res,next)=>{
try{
let doctors=await doctorModel.find({status:"Blocked"})
console.log(doctors);
res.status(200).json({message:"successfully get doctors",success:true,doctors})
}catch{
  res.json({ message: "Something went wrong", success: false })
}
}

const acceptDoctor=async(req,res,next)=>{
  try{
    let Id=req.params.id
   
    let doctor=await doctorModel.findByIdAndUpdate({_id:Id},
      {$set:{status:"Active"}},{ new: true })
    res.status(200).json({message:"successfully Accepted",success:true,doctor})

  }catch{
    res.json({ message: "Something went wrong", status: false })
  }
}

const rejectDoctor=async(req,res,next)=>{
  try{
let {id,reason}=req.body
let doctor=await doctorModel.findByIdAndUpdate({_id:id},
  {$set:{rejectReason:reason,status:"cancel"}},{ new: true })
res.status(200).json({message:"successfully rejected",success:true,doctor})

 
  }catch{

  }
}

const addBanner=async(req,res,next)=>{
  try{
    const image = req.file.path.replace("public", "");
   
    let {bannerName,description}=req.body
    console.log(bannerName,"pppp");
   let Banner=await bannerModel.create({
    bannerName:bannerName,
    description:description,
    image:image

   })

   res.status(200).json({message:"successfully add new Banner",success:true})

  }catch (err){
console.log(err);
const errors = handleError(err);
res.json({ message: "Something went wrong", status: false,errors })
  }
 
}
const getBannerDetails=async(req,res,next)=>{
try{
let BannerData=await bannerModel.find({status:"ACTIVE"})
console.log(BannerData);
res.status(200).json({message:"successfully get Banner",success:true, BannerData})
}catch{
  res.json({ message: "Something went wrong", status: false })
}
}

const editBanner=async(req,res,next)=>{
try{
  console.log("llllll");
 console.log(req.body);
 const image = req.file.path.replace("public", "");
let{bannerName,id,description}=req.body
let editedbanner= await bannerModel.findByIdAndUpdate({_id:id},
  {$set:{
  bannerName,
  description,
  image

}},{ new: true })
res.status(200).json({message:"successfully edit Banner",success:true, editedbanner})
}catch(err){
  console.log(err);
  res.json({ message: "Something went wrong", status: false, })
}
}

const deleteBanner=(req,res,next)=>{
  try{
    let BannerId=req.params.Id
    bannerModel.findOneAndUpdate({_id:BannerId},{$set:{status:"Blocked"}},{ new: true }).then((response)=>{
      res.status(200).json({message:"Deleted Successful",success:true})
    })
  }catch{
    res.json({ message: "Something went wrong", status: false })
  }
}

const getAllDoctorDetails=async(req,res,next)=>{
  try{
    let doctors=await doctorModel.find({status:{ $ne: "cancel" } })
    console.log(doctors);
    res.status(200).json({message:"successfully get doctors",success:true,doctors})
  }catch{
    res.json({ message: "Something went wrong", success: false })
  }
}

const getAllUserData=async(req,res,next)=>{
try{
let user=await userModel.find({status:"Active"})
console.log(user,"user");
res.status(200).json({message:"successfully get doctors",success:true,user})
}catch{
  res.json({ message: "Something went wrong", success: false })
}
}

const addPlan=async(req,res,next)=>{

  try{
  
    const image = req.file.path.replace("public", "")
    console.log(image);
   console.log("pppp");
    let {planname,description,amount,offerAmount}=req.body
    let plans = await planModel.create({
      planname,
      description,
      amount,
      offerAmount,
      image
    })


   
    res.status(200).json({message:"successfully add new plan",success:true,plans})
  
  }catch{
    res.json({ message: "Something went wrong", success: false })
  }
}
const getAllPlans=async(req,res,next)=>{
  try{
    console.log("hhhh");
    let plans=await planModel.find({status:"ACTIVE"})
    console.log(plans,"plans");
    res.status(200).json({message:"successfully get plans",success:true, plans})
  }catch{
    res.json({ message: "Something went wrong", success: false })
  }
}
const editPlan=async(req,res,next)=>{
try{
  const image = req.file.path.replace("public", "");
  let{id,planname,description,amount,offerAmount}=req.body
  let editedplan= await planModel.findByIdAndUpdate({_id:id},
    {$set:{
   
      planname,
      description,
      amount,
      offerAmount,
      image
  }},{ new: true })
  res.status(200).json({message:"successfully edited plan",success:true, editedplan})
}catch{
  res.json({ message: "Something went wrong", success: false })
}
}

const deletePlans=(req,res,next)=>{
  try{
    console.log("llll");
    let PlanId=req.params.Id
    planModel.findOneAndUpdate({_id:PlanId},{$set:{status:"Blocked"}},{ new: true }).then((response)=>{
      res.status(200).json({message:"Deleted Successful",success:true})
    })
  }catch{
    res.json({ message: "Something went wrong", status: false })
  }
}

const blockDoctors=async(req,res,next)=>{
  try{
    console.log("llll");
    let doctorId=req.params.Id

    let doctor=await doctorModel.findById(doctorId)
    const newStatus = doctor.status === "Active" ? "Block" : "Active";
    
    doctorModel.findOneAndUpdate({_id:doctorId},{$set:{status:newStatus}},{ new: true }).then((response)=>{
      res.status(200).json({message:"Blocked Successful",success:true})
    })

  }catch{
    res.json({ message: "Something went wrong", status: false })
  }
}

const  AllBookingDetails=async(req,res,next)=>{
 try{
  let bookingData=await slotBookingModel.find().populate('UserId').sort({ bookingTime: -1 });
  console.log(bookingData);
  res.status(200).json({message:"successfully get all bookings",success:true,bookingData})
}catch{
  res.json({ message: "Something went wrong", status: false })
}
 }


module.exports = {
  adminLogin,
  addCategory,
  getAllCategory,
  deleteCategory,
  editCategory,
  getDoctorDetails,
  acceptDoctor,
  rejectDoctor,
  addBanner,
  getBannerDetails,
  editBanner,
  adminAuth,
  getAllDoctorDetails,
  getAllUserData,
  deleteBanner,
  addPlan,
  getAllPlans,
  editPlan,
  deletePlans,
  blockDoctors,
  AllBookingDetails
};
