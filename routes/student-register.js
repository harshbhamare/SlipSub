const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const studentModel = require("../models/student");
const instituteModel = require("../models/institute");
const departmentModel = require("../models/department");
const yearModel = require("../models/year");
const divisionModel = require("../models/division");
const subjectModel = require("../models/subject"); // ✅ Import Subject model

// Registration Form Route
router.get("/", async function (req, res) {
    const institutes = await instituteModel.find();
    const departments = await departmentModel.find();
    const years = await yearModel.find();
    const divisions = await divisionModel.find();

    res.render("student-register", { institutes, departments, years, divisions });
});

// Student Registration Route
router.post("/", async function (req, res) {
    try {
        let { fullname, email, password, htnum, institute, year, department, division } = req.body;

        // 🔹 Validate Required Fields
        if (!fullname || !email || !password || !htnum || !institute || !year || !department || !division) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        // 🔹 Check if student already exists
        let existingStudent = await studentModel.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: "Student already exists!" });
        }

        // 🔹 Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 🔹 Fetch All Subjects for Given Year
        const subjects = await subjectModel.find({ year }).select("_id");
        const formattedSubjects = subjects.map(subject => ({
            subjectName: subject._id,
            submissionStatus: { CIE: "Pending", TA: "Pending" }
        }));

        // 🔹 Create New Student
        let newStudent = new studentModel({
            fullname,
            email,
            password: hashedPassword,
            htnum,
            institute: new mongoose.Types.ObjectId(institute),
            year: new mongoose.Types.ObjectId(year),
            department: new mongoose.Types.ObjectId(department),
            division: new mongoose.Types.ObjectId(division),
            subject: formattedSubjects
        });

        await newStudent.save();

        // 🔹 Add Student ID to Division
        const divisionRecord = await divisionModel.findById(division);
        if (divisionRecord) {
            divisionRecord.students.push(newStudent._id);
            await divisionRecord.save();
        } else {
            console.warn("⚠️ Warning: Division not found, skipping update.");
        }

        // 🔹 Generate JWT Token
        const token = jwt.sign({ email, studentId: newStudent._id }, "secretkey", { expiresIn: "7d" });
        res.cookie("token", token);

        return res.status(201).json({ message: "Student registered successfully!", studentId: newStudent._id });

    } catch (error) {
        console.error("❌ Error in student registration:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
    

module.exports = router;
