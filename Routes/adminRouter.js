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
  getAllDetails
} = require("../controller/adminController");

router.get("/auth",adminAuth);
router.post("/adminLogin", adminLogin);
router.post("/addCategory", addCategory);
router.get("/category", getAllCategory);
router.put("/deleteCategory/:Id", deleteCategory);
router.post("/editCategory", editCategory);
router.get("/getDoctor", getDoctorDetails);
router.post("/acceptDoctor/:id", acceptDoctor);
router.post("/rejectDoctor", rejectDoctor);
router.post("/addBanner",uploadImage.single('Image'),addBanner);
router.get("/getBanner", getBannerDetails);
router.post("/editBanner",uploadImage.single('image'), editBanner);
router.put("/deleteBanner/:Id", deleteBanner);
router.get("/getApprovedDoctor", getAllDetails);
module.exports = router;
