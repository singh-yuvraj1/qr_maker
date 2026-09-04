const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed (SIGINT).');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed (SIGTERM).');
  process.exit(0);
});

module.exports = connectDB;
