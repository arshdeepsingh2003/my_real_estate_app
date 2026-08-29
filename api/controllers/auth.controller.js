import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {errorHandler} from '../utils/error.js';
import { clerkClient, verifyToken } from '@clerk/express';


export const signup=async(req,res,next)=>{
    const {username,email,password}=req.body;
    const hashedPassword=bcryptjs.hashSync(password,10);
    const newUser=new User( {username,email,password:hashedPassword});
   try {
    await newUser.save();
    res.status(201).json("user created successfully");
    
   } catch (error) {
    next(error);
    
   }
    

};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const validUser = await User.findOne({ email });
      if (!validUser) {
        return next(errorHandler(404, 'User not found!')); // Trigger the error handler if user not found
      }
  
      // Check if the password is valid
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) {
        return next(errorHandler(401, 'Wrong credentials!')); // Trigger the error handler if password is wrong
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Ensure JWT_SECRET is set in your environment variables
      const { password: pass, ...rest } = validUser._doc; // Separate the password from other user details
  
      // Set the token in a cookie and return user data excluding password
      res.cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } catch (error) {
      next(error); // Catch any other errors
    }
  };


  export const google = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = user._doc;
        res
          .cookie('access_token', token, { httpOnly: true })
          .status(200)
          .json(rest);
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
        const newUser = new User({
          username:
            req.body.name.split(' ').join('').toLowerCase() +
            Math.random().toString(36).slice(-4),
          email: req.body.email,
          password: hashedPassword,
          avatar: req.body.photo,
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = newUser._doc;
        res
          .cookie('access_token', token, { httpOnly: true })
          .status(200)
          .json(rest);
      }
    } catch (error) {
      next(error);
    }
  };
  
  export const signOut = async (req, res, next) => {
    try {
      res.clearCookie('access_token');
      res.status(200).json('User has been logged out!');
    } catch (error) {
      next(error);
    }
  };

export const clerkSync = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    // Verify token using Clerk
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkId = verified.sub;
    if (!clerkId) {
      return next(errorHandler(403, 'Forbidden'));
    }

    // Fetch user details from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const avatar = clerkUser.imageUrl;

    // Find or create user in MongoDB
    let mongoUser = await User.findOne({ clerkId });

    if (!mongoUser) {
      // Look up by email to link existing user
      mongoUser = await User.findOne({ email });
      if (mongoUser) {
        mongoUser.clerkId = clerkId;
        if (!mongoUser.avatar) {
          mongoUser.avatar = avatar;
        }
        await mongoUser.save();
      } else {
        // Create new user in MongoDB
        let baseUsername = clerkUser.username || 
          (clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName}${clerkUser.lastName}`.toLowerCase() : '') ||
          email.split('@')[0];
        
        // Sanitize username (alphanumeric only)
        baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, '');

        let username = baseUsername;
        let userExists = await User.findOne({ username });
        while (userExists) {
          username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
          userExists = await User.findOne({ username });
        }

        mongoUser = new User({
          username,
          email,
          password: bcryptjs.hashSync(Math.random().toString(36).slice(-8), 10),
          avatar: avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          clerkId,
        });
        await mongoUser.save();
      }
    } else {
      // Update email/avatar if they exist and are different
      let updated = false;
      if (email && mongoUser.email !== email) {
        mongoUser.email = email;
        updated = true;
      }
      if (avatar && !mongoUser.avatar) {
        mongoUser.avatar = avatar;
        updated = true;
      }
      if (updated) {
        await mongoUser.save();
      }
    }

    const { password, ...rest } = mongoUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    console.error('Error in clerkSync:', error);
    next(error);
  }
};
  
