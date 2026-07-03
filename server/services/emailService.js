const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {

    try {

        const mailOptions = {

            from: process.env.EMAIL_USER,

            to: email,

            subject: "Reset Your Todo App Password",

            html: `
                <h2>Password Reset Request</h2>

                <p>Your OTP is:</p>

                <h1 style="color:blue;">${otp}</h1>

                <p>This OTP expires in <b>10 minutes</b>.</p>

                <p>If you didn't request this password reset,
                please ignore this email.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email Sent!");
        console.log(info.response);

    } catch (error) {

        console.error(error);

        throw error;

    }

};

module.exports = sendOTPEmail;