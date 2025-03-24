const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const instituteModel = require("../models/institute")
require('dotenv').config();

router.get("/", async function(req, res){
    const institutes = await instituteModel.find(); 
    res.render("institute-register", { institutes });
})

router.post("/", async function (req, res) {
    let { iname, email, password, code } = req.body;

    try {
        let institute = await instituteModel.findOne({ email, code });
        if (institute) return res.status(400).send("institute already exists.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newInstitute = await instituteModel.create({
            iname,
            code,
            email,
            password: hashedPassword,
        });
        let token = jwt.sign({email: email, instituteid: newInstitute._id}, "process.env.INSTITUTE")
            res.cookie("token", token)

        res.send("Institute created successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;