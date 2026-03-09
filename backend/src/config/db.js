/**
 * MongoDB connection using Mongoose.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment');
  await mongoose.connect(uri);
};

module.exports = connectDB;
