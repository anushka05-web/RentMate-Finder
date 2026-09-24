const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { initChatSocket } = require('./socket/chatSocket');
const User = require('./models/User');

// Initialize database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/interests', require('./routes/interestRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to RentMate Finder India API',
  });
});

// Error handling middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket Chat Server
initChatSocket(server);

// Seed Admin account on start if it doesn't exist
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@rentmate.in';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'adminpassword', // Will be hashed in User pre-save hook
        role: 'admin',
        phone: '9876543210',
      });
      console.log('✓ Default Admin account seeded: admin@rentmate.in / adminpassword');
    }
  } catch (err) {
    console.error('⚠️ Admin seeding error:', err.message);
  }
};

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedAdmin();
});
