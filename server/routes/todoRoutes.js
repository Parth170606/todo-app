const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

const {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
} = require("../controllers/todoController");

router.get("/", authenticateToken, getTodos);

router.post("/", authenticateToken, createTodo);

router.put("/:id", authenticateToken, updateTodo);

router.delete("/:id", authenticateToken, deleteTodo);

module.exports = router;