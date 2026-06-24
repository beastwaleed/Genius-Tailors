const mongoose = require('mongoose');

// This global variable will hold our cached connection state across serverless invocations
let isConnected = false;

const connectDB = async () => {
  // If we already have an active connection, reuse it instead of creating a new one
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    console.log('Creating new MongoDB connection...');
    
    // Connect to MongoDB using the connection string in your .env file
    const db = await mongoose.connect(process.env.MONGO_URI);
    
    // Check if the connection state is 'connected' (a readyState of 1 means connected)
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
    // In a serverless environment, we throw the error so the function can retry, 
    // rather than killing the whole process with process.exit()
    throw error;
  }
};

module.exports = connectDB;