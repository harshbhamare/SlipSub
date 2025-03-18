const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Faculty = require("../models/faculty");
const Student = require("../models/student");

router.get("/dashboard", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Access Denied: No Token Provided");
        }

        const decoded = jwt.verify(token, "ishq");

        const teacher = await Faculty.findById(decoded.facultyid); // FIXED HERE!

        if (!teacher || teacher.role !== "Class Teacher" || !teacher.classTeacherOf) {
            return res.status(403).send("You are not assigned as Class Teacher");
        }

        const students = await Student.find({ division: teacher.classTeacherOf });
        console.log(students)

        res.render("classteacher-dashboard", { students });
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
        const teacher = await Faculty.findById(decoded.facultyid);

        if (!teacher || teacher.role !== "Class Teacher" || !teacher.classTeacherOf) return res.status(403).json({ error: "Not authorized" });

        const query = req.query.q || "";

        const students = await Student.find({
            division: teacher.classTeacherOf,
            $or: [
                { fullname: { $regex: query, $options: "i" } },
                { htnum: { $regex: query, $options: "i" } },
            ],
        }).limit(10);

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

        const teacher = await Faculty.findById(decoded._id);
        if (!teacher || !teacher.classTeacherOf) return res.status(403).json({ error: "Not authorized" });

        const { defaulter } = req.body;

        const student = await Student.findOne({ _id: req.params.id, division: teacher.classTeacherOf });
        if (!student) return res.status(404).json({ error: "Student not found" });

        student.defaulter = defaulter === "true" ? true : false;
        student.status = "approved";
        await student.save();

        res.redirect("/classteacher/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
