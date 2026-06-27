require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const insightRoutes = require('./routes/insights');
const trainerRoutes = require('./routes/trainer');
const coachRoutes = require('./routes/coach');
const challengeRoutes = require('./routes/challenges');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/challenges', challengeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 TimeLens server running on port ${PORT}`);
});

// Friendly message when the port is already taken (the #1 nodemon crash cause).
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use — another server instance is probably running.`);
    console.error(`   Fix: lsof -ti:${PORT} | xargs kill   (then restart)\n`);
    process.exit(1);
  }
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Surface the real stack on any otherwise-silent crash instead of just exiting.
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});

module.exports = app;
