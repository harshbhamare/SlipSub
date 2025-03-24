const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
require('dotenv').config();

const instituteModel = require("../models/institute")

router.get("/", function(req, res){
    res.render("institute-login")
})

router.post("/", async function(req, res){
    let { email, password } = req.body;

    try {
        let institute = await instituteModel.findOne({ email });

        if (!institute) return res.status(404).send("Institute not found");

        bcrypt.compare(password, institute.password, function(err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal Server Error");
            }

            if (result) {
                let token = jwt.sign({ email: email, instituteid: institute._id }, "process.env.INSTITUTE", { expiresIn: "24hr" });

                res.cookie("token", token);

                return res.status(200).redirect("institute-dashboard");
            } 
            
            return res.status(401).send("Invalid password");
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;