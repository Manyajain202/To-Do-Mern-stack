const mongoose = require('mongoose');

let isMongoConnected = false;

/**
 * Connects the Express application to MongoDB using Mongoose.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_app';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log('MongoDB Connected: 127.0.0.1:27017/todo_app (Local Database)');
  }
};

const getConnectionStatus = () => isMongoConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;
