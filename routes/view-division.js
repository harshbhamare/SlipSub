const express = require("express");
const router = express.Router();
const Hod = require("../models/hod");
const Year = require("../models/year");
const Division = require("../models/division");
const Subject = require("../models/subject");
const Faculty = require("../models/faculty");
const Department = require("../models/department"); 
const Student = require("../models/student"); 

router.get("/years/:yearId/divisions/view", async (req, res) => {
    try {
        const year = await Year.findById(req.params.yearId)
            .populate({
                path: "divisions",
                populate: { path: "department" }, 
            });

        if (!year) {
            return res.status(404).send("Year not found");
        }

        const divisions = await Division.find({ year: year._id }).populate("department");

        const subjects = await Subject.find({ year: year._id }).populate({
            path: "faculty",
            select: "name email" 
        });

        const faculties = await Faculty.find();

        res.render("view-divisions", {
            year,
            divisions, 
            subjects,
            faculties,
        });
    } catch (error) {
        console.error("Error fetching divisions and subjects:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
