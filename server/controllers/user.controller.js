import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.models.js';
import { clerkClient } from '@clerk/express';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    // Sync updates to Clerk if clerkId exists
    if (req.user.clerkId) {
      const clerkUpdate = {};
      if (req.body.username) {
        clerkUpdate.username = req.body.username;
      }
      if (req.body.password) {
        clerkUpdate.password = req.body.password;
      }
      
      if (Object.keys(clerkUpdate).length > 0) {
        try {
          await clerkClient.users.updateUser(req.user.clerkId, clerkUpdate);
        } catch (clerkErr) {
          console.error("Clerk user update error:", clerkErr);
          return next(errorHandler(400, clerkErr.errors?.[0]?.message || 'Failed to update user profile in Clerk'));
        }
      }
    }

    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {//if data is change then change otherwise ignore
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }//save the updated info
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const clerkUser = await clerkClient.users.getUser(req.clerkId);
    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase();
    const userEmail = user?.email?.toLowerCase();

    if (user && user.clerkId !== req.clerkId && (!clerkEmail || userEmail !== clerkEmail)) {
      return next(errorHandler(401, 'You can only delete your own account!'));
    }

    // A Clerk session can exist without a MongoDB profile; still allow its owner to delete the account.
    await clerkClient.users.deleteUser(req.clerkId);
    if (user) {
      await User.findByIdAndDelete(user._id);
    } else {
      await User.deleteOne({ clerkId: req.clerkId });
    }
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};