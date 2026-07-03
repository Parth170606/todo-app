const sendOTPEmail = async (email, otp) => {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.SENDER_NAME,
                    email: process.env.SENDER_EMAIL
                },
                to: [
                    {
                        email: email
                    }
                ],
                subject: "Reset Your TodoFlow Password",
                htmlContent: `
                    <h2>Password Reset Request</h2>

                    <p>Your OTP is:</p>

                    <h1 style="color:#6C63FF;">${otp}</h1>

                    <p>This OTP expires in <strong>10 minutes</strong>.</p>

                    <p>If you didn't request this password reset, please ignore this email.</p>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Brevo Error:", data);
            throw new Error(data.message || "Failed to send email.");
        }

        console.log("OTP email sent successfully.");
        console.log(data);

    } catch (error) {
        console.error("Email Service Error:", error);
        throw error;
    }
};

module.exports = sendOTPEmail;