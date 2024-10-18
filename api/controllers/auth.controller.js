import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {errorHandler} from '../utils/error.js';


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
  
