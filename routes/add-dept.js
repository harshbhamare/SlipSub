const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Department = require("../models/department");
const Institute = require("../models/institute");
const Hod = require("../models/hod");
require('dotenv').config();

router.use(cookieParser());

router.post("/", async function (req, res) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Access Denied: No Token Provided");
        }

        const decoded = jwt.verify(token, "process.env.HOD");
        const instituteId = decoded.instituteid;

        const { name, head, email, password } = req.body;

        if (!name || !head || !email || !password) {
            return res.status(400).send("Missing required fields: name, head, email, or password");
        }

        const institute = await Institute.findById(instituteId);
        if (!institute) {
            return res.status(404).send("Institute not found");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newHod = new Hod({
            head,
            email,
            password: hashedPassword,
            institute: instituteId,
        });

        const savedHod = await newHod.save();

        const newDepartment = new Department({
            name,
            head,
            institute: instituteId,
            hod: savedHod._id, 
        });

        const savedDepartment = await newDepartment.save();

        await Hod.findByIdAndUpdate(savedHod._id, { department: savedDepartment._id });

        institute.departments.push(savedDepartment._id);
        await institute.save();

        res.redirect("/institute-dashboard");
    } catch (error) {
        console.error("Error adding department:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
