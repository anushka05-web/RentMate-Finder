const Listing = require('../models/Listing');
const Profile = require('../models/Profile');
const Compatibility = require('../models/Compatibility');
const InterestRequest = require('../models/InterestRequest');
const { calculateCompatibility } = require('../services/aiService');
const { INDIAN_CITIES } = require('../utils/constants');

/**
 * @desc    Create a room listing
 * @route   POST /api/listings
 * @access  Private (Owner only)
 */
const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a room listing
 * @route   PUT /api/listings/:id
 * @access  Private (Owner of the listing or Admin)
 */
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this listing' });
    }

    // Update listing
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Clear cached compatibility scores for this listing since details have changed
    await Compatibility.deleteMany({ listing: listing._id });

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room listing
 * @route   DELETE /api/listings/:id
 * @access  Private (Owner of the listing or Admin)
 */
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing' });
    }

    // Use deleteOne or findByIdAndDelete to trigger any hooks if necessary
    await Listing.findByIdAndDelete(req.params.id);

    // Clean up related compatibilities, interest requests, etc.
    await Compatibility.deleteMany({ listing: req.params.id });
    await InterestRequest.deleteMany({ listing: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Listing removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all listings for tenant (with filters, scored and sorted by compatibility)
 * @route   GET /api/listings
 * @access  Private (Tenant/Admin) or Public
 */
const getListings = async (req, res, next) => {
  try {
    const { location, maxRent, roomType, furnishing } = req.query;

    // Filter build
    const query = { isFilled: false }; // Hide filled listings

    if (location) {
      query.location = location;
    }
    if (maxRent) {
      query.rent = { $lte: Number(maxRent) };
    }
    if (roomType) {
      query.roomType = roomType;
    }
    if (furnishing) {
      query.furnishing = furnishing;
    }

    // Fetch listings matching query
    const listings = await Listing.find(query).populate('owner', 'name email phone');

    // If request user is a tenant, compute/fetch compatibility score for each listing
    if (req.user && req.user.role === 'tenant') {
      const profile = await Profile.findOne({ tenant: req.user.id });

      if (profile) {
        const scoredListings = [];

        for (const listing of listings) {
          // Check cached score
          let comp = await Compatibility.findOne({
            tenant: req.user.id,
            listing: listing._id,
          });

          if (!comp) {
            // Compute compatibility
            const result = await calculateCompatibility(listing, profile);
            comp = await Compatibility.create({
              tenant: req.user.id,
              listing: listing._id,
              score: result.score,
              explanation: result.explanation,
              calculatedBy: result.calculatedBy,
            });
          }

          // Fetch user interest request state
          const interest = await InterestRequest.findOne({
            tenant: req.user.id,
            listing: listing._id,
          });

          scoredListings.push({
            ...listing.toObject(),
            compatibility: {
              score: comp.score,
              explanation: comp.explanation,
              calculatedBy: comp.calculatedBy,
            },
            interestStatus: interest ? interest.status : null,
          });
        }

        // Sort by highest compatibility score first
        scoredListings.sort((a, b) => b.compatibility.score - a.compatibility.score);

        return res.status(200).json({
          success: true,
          count: scoredListings.length,
          listings: scoredListings,
        });
      }
    }

    // If no tenant profile or not logged in as tenant, return without compatibility sorting
    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Owner's own listings
 * @route   GET /api/listings/my-listings
 * @access  Private (Owner only)
 */
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user.id });

    // For each listing, attach pending interest requests count
    const listingsWithStats = [];
    for (const listing of listings) {
      const pendingCount = await InterestRequest.countDocuments({
        listing: listing._id,
        status: 'pending',
      });
      const acceptedCount = await InterestRequest.countDocuments({
        listing: listing._id,
        status: 'accepted',
      });

      listingsWithStats.push({
        ...listing.toObject(),
        pendingInterests: pendingCount,
        acceptedInterests: acceptedCount,
      });
    }

    res.status(200).json({
      success: true,
      count: listingsWithStats.length,
      listings: listingsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single listing details
 * @route   GET /api/listings/:id
 * @access  Private
 */
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email phone');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    let compatibility = null;
    let interestStatus = null;

    if (req.user && req.user.role === 'tenant') {
      const profile = await Profile.findOne({ tenant: req.user.id });
      if (profile) {
        let comp = await Compatibility.findOne({
          tenant: req.user.id,
          listing: listing._id,
        });

        if (!comp) {
          const result = await calculateCompatibility(listing, profile);
          comp = await Compatibility.create({
            tenant: req.user.id,
            listing: listing._id,
            score: result.score,
            explanation: result.explanation,
            calculatedBy: result.calculatedBy,
          });
        }
        compatibility = {
          score: comp.score,
          explanation: comp.explanation,
          calculatedBy: comp.calculatedBy,
        };
      }

      const interest = await InterestRequest.findOne({
        tenant: req.user.id,
        listing: listing._id,
      });
      if (interest) {
        interestStatus = interest.status;
      }
    }

    res.status(200).json({
      success: true,
      listing: {
        ...listing.toObject(),
        compatibility,
        interestStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle room filled status
 * @route   PATCH /api/listings/:id/fill
 * @access  Private (Owner of the listing only)
 */
const toggleFilled = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    listing.isFilled = !listing.isFilled;
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing marked as ${listing.isFilled ? 'filled' : 'available'}`,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  getListings,
  getMyListings,
  getListingById,
  toggleFilled,
};
