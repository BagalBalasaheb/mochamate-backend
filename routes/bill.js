require('dotenv').config();
const express = require('express');
const db = require('../utils/database');
const auth = require('../controllers/auth');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
let pdf = require('html-pdf');

const router = express.Router();

router.post('/generateBill', async (req, res) => {
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    const productDetailsReport = JSON.parse(orderDetails.productDetails);

    const query = "INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        // Insert the bill details into the database
        const [result] = await db.execute(query, [orderDetails.name, generateUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.total, orderDetails.productDetails, res.locals.email]);

        // Render the EJS template for the report
        const reportPath = path.join(__dirname, '..', 'data', 'report.ejs'); // Adjust as necessary
        const data = await ejs.renderFile(reportPath, {
            bill: {
                productDetails: productDetailsReport,
                uuid: generateUuid,
                name: orderDetails.name,
                email: orderDetails.email,
                contactNumber: orderDetails.contactNumber,
                paymentMethod: orderDetails.paymentMethod,
                total: orderDetails.total
            }
        });

        // Generate the PDF file from the rendered HTML
        const pdfFilePath = path.join(__dirname, '..', 'generated_pdf', generateUuid + '.pdf');
        const pdfData = await new Promise((resolve, reject) => {
            pdf.create(data).toFile(pdfFilePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        // Return the generated UUID as a response
        return res.status(200).json({ uuid: generateUuid });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ message: 'Error generating report', error: err.message });
    }
});

router.post('/getPdf', auth.authenticateToken, async (req, res) => {
    const orderDetails = req.body;
    const pdfPath = path.join(__dirname, '..', 'generated_pdf', orderDetails.uuid + '.pdf'); // Correct path handling

    if (fs.existsSync(pdfPath)) { // Fixed typo
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res); // Fixed typo
    } else {
        const productDetailsReport = JSON.parse(orderDetails.productDetails);
        const reportPath = path.join(__dirname, '..', 'data', 'report.ejs'); // Adjust as necessary
        const data = await ejs.renderFile(reportPath, {
            bill: {
                productDetails: productDetailsReport,
                uuid: orderDetails.uuid, // Use orderDetails.uuid here
                name: orderDetails.name,
                email: orderDetails.email,
                contactNumber: orderDetails.contactNumber,
                paymentMethod: orderDetails.paymentMethod,
                total: orderDetails.total
            }
        });

        // Generate the PDF file from the rendered HTML
        const pdfFilePath = path.join(__dirname, '..', 'generated_pdf', orderDetails.uuid + '.pdf');
        const pdfData = await new Promise((resolve, reject) => {
            pdf.create(data).toFile(pdfFilePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        // Return the generated PDF file as a response
        res.contentType("application/pdf");
        fs.createReadStream(pdfFilePath).pipe(res); // Use the correct file path
    }
});

router.get('/getBills', async (req, res, next) => {
    const query = "SELECT * FROM bill ORDER BY id DESC"; // SQL query

    try {
        // Assuming db.execute returns a promise
        const [result] = await db.execute(query); // Execute the query with await

        return res.status(200).json(result); // Return the result if successful
    } catch (err) {
        console.error('Error:', err); // Log the error
        return res.status(500).json(err); // Return the error message
    }
});

router.delete('/deleteBill/:id', async (req, res, next) => {
    const id = req.params.id

    // SQL query to delete the bill by its ID
    const query = "DELETE FROM bill WHERE id = ?";

    try {
        // Execute the delete query with await
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            // If no rows were affected, return a 404 error
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Return a success message if the bill was deleted
        return res.status(200).json({ message: 'Bill deleted successfully' });
    } catch (err) {
        console.error('Error:', err); // Log the error
        return res.status(500).json({ message: 'Database error', error: err.message }); // Return the error message
    }
});



module.exports = router;