const User = require('../models/User');
const Listing = require('../models/Listing');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');

/**
 * @desc    Get platform usage stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ isFilled: false });
    const filledListings = await Listing.countDocuments({ isFilled: true });
    
    const totalInterests = await InterestRequest.countDocuments();
    const acceptedInterests = await InterestRequest.countDocuments({ status: 'accepted' });
    const pendingInterests = await InterestRequest.countDocuments({ status: 'pending' });

    const totalMessages = await Message.countDocuments();

    // Get recent activity log (last 5 signups and last 5 listings)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentListings = await Listing.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'name');

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, owners: totalOwners, tenants: totalTenants },
        listings: { total: totalListings, active: activeListings, filled: filledListings },
        interests: { total: totalInterests, accepted: acceptedInterests, pending: pendingInterests },
        messages: totalMessages,
      },
      recentUsers,
      recentListings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    // If owner, clean up their listings
    if (user.role === 'owner') {
      await Listing.deleteMany({ owner: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'User and all related records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  deleteUser,
};
