const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const studentModel = require("../models/student");
const divisionModel = require("../models/division");

router.use(cookieParser());

router.get("/years/:divisionId/student-list", async function (req, res) {
    try {
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

        if (!students.length) return res.status(404).send("No students found");

        const division = await divisionModel.findById(divisionId).lean();

        if (!division) return res.status(404).send("Division not found");

        res.render("student-list", { students, divisionName: division.divisionName });

    } catch (error) {
        console.error("Error fetching student list:", error);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;
