import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';  // Include .js extension
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(cookieParser());
app.use(express.json());//allowing to send json to server

app.use("/api/user", userRouter); 
app.use("/api/auth", authRouter); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use((err,req,res,next)=>{
  const statusCode=err.statusCode || 500;
  const message=err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success:false,
    statusCode,
    message,
  });
});