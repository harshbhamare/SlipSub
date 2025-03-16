const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Hod = require("../models/hod"); 
const Institute = require("../models/institute");

router.get("/", async (req, res) => {
    try {
        res.render("hod-login");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

router.post("/", async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const hod = await Hod.findOne({ email }).lean();

        if (!hod) {
            return res.status(404).json({ error: "HOD not found in this institute" });
        }

        const match = await bcrypt.compare(password, hod.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid password" });
        }

        let token = jwt.sign({ email, hodid: hod._id }, "mh123", { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, secure: true });

        return res.redirect("/hod-dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});


module.exports = router;
