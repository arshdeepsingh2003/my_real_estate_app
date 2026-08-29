import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings, uploadImages } from '../controllers/listing.controller.js';
import { sendEnquiry } from '../controllers/enquiry.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Anti-spam rate limiting for property enquiries
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 enquiry submissions per windowMs
  message: {
    success: false,
    message: 'Too many enquiries submitted from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

const uploadImagesMiddleware = (req, res, next) => {
  const uploadArray = upload.array('images', 6);
  uploadArray(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'You can only upload up to 6 images per listing' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Each image must be less than 2 MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post('/create', verifyToken, createListing);
router.post('/upload', verifyToken, uploadImagesMiddleware, uploadImages);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings); // for search
router.post('/:listingId/enquiry', enquiryLimiter, sendEnquiry);

export default router;