const InterestRequest = require('../models/InterestRequest');
const Listing = require('../models/Listing');
const Profile = require('../models/Profile');
const Compatibility = require('../models/Compatibility');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { calculateCompatibility } = require('../services/aiService');
const { notifyOwnerOfInterest, notifyTenantOfAcceptance, notifyTenantOfDecline } = require('../services/emailService');

/**
 * @desc    Send interest request in a room listing
 * @route   POST /api/interests
 * @access  Private (Tenant only)
 */
const sendInterest = async (req, res, next) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'listingId is required' });
    }

    const listing = await Listing.findById(listingId).populate('owner');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Room listing not found' });
    }

    if (listing.isFilled) {
      return res.status(400).json({ success: false, message: 'This room is already filled' });
    }

    // Check if interest already exists
    const existingInterest = await InterestRequest.findOne({
      tenant: req.user.id,
      listing: listingId,
    });

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'You have already sent an interest request for this listing',
      });
    }

    // Create Interest Request
    const interest = await InterestRequest.create({
      tenant: req.user.id,
      listing: listingId,
      status: 'pending',
    });

    // Get compatibility details
    const profile = await Profile.findOne({ tenant: req.user.id });
    let comp = await Compatibility.findOne({ tenant: req.user.id, listing: listingId });

    if (!comp && profile) {
      const compResult = await calculateCompatibility(listing, profile);
      comp = await Compatibility.create({
        tenant: req.user.id,
        listing: listingId,
        score: compResult.score,
        explanation: compResult.explanation,
        calculatedBy: compResult.calculatedBy,
      });
    }

    const score = comp ? comp.score : 0;

    // Create in-app Notification for the Owner
    await Notification.create({
      recipient: listing.owner._id,
      title: 'New Interest Request',
      message: `Tenant ${req.user.name} is interested in your listing at ${listing.address} (Match Score: ${score}%).`,
    });

    // If compatibility score > 80, send email notification to owner
    if (score > 80) {
      await notifyOwnerOfInterest(listing.owner, req.user, listing, score);
    }

    res.status(201).json({
      success: true,
      message: 'Interest request sent successfully',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept interest request
 * @route   PATCH /api/interests/:id/accept
 * @access  Private (Owner only)
 */
const acceptInterest = async (req, res, next) => {
  try {
    const interest = await InterestRequest.findById(req.params.id)
      .populate('listing')
      .populate('tenant');

    if (!interest) {
      return res.status(404).json({ success: false, message: 'Interest request not found' });
    }

    // Verify current user is owner of the listing
    if (interest.listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to accept this request' });
    }

    interest.status = 'accepted';
    await interest.save();

    // Create Notification for Tenant
    await Notification.create({
      recipient: interest.tenant._id,
      title: 'Interest Accepted!',
      message: `Owner ${req.user.name} accepted your interest in ${interest.listing.address}. Chat is now open!`,
    });

    // Fetch full owner details for email
    const owner = await User.findById(req.user.id);

    // Send email notification to tenant
    await notifyTenantOfAcceptance(interest.tenant, owner, interest.listing);

    res.status(200).json({
      success: true,
      message: 'Interest request accepted. Chat is now enabled.',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline interest request
 * @route   PATCH /api/interests/:id/decline
 * @access  Private (Owner only)
 */
const declineInterest = async (req, res, next) => {
  try {
    const interest = await InterestRequest.findById(req.params.id)
      .populate('listing')
      .populate('tenant');

    if (!interest) {
      return res.status(404).json({ success: false, message: 'Interest request not found' });
    }

    // Verify current user is owner of the listing
    if (interest.listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to decline this request' });
    }

    interest.status = 'declined';
    await interest.save();

    // Create Notification for Tenant
    await Notification.create({
      recipient: interest.tenant._id,
      title: 'Request Declined',
      message: `Owner ${req.user.name} declined your interest request for ${interest.listing.address}.`,
    });

    // Fetch full owner details for email
    const owner = await User.findById(req.user.id);

    // Send email notification to tenant
    await notifyTenantOfDecline(interest.tenant, owner, interest.listing);

    res.status(200).json({
      success: true,
      message: 'Interest request declined',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tenant's own interest requests
 * @route   GET /api/interests/tenant
 * @access  Private (Tenant only)
 */
const getTenantInterests = async (req, res, next) => {
  try {
    const interests = await InterestRequest.find({ tenant: req.user.id })
      .populate({
        path: 'listing',
        populate: { path: 'owner', select: 'name email phone' }
      });

    // Map and attach compatibility scores
    const results = [];
    for (const item of interests) {
      const comp = await Compatibility.findOne({ tenant: req.user.id, listing: item.listing._id });
      results.push({
        ...item.toObject(),
        score: comp ? comp.score : null
      });
    }

    res.status(200).json({
      success: true,
      interests: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get owner's received interest requests
 * @route   GET /api/interests/owner
 * @access  Private (Owner only)
 */
const getOwnerInterests = async (req, res, next) => {
  try {
    // Find all listings owned by this owner
    const listings = await Listing.find({ owner: req.user.id });
    const listingIds = listings.map((l) => l._id);

    // Find interest requests for these listings
    const interests = await InterestRequest.find({ listing: { $in: listingIds } })
      .populate('tenant', 'name email phone')
      .populate('listing', 'address location rent roomType');

    // Attach compatibility scores
    const results = [];
    for (const item of interests) {
      const comp = await Compatibility.findOne({ tenant: item.tenant._id, listing: item.listing._id });
      results.push({
        ...item.toObject(),
        score: comp ? comp.score : null
      });
    }

    res.status(200).json({
      success: true,
      interests: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInterest,
  acceptInterest,
  declineInterest,
  getTenantInterests,
  getOwnerInterests,
};
