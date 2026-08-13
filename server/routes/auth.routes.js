const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // 5. Return success with token and user info
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;
