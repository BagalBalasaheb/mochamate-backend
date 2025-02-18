const express = require('express');
const db = require('../utils/database')

const router = express.Router();

router.get('/details', async (req, res, next) => {
    try {
        // Query to get the category count
        const categoryQuery = "SELECT COUNT(id) AS categoryCount FROM category";
        const [categoryResult] = await db.execute(categoryQuery);
        const categoryCount = categoryResult[0].categoryCount;

        // Query to get the product count
        const productQuery = "SELECT COUNT(id) AS productCount FROM product";
        const [productResult] = await db.execute(productQuery);
        const productCount = productResult[0].productCount;

        // Query to get the bill count
        const billQuery = "SELECT COUNT(id) AS billCount FROM bill";  // Fixed query: from 'bill' instead of 'product'
        const [billResult] = await db.execute(billQuery);
        const billCount = billResult[0].billCount;

        // Return the counts as a JSON response
        return res.status(200).json({
            categoryCount,
            productCount,
            billCount
        });
    } catch (err) {
        console.error('Error:', err); // Log the error
        return res.status(500).json(err);
    }
});


module.exports = router;