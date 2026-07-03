require("dotenv").config({
    path: "../.env"
});

const sendOTPEmail = require("./emailService");

(async () => {
    try {
        await sendOTPEmail(
            "nikamparth06@gmail.com",
            "123456"
        );

        console.log("Done");
    } catch (err) {
        console.error(err);
    }
})();