// /services/mailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();
const templates = require('./emailTemplates');

// Setup transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify transporter once at startup
transporter.verify((err, success) => {
    if (err) console.error("Transporter Error:", err);
    else console.log("Mail transporter ready ✅");
});

// Email functions using templates

const sendRegistrationEmail = async (to, name) => {
    const mailOptions = {
        from: `"Your Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎉 Welcome to Our Platform!",
        html: templates.registrationTemplate(name),
    };
    return transporter.sendMail(mailOptions);
};

const sendApprovalEmail = async (to, name) => {
    const mailOptions = {
        from: `"Your Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: "✅ Account Approved!",
        html: templates.approvalTemplate(name),
    };
    return transporter.sendMail(mailOptions);
};

const sendStatusUpdateEmail = async (to, name, status) => {
    const mailOptions = {
        from: `"Your Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: "ℹ️ Status Updated",
        html: templates.statusUpdateTemplate(name, status),
    };
    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendRegistrationEmail,
    sendApprovalEmail,
    sendStatusUpdateEmail,
};
