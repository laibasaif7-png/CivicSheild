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
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI is not defined. Please add it to Backend/.env.');
  process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message || err);
    console.error('   Hint: check network connectivity, Atlas IP access list, and MONGO_URI settings.');
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime connection error:', err.message || err);
});

app.get('/', (req, res) => {
    res.send('CivicShield Backend is Running!');
});

module.exports = app;