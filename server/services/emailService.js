const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset Your TodoFlow Password",
        html: `
            <h2>Password Reset Request</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 10 minutes.</p>
        `
    });

    console.log(info.messageId);
};

module.exports = sendOTPEmail;