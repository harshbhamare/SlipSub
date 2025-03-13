const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const facultyModel = require("../models/faculty");
const instituteModel = require("../models/institute");

router.get("/", async function (req, res) {
    try {
        const institutes = await instituteModel.find({}, "iname"); // Fetch only institute names
        res.render("faculty-login", { institutes }); // Pass institutes data to frontend
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.post("/", async function (req, res) {
    let { institute, email, password } = req.body;

    try {
        // Find the Institute first
        const instituteData = await instituteModel.findOne({ iname: institute });
        if (!instituteData) {
            return res.status(404).send("Institute not found");
        }

        // Find the Faculty in that Institute
        const faculty = await facultyModel.findOne({ email, institute: instituteData._id });

        if (!faculty) {
            return res.status(404).send("Faculty not found in this institute");
        }

        // Compare Password
        const match = await bcrypt.compare(password, faculty.password);
        if (!match) {
            return res.status(401).send("Invalid password");
        }

        // Generate Token
        let token = jwt.sign({ email: email, facultyid: faculty._id }, "ishq", { expiresIn: "7d" });
        res.cookie("token", token);

        return res.status(200).send("Login successful");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
