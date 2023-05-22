const router = require("express").Router();
const {
  userAuth,
  doUserSignup,
  verifyUserOtp,
  doUserLogin,
  getAllBanner,
  getAllDoctor,
  getAllDepartment,
  getAllPlan,
  categoryDoctors,
  getSelectedDoctorDetails,
  razorPayPayment,
  razorVerifyPayment,
  getUserPlanDetails,
  SlotBookingRazorpay,
  razorVerifySlotPayment,
  getUserBookingData,
  cancelUserBooking,
  getUserProfile,
  editUserProfile,
  getAlreadyBookedSlots,
  checkUserAnyPlan
 
} = require("../controller/userController");

const {addMessage,getAllMessage}=require("../controller/messageController")
const { uploadImage } = require("../middleware/multer");
const { verifyUserLogin } = require("../middleware/userAuth");
router.get("/auth", userAuth);
router.post("/userSignup", doUserSignup);
router.post("/userOtpSubmit", verifyUserOtp);
router.post("/userLogin", doUserLogin);
router.get("/getBanner", getAllBanner);
router.get("/getdoctor", getAllDoctor);
router.get("/getDepartment", getAllDepartment);
router.get("/getPlans", getAllPlan);
router.post("/getcategoryDoctor", categoryDoctors);
router.post("/getSelDoctorData/:Id", getSelectedDoctorDetails);
router.post("/razorPayment", razorPayPayment)
router.post("/verifyPayment",verifyUserLogin, razorVerifyPayment);
router.post("/getSlectedPlan",verifyUserLogin,getUserPlanDetails);
router.post("/slotBookingrazorPayment", SlotBookingRazorpay)
router.post("/verifySlotPayment",verifyUserLogin, razorVerifySlotPayment);
router.get("/getBookingData",verifyUserLogin, getUserBookingData);
router.put("/cancelUserBooking/:Id", cancelUserBooking);
router.get("/getUserData",verifyUserLogin,getUserProfile);
router.post( "/editUser", verifyUserLogin,  uploadImage.single("Image"), editUserProfile);
router.get("/getUserBookedSlot/:Id",verifyUserLogin,getAlreadyBookedSlots);
router.post('/addMessage',verifyUserLogin,addMessage)
router.post('/getAllMessage',verifyUserLogin,getAllMessage)
router.get("/checkUserPlan",verifyUserLogin,checkUserAnyPlan);



module.exports = router;

