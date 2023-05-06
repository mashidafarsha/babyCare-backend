const router = require('express').Router()
const{userAuth,doUserSignup,verifyUserOtp,doUserLogin,getAllBanner,getAllDoctor,getAllDepartment,getAllPlan}=require("../controller/userController")
const {verifyUserLogin}=require("../middleware/userAuth")
router.get('/auth',userAuth)
router.post("/userSignup",doUserSignup)
router.post("/userOtpSubmit",verifyUserOtp)
router.post("/userLogin",doUserLogin)
router.get("/getBanner",getAllBanner)
router.get("/getdoctor",getAllDoctor)
router.get("/getDepartment",getAllDepartment)
router.get("/getPlans", getAllPlan);

module.exports=router
