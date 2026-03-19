const MedicalRecord = require("../models/medicalRecordSchema");
const Prescription = require("../models/prescriptionSchema");

// --- User: Upload Medical Record ---
const uploadMedicalRecord = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.userId; // From verifyUserLogin middleware

    if (!req.file || !title) {
      return res.status(400).json({ error: "File and title are required" });
    }

    const fileUrl = `/lab_reports/${req.file.filename}`;

    const newRecord = new MedicalRecord({
      userId,
      title,
      fileUrl
    });

    await newRecord.save();
    res.status(201).json({ message: "Record uploaded successfully", record: newRecord });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- User: Get Own Medical Records ---
const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const records = await MedicalRecord.find({ userId }).sort({ uploadDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Doctor: Generate Prescription ---
const generatePrescription = async (req, res) => {
  try {
    const doctorId = req.doctorId; // From verifyDoctorLogin middleware
    const { userId, medicines, notes } = req.body;

    if (!userId || !medicines || medicines.length === 0) {
      return res.status(400).json({ error: "User ID and medicines are required" });
    }

    const newPrescription = new Prescription({
      userId,
      doctorId,
      medicines,
      notes
    });

    await newPrescription.save();
    res.status(201).json({ message: "Prescription generated successfully", prescription: newPrescription });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- User: Get Own Prescriptions ---
const getUserPrescriptions = async (req, res) => {
  try {
    const userId = req.userId;
    // Populate doctor details to show doctor's name on the prescription
    const prescriptions = await Prescription.find({ userId })
      .populate("doctorId", "name department")
      .sort({ date: -1 });
      
    res.status(200).json(prescriptions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  uploadMedicalRecord,
  getMedicalRecords,
  generatePrescription,
  getUserPrescriptions
};
