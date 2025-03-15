const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Department = require("../models/department");
const Institute = require("../models/institute");
const Hod = require("../models/hod");

router.use(cookieParser());

router.post("/", async function (req, res) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Access Denied: No Token Provided");
        }

        const decoded = jwt.verify(token, "prem");
        const instituteId = decoded.instituteid;

        const { name, head, email, password } = req.body;

        if (!name || !head || !email || !password) {
            return res.status(400).send("Missing required fields: name, head, email, or password");
        }

        const institute = await Institute.findById(instituteId);
        if (!institute) {
            return res.status(404).send("Institute not found");
        }

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create new HOD profile
        const newHod = new Hod({
            head,
            email,
            password: hashedPassword,
            institute: instituteId,
        });

        const savedHod = await newHod.save();

        // ✅ Create new Department and assign HOD
        const newDepartment = new Department({
            name,
            head,
            institute: instituteId,
            hod: savedHod._id, // Link HOD to department
        });

        const savedDepartment = await newDepartment.save();

        // ✅ Push department ID to the HOD schema
        await Hod.findByIdAndUpdate(savedHod._id, { department: savedDepartment._id });

        // ✅ Push department ID into the institute's `departments` array
        institute.departments.push(savedDepartment._id);
        await institute.save();

        res.redirect("/institute-dashboard");
    } catch (error) {
        console.error("Error adding department:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
