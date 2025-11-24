const mongoose = require('mongoose');

const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost/blockchain_voting';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB);
    console.log('✅ MongoDB connected successfully.');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.Promise = global.Promise;
module.exports = { mongoose, connectDB };
