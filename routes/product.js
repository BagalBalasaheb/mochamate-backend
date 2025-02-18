require('dotenv').config();
const express = require('express');
const db = require('../utils/database')
const auth = require('../controllers/auth')

const router = express.Router();
router.post('/addProduct', async (req, res, next) => {
    const { name, price, categoryId, description } = req.body;  // Removed `status` from req.body to use default 'true'

    try {
        const insertQuery = "INSERT INTO product (name, price, categoryId, description, status) VALUES (?, ?, ?, ?, 'true')";
        await db.execute(insertQuery, [name, price, categoryId, description]);

        return res.status(201).json({ message: "Product added successfully." });

    } catch (err) {
        console.error("Error in addProduct:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// Get All Products with Category Name
router.get('/getProduct', async (req, res, next) => {
    try {
        const query = `
            SELECT p.id, p.name, p.price, p.description, p.status, c.id AS categoryId,
                   c.name AS categoryName 
            FROM product AS p 
            INNER JOIN category AS c ON p.categoryId = c.id
        `;

        const [products] = await db.execute(query);
        return res.status(200).json(products);

    } catch (err) {
        console.error("Error in getProduct:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// Get Products by Category ID
router.get('/getByCategoryId/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const query = "SELECT * FROM product WHERE categoryId = ? AND status = 'true'";  // Fixed missing quote
        const [products] = await db.execute(query, [id]);  // Pass `id` as a parameter

        return res.status(200).json(products);

    } catch (err) {
        console.error("Error in getByCategoryId:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

router.get('/getByProductId/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const query = "SELECT * FROM product WHERE id = ?";
        const [products] = await db.execute(query, [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(products[0]);

    } catch (err) {
        console.error("Error in getByProductId:", err);  // ✅ Fixed: Correct error message
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

router.patch('/updateProduct', async (req, res, next) => {
    const { id, name, price, categoryId, description } = req.body;  // Added `id`

    if (!id || !name || !price || !categoryId || !description) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {
        const updateQuery = "UPDATE product SET name = ?, price = ?, categoryId = ?, description = ? WHERE id = ?";
        const [updateResult] = await db.execute(updateQuery, [name, price, categoryId, description, id]);  // Added `id` to the parameters

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        return res.status(200).json({ message: "Product updated successfully." });

    } catch (err) {
        console.error("Error in updateProduct:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

router.delete('/deleteByProductId/:id', async (req, res, next) => {
    const { id } = req.params;  // Extract `id` from URL parameters

    if (!id) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    try {
        const deleteQuery = "DELETE FROM product WHERE id = ?";
        const [deleteResult] = await db.execute(deleteQuery, [id]);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        return res.status(200).json({ message: "Product deleted successfully." });

    } catch (err) {
        console.error("Error in deleteByProductId:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});


module.exports = router;
