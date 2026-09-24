const Message = require('../models/Message');
const InterestRequest = require('../models/InterestRequest');
const Listing = require('../models/Listing');

/**
 * @desc    Get message history for a chat room
 * @route   GET /api/chat/messages/:chatRoomId
 * @access  Private (Owner/Tenant of that room only)
 */
const getChatHistory = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;

    const parts = chatRoomId.split('_');
    if (parts.length !== 2) {
      return res.status(400).json({ success: false, message: 'Invalid chatRoomId format' });
    }

    const [listingId, tenantId] = parts;

    // Check authorization: must be either owner or tenant, and must be accepted
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Room listing not found' });
    }

    const isOwner = listing.owner.toString() === req.user.id;
    const isTenant = tenantId === req.user.id;

    if (!isOwner && !isTenant) {
      return res.status(403).json({ success: false, message: 'Unauthorized to access this chat history' });
    }

    const interest = await InterestRequest.findOne({ listing: listingId, tenant: tenantId });
    if (!interest || interest.status !== 'accepted') {
      return res.status(403).json({
        success: false,
        message: 'Chat is locked until the owner accepts the interest request',
      });
    }

    // Retrieve history
    const messages = await Message.find({ chatRoomId })
      .sort({ timestamp: 1 })
      .populate('sender', 'name role');

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active chats list for the user (Tenant/Owner)
 * @route   GET /api/chat/active-rooms
 * @access  Private (Owner/Tenant)
 */
const getActiveChatRooms = async (req, res, next) => {
  try {
    let matches = [];

    if (req.user.role === 'tenant') {
      // Find accepted interests sent by this tenant
      matches = await InterestRequest.find({ tenant: req.user.id, status: 'accepted' })
        .populate({
          path: 'listing',
          populate: { path: 'owner', select: 'name email phone' },
        });
    } else if (req.user.role === 'owner') {
      // Find listings owned by this owner
      const listings = await Listing.find({ owner: req.user.id });
      const listingIds = listings.map((l) => l._id);

      // Find accepted interests for these listings
      matches = await InterestRequest.find({
        listing: { $in: listingIds },
        status: 'accepted',
      })
        .populate('tenant', 'name email phone')
        .populate('listing', 'address location rent roomType');
    }

    // Format list of rooms
    const activeRooms = matches.map((match) => {
      const listing = match.listing;
      const otherUser = req.user.role === 'tenant' ? listing.owner : match.tenant;
      const chatRoomId = `${listing._id}_${req.user.role === 'tenant' ? req.user.id : match.tenant._id}`;

      return {
        chatRoomId,
        listing: {
          _id: listing._id,
          address: listing.address,
          location: listing.location,
          rent: listing.rent,
          roomType: listing.roomType,
        },
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          phone: otherUser.phone,
          role: otherUser.role,
        },
        interestId: match._id,
      };
    });

    res.status(200).json({
      success: true,
      rooms: activeRooms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
  getActiveChatRooms,
};
