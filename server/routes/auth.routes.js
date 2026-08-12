const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // 1. Check that all fields are provided
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Check that password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // 3 & 4. Validate email and check whether the email already exists
        const userExists = await User.findOne({ email });

        // 5. If email already exists, return HTTP 400
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 6. Hash the password using bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 9. & 10. Create user (role defaults to "user", confirmPassword is not stored, plain-text password is not stored)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 11. Return a success response
        if (user) {
            res.status(201).json({
                success: true,
                message: "Registration successful"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid user data"
            });
        }
    } catch (error) {
        // Server/database error
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;
