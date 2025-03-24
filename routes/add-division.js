const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const Hod = require("../models/hod");
const Year = require("../models/year");
const Division = require("../models/division");
const Subject = require("../models/subject");
const Faculty = require("../models/faculty");
const Department = require("../models/department"); 
const Student = require("../models/student"); 


router.get("/years/:yearId/divisions", async (req, res) => {
    try {

        const token = req.cookies.token;
        if (!token) {
          return res.status(401).send("Access Denied: No Token Provided");
        }
    
        const decoded = jwt.verify(token, "process.env.HOD"); 
        
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

        res.render("manage-divisions", {
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


router.post("/years/:yearId/divisions/add", async (req, res) => {
    try {
        const { divisionName } = req.body;
        const year = await Year.findById(req.params.yearId).populate("department");

        if (!year) {
            return res.status(404).send("Year not found");
        }

        if (!divisionName) {
            return res.status(400).send("Division name is required.");
        }

        const newDivision = new Division({
            divisionName,
            year: year._id,
            department: year.department._id,
        });

        await newDivision.save();

        await Department.findByIdAndUpdate(year.department._id, { $push: { divisions: newDivision._id } });

        await Year.findByIdAndUpdate(year._id, { $push: { divisions: newDivision._id } });

        await Hod.findByIdAndUpdate(year.department.hod, { $push: { divisions: newDivision._id } });

        res.redirect(`/years/${year._id}/divisions`);
    } catch (error) {
        console.error("Error adding division:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.post("/years/:yearId/subjects/add", async (req, res) => {
    try {
        const { name, code, faculty } = req.body;
        if (!name || !code || !faculty) {
            return res.status(400).send("All fields (name, code, faculty) are required.");
        }

        const year = await Year.findById(req.params.yearId).populate("department");
        if (!year) {
            return res.status(404).send("Year not found");
        }

   
        let subject = await Subject.findOne({ name, code });

        if (subject) {
            if (!subject.faculty.includes(faculty)) {
                subject.faculty.push(faculty);
                await subject.save();
            }
        } else {
            subject = new Subject({
                name,
                code,
                department: year.department._id,
                year: year._id,
                faculty: [faculty]
            });
            await subject.save();
        }

       
        await Faculty.findByIdAndUpdate(faculty, {
            $addToSet: { subjects: subject._id }
        });


        const students = await Student.find({ year: year._id });

        for (const student of students) {
            if (!Array.isArray(student.subject)) {
                student.subject = []; 
            }

            const alreadyExists = student.subject.some(subj => subj?.subjectName?.equals(subject._id));

            if (!alreadyExists) {
                student.subject.push({
                    subjectName: subject._id,
                    submissionStatus: { CIE: "Pending", TA: "Pending" }
                });
                await student.save();
            }
        }

        res.redirect(`/years/${year._id}/divisions`);
        
    } catch (error) {
        console.error("Error adding subject:", error);
        res.status(500).send("Internal Server Error");
    }
});




module.exports = router;
