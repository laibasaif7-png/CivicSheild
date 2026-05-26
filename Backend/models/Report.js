const mongoose = require('mongoose'); // ✅ Yeh line zaroori hai

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Roads', 'Electricity', 'Water', 'Safety', 'Other'], 
    default: 'Other' 
  },
  imageUrl: { type: String },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);