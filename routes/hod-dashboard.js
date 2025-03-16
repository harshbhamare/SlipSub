const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Hod = require("../models/hod");
const Department = require("../models/department");
const Year = require("../models/year");
const cookieParser = require("cookie-parser");
const Faculty = require("../models/faculty")

router.use(cookieParser());

router.get("/", async function (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Access Denied: No Token Provided");
    }

    const decoded = jwt.verify(token, "mh123"); // Use your secret key
    const hodId = decoded.hodid;
    const email = decoded.email;

    if (!hodId) {
      return res.status(400).send("Invalid Token: No HOD ID");
    }

    // Fetch HOD details along with department and years
    const hodData = await Hod.findById(hodId)
      .populate("department")
      .populate("year");

      const pendingRequests = await Faculty.find({ status: "pending" });

    if (!hodData) {
      return res.status(404).send("HOD not found");
    }

    res.render("hod-dashboard", {
      hod: hodData,
      department: hodData.department,
      years: hodData.year,
      pendingRequests
    });

  } catch (error) {
    console.error("Error fetching HOD data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/hod/approve/:id", async (req, res) => {
  try {
      const facultyId = req.params.id;
      const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, { status: "approved" }, { new: true });

      if (!updatedFaculty) return res.status(404).send("Faculty not found");
      
      return res.status(200).send("Faculty approved successfully");
  } catch (error) {
      console.error("Error approving faculty:", error);
      return res.status(500).send("Internal Server Error");
  }
});

// Deny Faculty Request
router.post("/hod/deny/:id", async (req, res) => {
  try {
      const facultyId = req.params.id;
      await Faculty.findByIdAndDelete(facultyId);

      return res.status(200).send("Faculty request denied and removed");
  } catch (error) {
      console.error("Error denying faculty:", error);
      return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
