const express = require("express");
const router = express.Router();
const Hod = require("../models/hod");
const Year = require("../models/year");
const Division = require("../models/division");
const Subject = require("../models/subject");
const Faculty = require("../models/faculty");
const Department = require("../models/department"); 
const Student = require("../models/student");
const jwt = require("jsonwebtoken")
require("dotenv").config(); 

router.get("/years/:yearId/divisions/view", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).redirect("/institute-login");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, "process.env.INSTITUTE");
        } catch (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(403).send("Access Denied: Invalid Token");
        }

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
