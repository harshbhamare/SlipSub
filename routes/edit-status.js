const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Faculty = require("../models/faculty");
const Student = require("../models/student");
const Division = require("../models/division")
const Subject = require("../models/subject")

router.get('/student/:id/edit-status', async (req, res) => {
    const { id } = req.params;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, "ishq");
    const facultyId = decoded.facultyid;

    const student = await Student.findById(id).populate("division");

    if (!student) {
        return res.status(404).send("Student not found");
    }

    const divisionId = student.division._id;

    const facultySubjects = await Subject.find({
        department: student.department,  
        year: student.year,             
        faculty: new mongoose.Types.ObjectId(facultyId),
    });
    
    
    
    console.log("facultySubjects:", facultySubjects);
    console.log("divisionId:", divisionId);
console.log("facultyId:", facultyId);



    res.render("edit-status", { student, facultySubjects });
});


router.post('/student/:studentId/edit-status', async (req, res) => {
    const studentId = req.params.studentId;
    const updates = req.body; 
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        student.subject.forEach(sub => {
            const cieKey = `CIE_${sub.subjectName}`; 
            const taKey = `TA_${sub.subjectName}`;

            if (updates[cieKey]) {
                sub.submissionStatus.CIE = updates[cieKey];
            }
            if (updates[taKey]) {
                sub.submissionStatus.TA = updates[taKey];
            }
        });

        await student.save();
        res.redirect('/dashboard'); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating status');
    }
});


module.exports = router;
