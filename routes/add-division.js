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
router.get("/years/:yearId/divisions", async (req, res) => {
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

        res.render("manage-divisions", {
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

// router.post("/years/:yearId/divisions/add", async (req, res) => {
//     try {
//         const { divisionName } = req.body;
//         const year = await Year.findById(req.params.yearId).populate("department");

//         if (!year) {
//             return res.status(404).send("Year not found");
//         }

//         if (!divisionName) {
//             return res.status(400).send("Division name is required.");
//         }

//         // Create new division
//         const newDivision = new Division({
//             divisionName,
//             year: year._id,
//             department: year.department._id, // Auto-assign department
//         });

//         await newDivision.save();

//         // ✅ Push division ID into Department's divisions array
//         await Department.findByIdAndUpdate(year.department._id, { $push: { divisions: newDivision._id } });

//         // ✅ Push division ID into Year's divisions array
//         await Year.findByIdAndUpdate(year._id, { $push: { divisions: newDivision._id } });


//         res.redirect(`/years/${year._id}/divisions`);
//     } catch (error) {
//         console.error("Error adding division:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

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

        // ✅ Create new division
        const newDivision = new Division({
            divisionName,
            year: year._id,
            department: year.department._id,
        });

        await newDivision.save();

        // ✅ Push division ID into department's divisions array
        await Department.findByIdAndUpdate(year.department._id, { $push: { divisions: newDivision._id } });

        // ✅ Push division ID into year's divisions array
        await Year.findByIdAndUpdate(year._id, { $push: { divisions: newDivision._id } });

        // ✅ Push division ID into HOD schema
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

        // ✅ Check if the subject already exists
        let subject = await Subject.findOne({ name, code });

        if (subject) {
            // ✅ Add faculty ID if not already present
            if (!subject.faculty.includes(faculty)) {
                subject.faculty.push(faculty);
                await subject.save();
            }
        } else {
            // ✅ Create new subject
            subject = new Subject({
                name,
                code,
                department: year.department._id,
                year: year._id,
                faculty: [faculty]
            });
            await subject.save();
        }

        // ✅ Ensure faculty's subjects list is updated
        await Faculty.findByIdAndUpdate(faculty, {
            $addToSet: { subjects: subject._id } // 🔹 This ensures faculty.subjects array is updated correctly
        });

        // ✅ Get all students in the year
        const students = await Student.find({ year: year._id });

        // ✅ Update students' subjects array safely
        for (const student of students) {
            if (!Array.isArray(student.subject)) {
                student.subject = []; // Ensure it's an array
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
