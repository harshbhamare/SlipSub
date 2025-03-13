const express = require("express");
const router = express.Router();
const Department = require("../models/department");
const Institute = require("../models/institute");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.post("/", async function (req, res) {
    try {
        // console.log("Headers:", req.headers);
        // console.log("Cookies:", req.cookies);

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Access Denied: No Token Provided");
        }

        const decoded = jwt.verify(token, "prem");
        const instituteId = decoded.instituteid;

        console.log("Decoded Token:", decoded);
        console.log(instituteId)

        const { name, head } = req.body;

        if (!name || !head) {
            return res.status(400).send("Missing required fields: name or head");
        }

        const institute = await Institute.findById(instituteId);
        if (!institute) {
            return res.status(404).send("Institute not found");
        }

        const newDepartment = new Department({
            name,
            head,
            institute: instituteId 
        });

        const savedDepartment = await newDepartment.save();

        // ✅ Push department ID into the institute's `departments` array
        institute.departments.push(savedDepartment._id);
        await institute.save();

        // res.status(201).json({
        //     message: "Department added successfully",
        // });
        res.redirect("institute-dashboard")

    } catch (error) {
        console.error("Error adding department:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
