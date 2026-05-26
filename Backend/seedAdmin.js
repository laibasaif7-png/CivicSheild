require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); // Make sure path is correct

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB for seeding..."))
  .catch(err => console.log(err));

const seed = async () => {
  try {
    // Purane admins clear karne ke liye (Optional)
    await Admin.deleteMany({}); 

    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await Admin.create({
      email: "admin@civicshield.com",
      password: hashedPassword
    });

    console.log("✅ Admin Seeded Successfully!");
    console.log("Email: admin@civicshield.com");
    console.log("Password: admin123");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};
