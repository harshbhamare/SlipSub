const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Institute = require("../models/institute");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.get("/", async function (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Access Denied: No Token Provided");
    }

    const decoded = jwt.verify(token, "prem"); 
    // console.log("Decoded Token:", decoded); 

    const instituteId = decoded.instituteid; 
    // console.log(instituteId)
    const email = decoded.email;
    if (!instituteId) {
        return res.status(400).send("Invalid Token: No Institute ID");
    }

    const instituteData = await Institute.findById(instituteId).populate("departments");
    // console.log("Institute Data:", instituteData);  

    if (!instituteData) {
        return res.status(404).send("Institute not found");
    }

    // If departments are still null or empty, log this information
    // console.log("Departments:", instituteData.departments); 

    res.render("institute-dashboard", {
        instituteModel: instituteData,
        departments: instituteData.departments
    });
  } catch (error) {
    console.error("Error fetching institute data:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
