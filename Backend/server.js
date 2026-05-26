require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth'); 
const reportRoutes = require('./routes/reportroutes');
const adminRoutes = require('./routes/adminroutes');

const app = express();

// Updated CORS Configuration
app.use(cors({
  origin: "*", // Jab aapko apni Vercel site ka URL pata chal jaye, toh yahan "*" ki jagah wo link daal dein
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ Connection Error:", err));

app.get('/', (req, res) => {
    res.send('CivicShield Backend is Running!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

module.exports = app;