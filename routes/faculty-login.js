const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const facultyModel = require("../models/faculty");
const instituteModel = require("../models/institute");
require('dotenv').config();

router.get("/", async function (req, res) {
    try {
        const institutes = await instituteModel.find({}, "iname"); 
        res.render("faculty-login", { institutes }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.post("/", async function (req, res) {
    let { institute, email, password } = req.body;

    try {
        const instituteData = await instituteModel.findOne({ iname: institute });
        if (!instituteData) {
            return res.status(404).send("Institute not found");
        }

        const faculty = await facultyModel.findOne({ email, institute: instituteData._id });

        if (!faculty) {
            return res.status(404).send("Faculty not found in this institute");
        }

        const match = await bcrypt.compare(password, faculty.password);
        if (!match) {
            return res.status(401).send("Invalid password");
        }

        let token = jwt.sign({ email: email, facultyid: faculty._id }, "process.env.FACULTY", { expiresIn: "7d" });
        res.cookie("token", token);

        res.redirect("/classteacher/dashboard");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
