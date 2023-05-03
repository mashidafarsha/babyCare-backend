const doctorModel=require("../models/doctorSchema")
let env=require('dotenv').config()
const jwt = require("jsonwebtoken");
let jwt_secret=process.env.JWT_SECRET;

const verifyDoctorLogin=(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, jwt_secret, async (err, decoded) => {
               
                if (err) {
                    res.json({ status: false, message: "Permission not allowed" });
                } else {
                    const doctor =await doctorModel.findOne({ _id:decoded.id})
                    if (doctor) {
                        req.doctorId = doctor._id
                         next()
                    } else {
                        console.log("err");
                        res.json({ status: false, message: "Admin not exists" });
                    }
                }
            });
        } else {
            res.json({ status: false, message: 'Token not provided' });
        }
    }catch{
        res.status(401).json({ message: "Not authorized" });
    }
}
module.exports = { verifyDoctorLogin }