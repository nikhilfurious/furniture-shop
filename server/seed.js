// seed.js - Script for seeding initial data
const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample data
const products = [

  {
    name: "Patio Lounge Chair",
    basePrice: 350,
    images: [
      "https://example.com/images/patio-chair-1.jpg",
      "https://example.com/images/patio-chair-2.jpg"
    ],
    category: "Outdoor Furniture",
    description: "A comfortable and stylish patio lounge chair perfect for relaxing outdoors.",
    refundableDeposit: 100,
    operationType: "Manual",
    loadType: "N/A",
    brand: "OutdoorLux",
    dimensions: "80cm x 90cm x 70cm",
    color: "Gray",
    tenureOptions: [
      { months: "3", price: 120 },
      { months: "6", price: 200 }
    ],
    isActive: true,
    location: ["Los Angeles", "San Diego"]
  },
  {
    name: "Modular Outdoor Storage Box",
    basePrice: 150,
    images: [
      "https://example.com/images/storage-box-1.jpg",
      "https://example.com/images/storage-box-2.jpg"
    ],
    category: "Storage and Organizations",
    description: "Keep your outdoor space organized with this versatile modular storage box.",
    refundableDeposit: 50,
    operationType: "Manual",
    loadType: "N/A",
    brand: "StoragePro",
    dimensions: "100cm x 60cm x 50cm",
    color: "Brown",
    tenureOptions: [
      { months: "3", price: 50 },
      { months: "6", price: 90 }
    ],
    isActive: true,
    location: ["New York", "Chicago"]
  }
]



// Seed database
const seedDatabase = async () => {
  try {
    await connectDB();
    
    
    for (const product of products) {
      try {
        await Product.create(product);
        console.log(`Seeded product: ${product.name}`);
      } catch (err) {
        console.error(`Error seeding product ${product.name}:`, err.message);
      }
    }
    
    console.log('Data seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();