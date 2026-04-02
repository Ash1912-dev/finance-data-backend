const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const connectDB = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.error(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      retries += 1;
      console.error(`DB connection attempt ${retries}/${MAX_RETRIES} failed: ${err.message}`);

      if (retries >= MAX_RETRIES) {
        console.error('Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }

      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }
};

mongoose.connection.on('disconnected', () => console.error('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

module.exports = connectDB;
