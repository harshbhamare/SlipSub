const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Hod = require("../models/hod");  
const Department = require("../models/department");
const Division = require("../models/division"); 
const Year = require("../models/year"); 
const Faculty = require("../models/faculty")
require("dotenv").config();

router.get("/departments/:departmentId/years", async (req, res) => {
  try {
    const token = req.cookies.token;
    // If token is missing, redirect to login page
    if (!token) {
      return res.status(401).redirect("/institute-login");
    }

    // Verify token and handle errors
    try {
      let decoded = jwt.verify(token, "process.env.INSTITUTE"); 

    } catch (err) {
      return res.status(403).send("Access Denied: Invalid Token");
    }

    // Proceed if token is valid, fetch department details
    const departmentId = req.params.departmentId;

    const department = await Department.findById(departmentId).populate("years");

    if (!department) {
      return res.status(404).send("Department not found");
    }

    // Fetch faculties for this department and populate their subjects
    const faculties = await Faculty.find({ department: departmentId })
                                   .populate("subjects")
                                   .lean();

    // Render the view with department and faculty data
    res.render("view-years", { department, years: department.years, faculties });

  } catch (error) {
    console.error("Error fetching years and faculties:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;