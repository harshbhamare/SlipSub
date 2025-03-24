const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/student");
require('dotenv').config();

router.get("/", (req, res) => {
    res.render("student-login");
});

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        let student = await studentModel
            .findOne({ email })
            .populate({
                path: "subject.subjectName",
                select: "name code",
            })
            .populate("institute")
            .populate("year")
            .populate("department")
            .populate("division")
            .lean(); 

        if (!student) {
            return res.status(404).send("Student not found");
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).send("Invalid password");
        }

        const token = jwt.sign(
            { email: email, studentId: student._id },
            "process.env.STUDENT",
            { expiresIn: "7d" }
        );

        res.cookie("token", token, { httpOnly: true });

        console.log("Populated Student Data:", JSON.stringify(student, null, 2));

        return res.status(200).render("student-profile", { student });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
