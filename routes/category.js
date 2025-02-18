require('dotenv').config();
const express = require('express');
const db = require('../utils/database')
const auth = require('../controllers/auth')

const router = express.Router();

router.post('/addCategory', async (req, res, next) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: "Name and Description are required." });
    }

    try {
        // Check if the category name already exists
        let checkQuery = "SELECT * FROM category WHERE name = ?";
        let [existingCategory] = await db.execute(checkQuery, [name]);

        if (existingCategory.length > 0) {
            return res.status(400).json({ message: "Category name already exists." });
        }

        // Insert the new category
        const insertQuery = "INSERT INTO category (name, description) VALUES (?, ?)";
        await db.execute(insertQuery, [name, description]);

        return res.status(201).json({ message: "Category added successfully." });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// Get all categories
router.get('/getCategory', async (req, res, next) => {
    try {
        const query = "SELECT * FROM category ORDER BY name";
        const [categories] = await db.execute(query);

        return res.status(200).json(categories);

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

router.patch('/updateCategory', async (req, res, next) => {
    const { id, name, description } = req.body;

    // Basic validation for input fields
    if (!id || !name || !description) {
        return res.status(400).json({ message: "Category id, name, and description are required." });
    }

    try {
        // Check if the category exists
        const checkQuery = "SELECT * FROM category WHERE id = ?";
        const [existingCategory] = await db.execute(checkQuery, [id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category id not found." });
        }

        // Update the category
        const updateQuery = "UPDATE category SET name = ?, description = ? WHERE id = ?";
        const [updateResult] = await db.execute(updateQuery, [name, description, id]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Category id not found." });
        }

        return res.status(200).json({ message: "Category updated successfully." });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

module.exports = router;
