const router = require("express").Router();
const {uploadImage}=require("../middleware/multer")
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
  AllBookingDetails
} = require("../controller/adminController");

router.get("/auth",adminAuth);
router.post("/adminLogin", adminLogin);
router.post("/addCategory",uploadImage.single('Image'), addCategory);
router.get("/category", getAllCategory);
router.put("/deleteCategory/:Id", deleteCategory);
router.post("/editCategory",uploadImage.single('image'),  editCategory);
router.get("/getDoctor", getDoctorDetails);
router.post("/acceptDoctor/:id", acceptDoctor);
router.post("/rejectDoctor", rejectDoctor);
router.post("/addBanner",uploadImage.single('Image'),addBanner);
router.get("/getBanner", getBannerDetails);
router.post("/editBanner",uploadImage.single('image'), editBanner);
router.put("/deleteBanner/:Id", deleteBanner);
router.get("/getApprovedDoctor", getAllDoctorDetails);
router.get("/getAllUser", getAllUserData);
router.post("/addPlans",uploadImage.single('image'),addPlan);
router.get("/getPlans", getAllPlans);
router.post("/editPlans",uploadImage.single('image'),editPlan);
router.put("/deletePlan/:Id", deletePlans);
router.put("/blockDoctor/:Id", blockDoctors);
router.get("/getAllBookingData", AllBookingDetails);
module.exports = router;

