const adminModel=require("../models/adminSchema")
require('dotenv').config();
const jwt = require("jsonwebtoken");

const verifyAdminLogin=(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];

            const secret = process.env.JWT_SECRET || "thisismysecret";
            jwt.verify(token, secret, async (err, decoded) => {
               
                if (err) {
                    console.error("verifyAdminLogin JWT Error:", err.message);
                    res.json({ status: false, message: "Permission not allowed" });
                } else {
                    try {
                        const admin = await adminModel.findOne({ _id: decoded.id });
                        if (admin) {
                            req.adminId = admin._id;
                            next();
                        } else {
                            console.error("verifyAdminLogin Admin not found for ID:", decoded.id);
                            res.json({ status: false, message: "Admin not exists" });
                        }
                    } catch (dbErr) {
                        console.error("verifyAdminLogin Database Error:", dbErr.message);
                        res.json({ status: false, message: "Database Error" });
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
module.exports = { verifyAdminLogin }