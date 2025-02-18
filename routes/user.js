require('dotenv').config();
const express = require('express');
const db = require('../utils/database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const user = req.body;
    // Minimal backend validation
    if (!user.email || !user.password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    try {
        // Check if the email already exists in the database
        let query = "SELECT email FROM user WHERE email = ?";
        let [result] = await db.execute(query, [user.email]);
        if (result.length <= 0) {
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            // Insert the new user into the database
            query = "INSERT INTO user (name, contactnumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
            ans = await db.execute(query, [user.name, user.contactNumber, user.email, hashedPassword]);
            return res.status(201).json({ success: true, message: "User Registered Successfully.." });
        } else {
            return res.status(400).json({ success: false, message: "Email Already Exists." });
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Minimal backend validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    try {
        // Check if the email exists in the database
        let query = "SELECT * FROM user WHERE email = ?";
        let [result] = await db.execute(query, [email]);

        if (result.length === 0) {
            return res.status(401).json({ success: false, message: "Incorrect Email and Password." });
        }

        // Compare the password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, result[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Incorrect Email and Password." });
        }

        // Optionally, create a JWT token for the user to manage sessions
        const token = jwt.sign({ name: result[0].name, email: result[0].email, role: result[0].role }, process.env.JWT_SECRET, { expiresIn: '8h' });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token: token
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



module.exports = router;