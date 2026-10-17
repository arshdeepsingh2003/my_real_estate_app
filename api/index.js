import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import User from './models/user.model.js';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
let databaseConnection;

app.use(express.json());

app.use(cookieParser());

const ensureUserIndexes = async () => {
  const indexes = [
    { field: 'username' },
    { field: 'email' },
    { field: 'clerkId' },
  ];

  const duplicateTrimmedUsername = await User.aggregate([
    { $match: { username: { $type: 'string' } } },
    { $project: { normalized: { $trim: { input: '$username' } } } },
    { $group: { _id: '$normalized', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]);
  if (duplicateTrimmedUsername.length) {
    throw new Error('Cannot enforce unique username values: duplicate records exist after trimming. Resolve duplicates safely, then restart.');
  }

  for (const { field } of indexes) {
    const matches = field === 'clerkId'
      ? { clerkId: { $exists: true } }
      : { [field]: { $exists: true, $ne: null } };
    const duplicate = await User.aggregate([
      { $match: matches },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ]);
    if (duplicate.length) {
      throw new Error(`Cannot enforce unique ${field} values: duplicate records exist. Resolve duplicates safely, then restart.`);
    }
  }

  await User.collection.createIndex({ username: 1 }, { unique: true });
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ clerkId: 1 }, { unique: true, sparse: true });
};

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1 && !databaseConnection) return;
  if (mongoose.connection.readyState === 0) databaseConnection = null;
  if (!process.env.MONGO) throw new Error('Missing required MONGO environment variable.');

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(process.env.MONGO, { autoIndex: false })
      .then(async () => {
        await ensureUserIndexes();
        console.log('Connected to MongoDB and verified unique user indexes.');
      })
      .catch((error) => {
        databaseConnection = null;
        throw error;
      });
  }

  await databaseConnection;
};

app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

app.use((err, req, res, next) => {
  const isSafeClientError = err.isOperational === true && err.statusCode >= 400 && err.statusCode < 500;
  const statusCode = isSafeClientError ? err.statusCode : 500;
  const message = isSafeClientError ? err.message : 'Something went wrong. Please try again later.';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;
