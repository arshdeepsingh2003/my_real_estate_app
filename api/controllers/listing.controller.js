import Listing from '../models/listing.models.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    let ownerEmail = null;
    try {
      if (listing.userRef) {
        const owner = await User.findById(listing.userRef);
        if (owner) {
          ownerEmail = owner.email;
        }
      }
    } catch (userError) {
      console.error('Error fetching listing owner email:', userError.message);
    }

    const listingObj = listing.toObject();
    listingObj.owner = {
      email: ownerEmail,
    };

    res.status(200).json(listingObj);
  } catch (error) {
    next(error);
  }
};

// Controller function to fetch real estate listings with query parameters for filtering, sorting, and pagination.
export const getListings = async (req, res, next) => {
  try {
    // Set a default limit of 9 listings if not provided in the query parameters.
    const limit = parseInt(req.query.limit) || 9;

    // Set a default starting index of 0 (i.e., the first listing) if not provided in the query parameters.
    const startIndex = parseInt(req.query.startIndex) || 0;

    // Offer filter: If 'offer' is not provided or set to 'false', it will return all listings (both offers and non-offers).
    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] }; // Allow both true and false values (no filtering).
    }

    // Furnished filter: If 'furnished' is not provided or set to 'false', it will return all listings (both furnished and non-furnished).
    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] }; // Allow both true and false values.
    }

    // Parking filter: If 'parking' is not provided or set to 'false', it will return all listings (with and without parking).
    let parking = req.query.parking;
    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] }; // Allow both true and false values.
    }

    // Type filter: If 'type' is not provided or set to 'all', it will return both 'sale' and 'rent' listings.
    let type = req.query.type;
    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] }; // Allow both 'sale' and 'rent'.
    }

    // Search term for finding listings by name. The term is case-insensitive and allows partial matches.
    const searchTerm = req.query.searchTerm || '';

    // Sorting field: Default is 'createdAt', but can be changed by query parameter.
    const sort = req.query.sort || 'createdAt';

    // Sorting order: Default is 'desc' (descending), but can be set to 'asc' (ascending) by query parameter.
    const order = req.query.order || 'desc';

    // Query the database to find listings that match the provided filters, sorting, and pagination.
    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' }, // Search by name (case-insensitive).
      offer, // Filter by offer status.
      furnished, // Filter by furnished status.
      parking, // Filter by parking availability.
      type, // Filter by type (sale or rent).
    })
      .sort({ [sort]: order }) // Sort by the specified field and order.
      .limit(limit) // Limit the number of listings returned.
      .skip(startIndex); // Skip listings for pagination.

    // Respond with the filtered, sorted, and paginated listings in JSON format.
    return res.status(200).json(listings);
  } catch (error) {
    // If an error occurs, pass it to the error-handling middleware.
    next(error);
  }
};

export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one image' });
    }
    
    const uploadType = req.query.type;
    const folder = uploadType === 'profile' ? 'estate-app/profiles' : 'estate-app/listings';

    // Upload all files to Cloudinary in parallel
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, folder));
    const urls = await Promise.all(uploadPromises);
    
    return res.status(200).json({
      success: true,
      urls
    });
  } catch (error) {
    next(error);
  }
};
