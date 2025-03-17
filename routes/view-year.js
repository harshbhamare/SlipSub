const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Hod = require("../models/hod");  
const Department = require("../models/department");
const Division = require("../models/division"); 
const Year = require("../models/year"); 
const Faculty = require("../models/faculty")

router.get("/departments/:departmentId/years", async (req, res) => {
  try {
    const departmentId = req.params.departmentId;

    const department = await Department.findById(departmentId).populate("years");

    if (!department) {
      return res.status(404).send("Department not found");
    }

    // Fetch faculties for this department + populate their subjects
    const faculties = await Faculty.find({ department: departmentId })
                                   .populate("subjects")
                                   .lean();

    res.render("view-years", { department, years: department.years, faculties });

  } catch (error) {
    console.error("Error fetching years and faculties:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;