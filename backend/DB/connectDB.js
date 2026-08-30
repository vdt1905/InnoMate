import mongoose from 'mongoose';

const RETRY_DELAY_MS = 5000;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Keep the process alive so the API still answers (with errors) instead of
    // refusing connections outright, and keep trying in the background.
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(`Retrying in ${RETRY_DELAY_MS / 1000}s — database routes will fail until it connects.`);
    setTimeout(connectDB, RETRY_DELAY_MS).unref?.();
    return null;
  }
};
