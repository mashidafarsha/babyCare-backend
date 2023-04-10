const adminModel = require("../models/adminSchema");
const departmentModel=require("../models/departmentSchema")
const jwt = require("jsonwebtoken");
let env = require("dotenv").config();
const bcrypt = require("bcrypt");


function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
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
const addCategory=async(req,res,next)=>{
  try{
    let {categoryName,description}=req.body
    let department =await departmentModel.create({
      categoryName,
      description,
      
    });
    console.log(department);
  res.status(200).json({message:"successfully add new category",success:true,department})

  }catch(err){
res.json({message:"something wrong",success:false})
  }
}

const getAllCategory=async(req,res,next)=>{
  try{
    let department=await departmentModel.find({status:"ACTIVE"})
    console.log(department);
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
  console.log(req.body,"hhh");
}catch{

}
 
}


module.exports = {
  adminLogin,
  addCategory,
  getAllCategory,
  deleteCategory,
  editCategory

};
