import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {errorHandler} from '../utils/error.js';
import { clerkClient, verifyToken } from '@clerk/express';

const PASSWORD_REQUIREMENTS = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const USERNAME_TAKEN_MESSAGE = 'Username already exists. Please choose another username.';

const duplicateKeyMessage = (error) => {
  if (error?.code !== 11000) return null;
  return error.keyPattern?.username || error.keyValue?.username
    ? USERNAME_TAKEN_MESSAGE
    : error.keyPattern?.email || error.keyValue?.email
      ? 'An account with this email already exists.'
      : 'This account already exists.';
};

export const validateSignup = async (req, res, next) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!username) return res.status(400).json({ success: false, message: 'Username is required.' });
    if (!PASSWORD_REQUIREMENTS.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character.',
      });
    }

    const existingUser = await User.findOne({ username }).select('_id').lean();
    return res.status(200).json({ available: !existingUser });
  } catch (error) {
    return next(error);
  }
};

export const signup=async(req,res,next)=>{
   try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const { email, password } = req.body;
    if (!username || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Username and email are required.' });
    }
    if (typeof password !== 'string' || !PASSWORD_REQUIREMENTS.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character.' });
    }
    const existingUser = await User.findOne({ username }).select('_id').lean();
    if (existingUser) {
      return res.status(409).json({ success: false, message: USERNAME_TAKEN_MESSAGE });
    }
    const hashedPassword=bcryptjs.hashSync(password,10);
    const newUser=new User({ username, email: email.trim(), password: hashedPassword });
    await newUser.save();
    res.status(201).json({ success: true, message: 'Account created successfully.' });
   } catch (error) {
    const message = duplicateKeyMessage(error);
    if (message) return res.status(409).json({ success: false, message });
    next(error);
   }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const validUser = await User.findOne({ email });
      if (!validUser) {
        return next(errorHandler(401, 'Invalid email or password.'));
      }
  
      // Check if the password is valid
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) {
        return next(errorHandler(401, 'Invalid email or password.'));
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
        const metadataUsername = typeof clerkUser.unsafeMetadata?.username === 'string'
          ? clerkUser.unsafeMetadata.username.trim()
          : '';
        const hasExternalAccount = Boolean(clerkUser.externalAccounts?.length);
        const requestedUsername = metadataUsername || (!hasExternalAccount && typeof clerkUser.username === 'string'
          ? clerkUser.username.trim()
          : '');
        let username;
        let generatedUsernameBase = '';

        if (requestedUsername) {
          const existingUsername = await User.findOne({ username: requestedUsername }).select('_id').lean();
          if (existingUsername) {
            return res.status(409).json({ success: false, message: USERNAME_TAKEN_MESSAGE });
          }
          username = requestedUsername;
        } else {
          const derivedUsername = clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName}${clerkUser.lastName}`.toLowerCase()
            : (email || '').split('@')[0];
          const baseUsername = derivedUsername.replace(/[^a-zA-Z0-9]/g, '') || 'user';
          generatedUsernameBase = baseUsername;
          username = baseUsername;
          while (await User.findOne({ username }).select('_id').lean()) {
            username = `${baseUsername}${Math.random().toString(36).slice(2, 8)}`;
          }
        }

        mongoUser = new User({
          username,
          email,
          password: bcryptjs.hashSync(Math.random().toString(36).slice(-8), 10),
          avatar: avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          clerkId,
        });
        for (let attempt = 0; ; attempt += 1) {
          try {
            await mongoUser.save();
            break;
          } catch (error) {
            const duplicateUsername = error?.code === 11000 &&
              (error.keyPattern?.username || error.keyValue?.username);
            if (!generatedUsernameBase || !duplicateUsername || attempt >= 4) throw error;
            mongoUser.username = `${generatedUsernameBase}${Math.random().toString(36).slice(2, 8)}`;
          }
        }
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
    const message = duplicateKeyMessage(error);
    if (message) return res.status(409).json({ success: false, message });
    console.error('Error in clerkSync:', error);
    next(error);
  }
};
  
