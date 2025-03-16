const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Hod = require("../models/hod");  
const Department = require("../models/department");
const Division = require("../models/division"); 
const Year = require("../models/year"); 

router.get("/departments/:departmentId/years", async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId).populate("years");

    if (!department) {
      return res.status(404).send("Department not found");
    }

    res.render("view-years", { department, years: department.years });

  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;