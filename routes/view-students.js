const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const studentModel = require("../models/student");
const divisionModel = require("../models/division");
const jwt = require("jsonwebtoken")

router.use(cookieParser());

router.get("/years/:divisionId/student-list", async function (req, res) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send("Access Denied: No Token Provided");
        }

        const keys = [
            process.env.FACULTY,
            process.env.HOD,
            process.env.INSTITUTE
        ];

        let decoded = null;
        let verified = true;

        // Try verifying the token with each secret key
        for (let key of keys) {
            try {
                decoded = jwt.verify(token, key);
                verified = true;
                break;
            } catch (err) {
                // silently continue to next key
            }
        }

        if (!verified) {
            return res.status(403).send("Access Denied: Invalid Token");
        }

        const { divisionId } = req.params;

        if (!divisionId) {
            return res.status(400).send("Division ID is required.");
        }

        const students = await studentModel
            .find({ division: divisionId })
            .populate({
                path: "subject",
                populate: {
                    path: "subjectName",
                    model: "Subject",
                },
            })
            .lean();

        if (!students.length) {
            return res.status(404).send({ message: "No Student Found in DIVISION" });
        }

        const division = await divisionModel.findById(divisionId).lean();

        if (!division) {
            return res.status(404).send("Division not found");
        }

        res.render("student-list", { students, divisionName: division.divisionName });

    } catch (error) {
        console.error("Error fetching student list:", error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;
