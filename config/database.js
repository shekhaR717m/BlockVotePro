//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = 'mongodb://localhost/blockchain_voting';

const connectDB = async () => {
  try {
    // Mongoose.connect no longer needs the deprecated options
    await mongoose.connect(mongoDB);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

mongoose.Promise = global.Promise;
module.exports = { mongoose, connectDB };