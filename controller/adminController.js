const adminModel = require("../models/adminSchema");
const departmentModel=require("../models/departmentSchema")
const doctorModel=require("../models/doctorSchema")
const jwt = require("jsonwebtoken");
let env = require("dotenv").config();
const bcrypt = require("bcrypt");
const bannerModel=require("../models/bannerSchema")


function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}

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
       
              const admin = adminModel.findById({ _id: decoded.id });
              if (admin) {
                  res.json({ status: true, message: "Authorized" });
  
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
    let {categoryName,description}=req.body
    let department =await departmentModel.create({
      categoryName,
      description,
      
    });
    console.log(department);
  res.status(200).json({message:"successfully add new category",success:true,department})

  }catch(err){
    let errors = { name: ""};

  if (err.code === 11000) {
    errors.name = "category is already exists";
    
  }
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
const editCategory=(req,res,next)=>{
try{
const{id,categoryName,description}=req.body
departmentModel.findByIdAndUpdate({_id:id},{$set:{categoryName,description}}).then((response)=>{
  res.status(200).json({message:"Updated Successful",success:true})
})
}catch{
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
res.json({ message: "Something went wrong", status: false })
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
 let image=req.file.path
let{bannerName,id,description}=req.body
let editedbanner= await bannerModel.findByIdAndUpdate({_id:id},
  {$set:{
  bannerName,
  description,
  image

}},{ new: true })

}catch{

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

const getAllDetails=async(req,res,next)=>{
  try{
    let doctors=await doctorModel.find({status:"Active"})
    console.log(doctors);
    res.status(200).json({message:"successfully get doctors",success:true,doctors})
  }catch{
    res.json({ message: "Something went wrong", success: false })
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
  getAllDetails,
  deleteBanner

};
