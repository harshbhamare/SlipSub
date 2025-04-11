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

    const department = await Department.findById(departmentId)
    if (!department) {
      return res.status(404).send("Department not found");
    }

    const newYear = new Year({ year, department: departmentId });
    await newYear.save();

    department.years.push(newYear._id);
    await department.save();

    await Hod.findByIdAndUpdate(department.hod, { $push: { year: newYear._id } });

    res.redirect(`/hod-dashboard`);
  } catch (error) {
    console.error("Error adding year:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
