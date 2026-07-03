const BASE_URL = "http://localhost:5000";

function showSection(section) {

    const sections = [
        "register",
        "login",
        "forgot",
        "verify",
        "reset",
        "dashboard"
    ];

    sections.forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    document.getElementById(section).style.display = "block";

}

function showMessage(msg) {
    document.getElementById("message").innerText = msg;
}

async function register() {

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch(`${BASE_URL}/auth/register`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            email,
            password
        })

    });

    const data = await response.json();

    showMessage(data.message);

}

async function login() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(`${BASE_URL}/auth/login`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            password
        })

    });

    const data = await response.json();

    if (data.token) {

        localStorage.setItem("token", data.token);

        showSection("dashboard");

        showMessage("Login Successful");

    } else {

        showMessage(data.message);

    }

}

async function forgotPassword() {

    const email = document.getElementById("forgotEmail").value;

    localStorage.setItem("resetEmail", email);

    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email
        })

    });

    const data = await response.json();

    showMessage(data.message);

}

async function verifyOTP() {

    const otp = document.getElementById("otp").value;

    const email = localStorage.getItem("resetEmail");

    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            otp
        })

    });

    const data = await response.json();

    if (data.success) {

        localStorage.setItem("otp", otp);

    }

    showMessage(data.message);

}

async function resetPassword() {

    const email = localStorage.getItem("resetEmail");

    const otp = localStorage.getItem("otp");

    const newPassword = document.getElementById("newPassword").value;

    const response = await fetch(`${BASE_URL}/auth/reset-password`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            otp,
            newPassword
        })

    });

    const data = await response.json();

    showMessage(data.message);

    if (data.success) {

        localStorage.removeItem("otp");
        localStorage.removeItem("resetEmail");

        showSection("login");

    }

}

function logout() {

    localStorage.removeItem("token");

    showSection("login");

    showMessage("Logged Out");

}