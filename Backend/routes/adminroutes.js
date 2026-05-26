const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email); // Terminal mein check karne ke liye

        // 1. Database mein admin dhoondein
        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log("Admin not found in DB");
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        // 2. Password Compare karein
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("Password match status:", isMatch);

        if (isMatch) {
            const token = jwt.sign(
                { id: admin._id, role: 'admin' },
                process.env.JWT_SECRET || 'CivicShieldSecretKey786',
                { expiresIn: '1h' }
            );

            return res.json({
                success: true,
                token,
                message: "Login Successful!"
            });
        } else {
            // Backup check: Agar DB wala match na ho toh .env se check karein
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                console.log("Login successful via .env backup");
                return res.json({
                    success: true,
                    token: "env-backup-token",
                    message: "Login Successful via backup!"
                });
            }
            
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;