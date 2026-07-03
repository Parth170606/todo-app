const pool = require("../db");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const generateOTP = require("../utils/otpGenerator");
const sendOTPEmail = require("../services/emailService");
const validatePassword = require("../utils/passwordValidator");

// POST /auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        if (!validatePassword(password)) {

    return res.status(400).json({

        success: false,

        message:
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."

    });

}

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const result = await pool.query(
            `INSERT INTO users(name, email, password)
             VALUES($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};

module.exports = {
    register
};

// POST /auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        if(user.otp_last_sent){

    const diff =
    Date.now() -
    new Date(user.otp_last_sent);

    if(diff < 60000){

        return res.status(429).json({

            success:false,

            message:
            "Please wait before requesting another OTP."

        });

    }

}

        const otp = generateOTP();

        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            `UPDATE users
             SET otp = $1,
                 otp_expiry = $2
             WHERE email = $3`,
            [otp, expiry, email]
        );

        await sendOTPEmail(email, otp);

        res.json({
            success: true,
            message: "OTP sent successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });

    }

};


const verifyOTP = async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        const result = await pool.query(
            `SELECT otp, otp_expiry
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        if (!user.otp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new OTP."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });
        }

        res.json({
            success: true,
            message: "OTP verified successfully."
        });

        await pool.query(

`UPDATE users
 SET otp_verified = TRUE
 WHERE email = $1`,

[email]

);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

const resetPassword = async (req, res) => {

    try {

        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required."
            });
        }

        if (!validatePassword(newPassword)) {

    return res.status(400).json({

        success: false,

        message:
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."

    });

}

        const result = await pool.query(
            `SELECT otp, otp_expiry
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password = $1,
                 otp = NULL,
                 otp_expiry = NULL
             WHERE email = $2`,
            [hashedPassword, email]
        );

        res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


module.exports = {
    register,
    login,
    forgotPassword,
    verifyOTP,
    resetPassword
};