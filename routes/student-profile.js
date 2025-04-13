const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/student");

router.use(cookieParser());

router.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            // return res.status(401).send("Access Denied: No Token Provided");
            return res.status(401).redirect("/student-login");
        }

        // Correct usage of environment variable
        const decoded = jwt.verify(token, process.env.STUDENT);

        const student = await studentModel
            .findById(decoded.studentId)
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

        res.render("student-profile", { student });

    } catch (error) {
        console.error("Error:", error);
        return res.status(401).send("Access Denied: Invalid Token");
    }
});

module.exports = router;
