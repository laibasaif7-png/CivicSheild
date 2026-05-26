const express = require('express');
const router = express.Router();

// ✅ FIXED PATH: Folder 'models' hai aur file 'Report.js' hai
const Report = require('../models/Report');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// 🟢 1. GET ALL REPORTS (http://localhost:5000/api/reports/all)
router.get('/all', async (req, res) => {
  try {
    console.log("📡 Fetching records from CivicShield MongoDB...");
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports); // Yeh data frontend ko array format [] mein bhejega
  } catch (err) {
    console.error("❌ GET Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔌 2. ADD NEW REPORT (Form submission ke liye)
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, category } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields: title or description' });
    }

    let imageUrl = '';

    if (req.file && req.file.buffer) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult?.secure_url || uploadResult?.url || '';
    }

    const newReport = new Report({
      title,
      description,
      location,
      category: category || 'Other',
      imageUrl,
      status: 'Pending'
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (err) {
    console.error("❌ POST Error:", err?.message || err, err);
    res.status(500).json({ error: err?.message || 'Server error' });
  }
});

// 🟡 3. UPDATE STATUS (Pure Endpoint jo App.jsx mein action trigger karta hai)
router.put('/:id/resolve', async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status: '✅ Resolved' },
      { new: true }
    );
    if (!updatedReport) return res.status(404).json({ error: "Report ID not found!" });
    res.status(200).json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compatibility alias for older frontend usage
router.put('/resolve-pure/:id', async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status: '✅ Resolved' },
      { new: true }
    );
    if (!updatedReport) return res.status(404).json({ error: "Report ID not found!" });
    res.status(200).json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 4. DELETE REPORT (Database se report delete karne ke liye)
router.delete('/:id', async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ error: "Report not found!" });
    res.status(200).json({ message: "Dropped permanently from MongoDB" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;