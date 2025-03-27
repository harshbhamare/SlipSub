const registrationTemplate = (name) => `
    <h2>Welcome ${name}!</h2>
    <p>Thank you for registering on our platform.</p>
    <p>We will notify you once your account is approved.</p>
    <p>Best Regards,<br/>Your Team</p>
`;

const approvalTemplate = (name) => `
    <h2>Hi ${name},</h2>
    <p>🎉 Congratulations! Your account is now approved.</p>
    <p>You can now login and start using the platform.</p>
    <p>Cheers,<br/>Your Team</p>
`;

const statusUpdateTemplate = (name, status) => `
    <h2>Hello ${name},</h2>
    <p>Your current application status has been updated to: <strong>${status}</strong>.</p>
    <p>Log in to your dashboard to see more details.</p>
    <p>Regards,<br/>Your Team</p>
`;

module.exports = {
    registrationTemplate,
    approvalTemplate,
    statusUpdateTemplate,
};
