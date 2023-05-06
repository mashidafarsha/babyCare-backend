const router = require("express").Router();
const {
  doctorGetOtp,
  submitOtp,
  doctorLogin,
  doctorInfo,
  getRejReason,
  doctorAuth,
  editDoctorProfile,
  getDepartment,
  docorSelSlots,
  scheduledDoctorSlot,
  getDoctorNavData
} = require("../controller/doctorController");
const { verifyDoctorLogin } = require("../middleware/doctorAuth");
const { upload } = require("../middleware/fileupload");
const { uploadImage } = require("../middleware/multer");

router.get("/auth", doctorAuth);
router.post("/doctorSignup", doctorGetOtp);
router.post("/doctorOtp", submitOtp);
router.post("/doctorLogin", doctorLogin);
router.post("/doctorInfo", upload.single("file"), doctorInfo);
router.get("/getDepartment", getDepartment);
router.get("/getReason", verifyDoctorLogin, getRejReason);
router.post(
  "/editDoctor",
  verifyDoctorLogin,
  uploadImage.single("Image"),
  editDoctorProfile
);
router.post("/doctorSelectSlot", verifyDoctorLogin, docorSelSlots);
router.get("/getScheduledSlot", verifyDoctorLogin, scheduledDoctorSlot);
router.post("/getDoctorNav",verifyDoctorLogin,getDoctorNavData)
module.exports = router;
