const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Department = require("../models/department");
const Division = require("../models/division"); 
const Year = require("../models/year"); // Import the Year model


router.get("/departments/:departmentId/years", async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId).populate("years");

    if (!department) {
      return res.status(404).send("Department not found");
    }

    // console.log("Fetched Years:", department.years);  // Debugging Log
    res.render("manage-years", { department, years: department.years });

  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/departments/:departmentId/years/add", async (req, res) => {
  try {
    const { year } = req.body;
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).send("Department not found");
    }

    // Create a new year
    const newYear = new Year({ year, department: departmentId });
    await newYear.save();

    // Push new year into department's years array
    department.years.push(newYear._id);
    await department.save();

    res.redirect(`/departments/${departmentId}/years`);
  } catch (error) {
    console.error("Error adding year:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
