import { clerkClient, verifyToken as clerkVerifyToken } from '@clerk/express';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';

export const verifyClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const verified = await clerkVerifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!verified.sub) {
      return next(errorHandler(403, 'Forbidden'));
    }

    req.clerkId = verified.sub;
    next();
  } catch (error) {
    console.error('Error verifying Clerk token:', error);
    return next(errorHandler(403, 'Forbidden'));
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    // Verify Clerk Token
    const verified = await clerkVerifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkId = verified.sub;
    if (!clerkId) {
      return next(errorHandler(403, 'Forbidden'));
    }

    // Find the MongoDB user corresponding to this Clerk ID
    let mongoUser = await User.findOne({ clerkId });
    
    // If not found, try to locate by email to link existing user
    if (!mongoUser) {
      // In some Clerk JWT payloads, email is present as verified.email, but we can also fetch it
      const email = verified.email || (await clerkClient.users.getUser(clerkId)).emailAddresses[0]?.emailAddress;
      if (email) {
        mongoUser = await User.findOne({ email });
        if (mongoUser) {
          mongoUser.clerkId = clerkId;
          await mongoUser.save();
        }
      }
    }

    if (!mongoUser) {
      return next(errorHandler(401, 'User sync required'));
    }

    // Attach user information to request
    req.user = {
      id: mongoUser._id.toString(),
      clerkId: mongoUser.clerkId,
      username: mongoUser.username,
      email: mongoUser.email,
    };

    next();
  } catch (error) {
    console.error('Error in verifyToken:', error);
    return next(errorHandler(403, 'Forbidden'));
  }
};