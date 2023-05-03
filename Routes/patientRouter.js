const router = require('express').Router()
const{userAuth,doUserSignup,verifyUserOtp,doUserLogin,getAllBanner,getAllDoctor,getAllDepartment}=require("../controller/userController")

router.get('/auth',userAuth)
router.post("/userSignup",doUserSignup)
router.post("/userOtpSubmit",verifyUserOtp)
router.post("/userLogin",doUserLogin)
router.get("/getBanner",getAllBanner)
router.get("/getdoctor",getAllDoctor)
router.get("/getDepartment",getAllDepartment)
module.exports=router
