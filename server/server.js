require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 QRSpark Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  MongoDB: Connected`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1); // Do not silently continue without DB
  });
