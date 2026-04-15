const MedicalRecord = require("../models/medicalRecordSchema");
const Prescription = require("../models/prescriptionSchema");
const slotBookingModel = require("../models/slotBookingSchema");

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

    // Map medicines into string for User Profile
    const mappedPrescription = medicines.map(m => `- ${m.name} (${m.dosage}): ${m.frequency} for ${m.duration}`).join('\n') + (notes ? `\n\nNotes:\n${notes}` : '');

    // Now update the most recent active appointment for this user and doctor
    console.log("Searching for latest booking for UserId:", userId, "DoctorId:", doctorId);
    const latestBooking = await slotBookingModel.findOne({ UserId: userId, DoctorId: doctorId, status: "Active" }).sort({ created: -1 });
    if(latestBooking) {
      console.log("Found Active Booking, updating prescription!", latestBooking._id);
      latestBooking.prescription = mappedPrescription;
      latestBooking.status = "Completed";
      await latestBooking.save();
    } else {
      console.log("No active booking found. Searching for ANY booking.");
      // If no active, just attach to nearest regardless of status
      const anyBooking = await slotBookingModel.findOne({ UserId: userId, DoctorId: doctorId }).sort({ created: -1 });
      if (anyBooking) {
         console.log("Found Nearest Booking, updating prescription!", anyBooking._id);
         anyBooking.prescription = mappedPrescription;
         await anyBooking.save();
      } else {
         console.log("No Booking found AT ALL between Doctor and User.");
      }
    }

    res.status(201).json({ message: "Prescription generated successfully and linked to encounter", prescription: newPrescription });
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
