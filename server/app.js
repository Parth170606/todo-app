const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const pool = require("./db");

// Routes
const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// =======================
// Middleware
// =======================

// During development
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://your-vercel-app.vercel.app"
    ],
    credentials: true
}));

// Parse JSON requests
app.use(express.json());

// =======================
// Routes
// =======================

// Home Route
app.get("/", (req, res) => {
    res.send("Todo API is running 🚀");
});

// Database Test Route
app.get("/test-db", async (req, res) => {
    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            serverTime: result.rows[0].now
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });

    }
});

// Authentication Routes
app.use("/auth", authRoutes);

// Todo Routes
app.use("/todos", todoRoutes);

// =======================
// 404 Handler
// =======================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// =======================
// Global Error Handler
// =======================

app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

});

// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});