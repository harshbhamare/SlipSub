const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Hod = require("../models/hod");
const Department = require("../models/department");
const Year = require("../models/year");
const cookieParser = require("cookie-parser");

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

    if (!hodData) {
      return res.status(404).send("HOD not found");
    }

    res.render("hod-dashboard", {
      hod: hodData,
      department: hodData.department,
      years: hodData.year
    });

  } catch (error) {
    console.error("Error fetching HOD data:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
