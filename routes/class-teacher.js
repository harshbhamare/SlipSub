const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Faculty = require("../models/faculty");
const Student = require("../models/student");
const Division = require("../models/division")

router.get("/dashboard", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Access Denied: No Token Provided");
        }

        const decoded = jwt.verify(token, "ishq");

        const teacher = await Faculty.findById(decoded.facultyid);

        const pendingRequests = await Student.find({ status: "pending" });

        if (!teacher || teacher.role !== "Class Teacher" || !teacher.classTeacherOf) {
            return res.status(403).send("You are not assigned as Class Teacher");
        }

        const students = await Student.find({ division: teacher.classTeacherOf });

        res.render("classteacher-dashboard", { students, pendingRequests, });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/students/search", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "No token provided" });

        const decoded = jwt.verify(token, "ishq");
        const faculty = await Faculty.findById(decoded.facultyid);

        if (!faculty || faculty.status !== "approved") {
            return res.status(403).json({ error: "Not authorized" });
        }

        const query = req.query.q || "";

        let searchFilter = {
            $or: [
                { fullname: { $regex: query, $options: "i" } },
                { htnum: { $regex: query, $options: "i" } }
            ]
        };

        if (faculty.role === "Class Teacher" && faculty.classTeacherOf) {
            searchFilter.division = faculty.classTeacherOf;
        }

        const students = await Student.find(searchFilter).limit(10);

        return res.json(students);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/student/approve/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "No token provided" });

        const decoded = jwt.verify(token, "ishq");

        const teacher = await Faculty.findById(decoded.facultyid);
        if (!teacher || !teacher.classTeacherOf) return res.status(403).json({ error: "Not authorized" });

        const { defaulter } = req.body;

        const student = await Student.findOne({ _id: req.params.id, division: teacher.classTeacherOf });
        if (!student) return res.status(404).json({ error: "Student not found" });

        student.defaulter = defaulter === "yes" ? true : false;
        student.status = "approved";
        await student.save();
        console.log("Defaulter value from form:", defaulter);

        res.redirect("/classteacher/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/student/deny/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "No token provided" });

        const decoded = jwt.verify(token, "ishq");

        const teacher = await Faculty.findById(decoded.facultyid);
        if (!teacher || !teacher.classTeacherOf) return res.status(403).json({ error: "Not authorized" });

        const studentId = req.params.id;

        const student = await Student.findOne({ _id: studentId, division: teacher.classTeacherOf });
        if (!student) return res.status(404).json({ error: "Student not found" });

        await Division.updateOne(
            { _id: student.division },
            { $pull: { students: student._id } }
        );

        await Student.deleteOne({ _id: student._id });

        res.redirect("/classteacher/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
