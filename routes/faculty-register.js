const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const facultyModel = require("../models/faculty");
const instituteModel = require("../models/institute");
const departmentModel = require("../models/department");

router.get("/", async function (req, res) {
    try {
        const institutes = await instituteModel.find();
        const departments = await departmentModel.find();
        res.render("faculty-register", { institutes, departments });
    } catch (error) {
        console.error("Error fetching institutes and departments:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/", async function (req, res) {
    let { fullname, email, password, cnumber, institute, department } = req.body;

    try {
        // Validate Secret Key (Assuming each institute has a 'secretKey' field)
        const selectedInstitute = await instituteModel.findById(institute);
        // if (!selectedInstitute || selectedInstitute.secretKey !== secret) {
        //     return res.status(403).send("Invalid Secret Key for Institute.");
        // }

        let faculty = await facultyModel.findOne({ email });
        if (faculty) return res.status(400).send("Faculty already exists.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newFaculty = await facultyModel.create({
            name: fullname,
            email,
            password: hashedPassword,
            cnumber,
            institute,
            department
        });

        let token = jwt.sign({ email: email, faculty: newFaculty._id }, "ishq", { expiresIn: "1h" });
        res.cookie("token", token);

        res.send("Faculty registered successfully.");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
