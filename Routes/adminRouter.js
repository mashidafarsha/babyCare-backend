const router = require("express").Router();
const {uploadImage}=require("../middleware/multer")
const {verifyAdminLogin}=require("../middleware/adminAuth")
const {
  adminAuth,
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
  deleteBanner,
  getAllDoctorDetails,
  getAllUserData,
  addPlan,
  getAllPlans,
  editPlan,
  deletePlans,
  blockDoctors,
  AllBookingDetails,
  AllBookingDataForChart
} = require("../controller/adminController");

router.get("/auth",adminAuth);
router.post("/adminLogin", adminLogin);
router.post("/addCategory",verifyAdminLogin,uploadImage.single('Image'), addCategory);
router.get("/category",verifyAdminLogin, getAllCategory);
router.put("/deleteCategory/:Id",verifyAdminLogin, deleteCategory);
router.post("/editCategory",verifyAdminLogin,uploadImage.single('image'),  editCategory);
router.get("/getDoctor",verifyAdminLogin, getDoctorDetails);
router.post("/acceptDoctor/:id",verifyAdminLogin, acceptDoctor);
router.post("/rejectDoctor",verifyAdminLogin, rejectDoctor);
router.post("/addBanner",verifyAdminLogin,uploadImage.single('Image'),addBanner);
router.get("/getBanner",verifyAdminLogin, getBannerDetails);
router.post("/editBanner",verifyAdminLogin,uploadImage.single('image'), editBanner);
router.put("/deleteBanner/:Id",verifyAdminLogin, deleteBanner);
router.get("/getApprovedDoctor",verifyAdminLogin, getAllDoctorDetails);
router.get("/getAllUser",verifyAdminLogin, getAllUserData);
router.post("/addPlans",verifyAdminLogin,uploadImage.single('image'),addPlan);
router.get("/getPlans",verifyAdminLogin, getAllPlans);
router.post("/editPlans",verifyAdminLogin,uploadImage.single('image'),editPlan);
router.put("/deletePlan/:Id",verifyAdminLogin, deletePlans);
router.put("/blockDoctor/:Id",verifyAdminLogin, blockDoctors);
router.get("/getAllBookingData",verifyAdminLogin, AllBookingDetails);
router.get("/getChartBookingData",verifyAdminLogin, AllBookingDataForChart);
module.exports = router;

