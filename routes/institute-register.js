const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

const instituteModel = require("../models/institute")

router.get("/", async function(req, res){
    const institutes = await instituteModel.find(); 
    // console.log(institutes)
    res.render("institute-register", { institutes });
})

// working properly
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
        let token = jwt.sign({email: email, instituteid: newInstitute._id}, "prem")
            res.cookie("token", token)
            // res.redirect("/profile")

        res.send("Institute created successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;