const Profile = require('../models/Profile');
const Compatibility = require('../models/Compatibility');

/**
 * @desc    Get current tenant profile
 * @route   GET /api/profiles/my-profile
 * @access  Private (Tenant only)
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ tenant: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No tenant requirement profile found. Please create one.',
      });
    }
    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or Update tenant profile (Upsert)
 * @route   POST /api/profiles
 * @access  Private (Tenant only)
 */
const upsertProfile = async (req, res, next) => {
  try {
    const min = Number(req.body.budgetMin);
    const max = Number(req.body.budgetMax);

    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budgets must be valid positive numbers',
      });
    }

    if (max < min) {
      return res.status(400).json({
        success: false,
        message: 'Maximum budget cannot be less than minimum budget',
      });
    }

    const profileData = {
      ...req.body,
      tenant: req.user.id,
      budgetMin: min,
      budgetMax: max,
    };

    // Find and update, or create if not exists
    let profile = await Profile.findOne({ tenant: req.user.id });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { tenant: req.user.id },
        profileData,
        { new: true, runValidators: true }
      );
      // Clear cached compatibility scores since requirements changed
      await Compatibility.deleteMany({ tenant: req.user.id });
    } else {
      profile = await Profile.create(profileData);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  upsertProfile,
};
