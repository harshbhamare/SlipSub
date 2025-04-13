const express = require("express");
const jwt = require("jsonwebtoken"); 
const router = express.Router();

router.get("/", function(req, res){
        res.cookie("token", "");
        res.redirect("/")
})

module.exports = router;