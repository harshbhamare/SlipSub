const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Hod = require("../models/hod");
const Department = require("../models/department");
const Year = require("../models/year");
const cookieParser = require("cookie-parser");
const Faculty = require("../models/faculty");
const Division = require("../models/division")

router.use(cookieParser());

router.get("/", async function (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Access Denied: No Token Provided");
    }

    const decoded = jwt.verify(token, "mh123");
    const hodId = decoded.hodid;
    const email = decoded.email;

    if (!hodId) {
      return res.status(400).send("Invalid Token: No HOD ID");
    }

    const hodData = await Hod.findById(hodId)
      .populate("department")
      .populate("year");

    if (!hodData) {
      return res.status(404).send("HOD not found");
    }

    const departmentId = hodData.department._id; 

    const pendingRequests = await Faculty.find({ status: "pending" });

    const divisions = await Division.find({ department: departmentId }).populate({
      path: "year",
      model: "Year"
    });

    res.render("hod-dashboard", {
      hod: hodData,
      department: hodData.department,
      divisions: divisions,    
      years: hodData.year,
      pendingRequests
    });

  } catch (error) {
    console.error("Error fetching HOD data:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/hod/faculty/approve/:id", async (req, res) => {
  try {
      const facultyId = req.params.id;
      let { divisionId, role } = req.body;

      if (role === "Normal Faculty") {
          role = "Faculty";
      }

      if (!role || (role !== "Class Teacher" && role !== "Faculty")) {
          return res.status(400).send("Invalid role selected");
      }

      if (role === "Class Teacher" && divisionId) {
          const existingClassTeacher = await Faculty.findOne({ classTeacherOf: divisionId, role: "Class Teacher" });

          if (existingClassTeacher) {
              return res.status(400).send("This division already has a class teacher assigned.");
          }
      }

      const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, { 
          status: "approved",
          role: role
      }, { new: true });

      if (!updatedFaculty) return res.status(404).send("Faculty not found");

      if (role === "Class Teacher" && divisionId) {
          updatedFaculty.classTeacherOf = divisionId;
          await updatedFaculty.save();
      } else {
          updatedFaculty.classTeacherOf = undefined;
          await updatedFaculty.save();
      }

      return res.status(200).send("Faculty approved successfully");
  } catch (error) {
      console.error("Error approving faculty:", error);
      return res.status(500).send("Internal Server Error");
  }
});


router.post("/hod/faculty/deny/:id", async (req, res) => {
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
