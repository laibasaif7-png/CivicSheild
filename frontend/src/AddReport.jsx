import React, { useState } from 'react';
import api from './api';

const AddReport = () => {
  // 1. Saare inputs ke liye states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. FormData ka "Box" banana (Images ke liye zaroori hai)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('image', image); // Backend mein 'image' hi likha hona chahiye

    try {
      // 3. Backend ko request bhejna
      const res = await api.post('/api/reports/add', formData);
      
      console.log("Response:", res.data);
      alert("✅ Report successfully submitted to Cloudinary and MongoDB!");
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Upload failed. Terminal check karein.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Submit a Report</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="What is the issue?" 
          style={inputStyle}
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Describe the problem..." 
          style={inputStyle}
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Your Location" 
          style={inputStyle}
          onChange={(e) => setLocation(e.target.value)} 
          required 
        />
        <label>Upload Evidence (Photo):</label>
        <input 
          type="file" 
          style={inputStyle}
          onChange={(e) => setImage(e.target.files[0])} 
          required 
        />
        <button type="submit" style={buttonStyle}>Send Report</button>
      </form>
    </div>
  );
};

// Simple Styles
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', display: 'block' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' };

export default AddReport;