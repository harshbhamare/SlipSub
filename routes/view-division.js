const express = require("express");
const router = express.Router();
const Hod = require("../models/hod");
const Year = require("../models/year");
const Division = require("../models/division");
const Subject = require("../models/subject");
const Faculty = require("../models/faculty");
const Department = require("../models/department"); 
const Student = require("../models/student"); // Ensure Student model is required

// GET route to fetch divisions and subjects for a year
router.get("/years/:yearId/divisions/view", async (req, res) => {
    try {
        const year = await Year.findById(req.params.yearId)
            .populate({
                path: "divisions",
                populate: { path: "department" }, // Ensure department is populated
            });

        if (!year) {
            return res.status(404).send("Year not found");
        }

        // ✅ Ensure divisions are correctly populated
        const divisions = await Division.find({ year: year._id }).populate("department");

        // ✅ Populate faculty details properly (as an array)
        const subjects = await Subject.find({ year: year._id }).populate({
            path: "faculty",
            select: "name email" // Select only necessary fields
        });

        const faculties = await Faculty.find();

        res.render("view-divisions", {
            year,
            divisions, // ✅ Use fetched divisions
            subjects,
            faculties,
        });
    } catch (error) {
        console.error("Error fetching divisions and subjects:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
