const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/authRoutes");
const authLimiter =require("./middleware/rateLimiter");

dotenv.config();

const app = express();
app.use(authLimiter);

app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);

const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "../client")));

// Test route
app.get("/", (req, res) => {
    res.send("Todo API is running 🚀");
});

app.use("/todos", todoRoutes);
app.use("/auth", authRoutes);

// Database test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      serverTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database Error:", error);

    res.status(500).json({
        success: false,
        message: error.message,
    });
}
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const createTodo = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const result = await pool.query(
            `INSERT INTO todos (title)
             VALUES ($1)
             RETURNING *`,
            [title]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create todo"
        });
    }
};