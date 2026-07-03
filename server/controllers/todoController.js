const pool = require("../db");

// GET /todos
const getTodos = async (req, res) => {
    try {
       const userId = req.user.id;

    const result = await pool.query(
    `SELECT *
     FROM todos
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch todos"
        });
    }
};

// POST /todos
const createTodo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const result = await pool.query(
            `INSERT INTO todos (title, user_id)
             VALUES ($1, $2)
             RETURNING *`,
            [title, userId]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create todo"
        });
    }
};

// PUT /todos/:id
const updateTodo = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.params);

        const { id } = req.params;
        const { completed } = req.body;

        const userId = req.user.id;

    const result = await pool.query(
    `UPDATE todos
     SET completed = $1
     WHERE id = $2
     AND user_id = $3
     RETURNING *`,
    [completed, id, userId]
);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update todo"
        });
    }
};

// DELETE /todos/:id
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

    const result = await pool.query(
    `DELETE FROM todos
     WHERE id = $1
     AND user_id = $2
     RETURNING *`,
    [id, userId]
);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        res.json({
            message: "Todo deleted successfully",
            todo: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete todo"
        });
    }
};

module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
};