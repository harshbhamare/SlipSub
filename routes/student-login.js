const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/student");
require("dotenv").config();

router.get("/", (req, res) => {
    res.render("student-login");
});

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await studentModel.findOne({ email });

        if (!student) {
            return res.status(404).send("Student not found");
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).send("Invalid password");
        }

        if (student.status !== "approved") {
            return res.send("Your Approval is Pending");
        }

        const token = jwt.sign(
            { email: student.email, studentId: student._id },
            process.env.STUDENT,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, { httpOnly: true });
        return res.redirect("/student-profile");

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
