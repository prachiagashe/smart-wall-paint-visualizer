const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Color = require('./models/Color');

const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedEcommerceData = async () => {
  await connectDB();
  
  try {
    const colors = await Color.find({});
    console.log(`Found ${colors.length} colors to update...`);
    
    let updatedCount = 0;
    for (const color of colors) {
      if (!color.pricePerUnit) {
        color.pricePerUnit = 250;
        color.unit = 'Swatch';
        color.stock = 100;
        color.isAvailable = true;
        color.colorCode = `L${Math.floor(100 + Math.random() * 900)}`;
        await color.save();
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} colors with e-commerce fields.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedEcommerceData();
