const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ==========================================
// 🧪 1. TEST ROUTE
// ==========================================
router.get('/', (req, res) => {
    res.send("Auth route is working!");
});

// ==========================================
// 📝 2. REGISTER ROUTE
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.json({
            message: "User saved in MongoDB successfully",
            user: newUser
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 🔑 3. LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // Dashboard aur dynamic UI ke liye complete user object return kar rahe hain
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 🚪 4. LOGOUT ROUTE (ADD THIS NOW)
// ==========================================
router.post('/logout', (req, res) => {
    try {
        // Agar aap future mein HTTP-Only cookies use karein toh ye line cookie wipe kar degi
        res.clearCookie('token'); 
        res.clearCookie('adminToken');

        // Frontend ko clear success response bhejein
        res.status(200).json({ 
            success: true, 
            message: "Backend session terminated completely. Logged out!" 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;