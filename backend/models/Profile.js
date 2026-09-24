const mongoose = require('mongoose');
const { INDIAN_CITIES } = require('../utils/constants');

const ProfileSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  preferredLocation: {
    type: String,
    required: [true, 'Preferred city location is required'],
    enum: {
      values: INDIAN_CITIES,
      message: '{VALUE} is not a valid Indian city',
    },
  },
  preferredLocality: {
    type: String,
    required: [true, 'Preferred area is required'],
    trim: true,
  },
  budgetMin: {
    type: Number,
    required: [true, 'Minimum budget is required'],
    min: [0, 'Budget cannot be negative'],
  },
  budgetMax: {
    type: Number,
    required: [true, 'Maximum budget is required'],
    min: [0, 'Budget cannot be negative'],
    validate: {
      validator: function (value) {
        if (this.getUpdate) {
          const update = this.getUpdate();
          const minVal = update.budgetMin !== undefined ? update.budgetMin : (update.$set && update.$set.budgetMin);
          if (minVal !== undefined) return value >= minVal;
        }
        if (this.budgetMin !== undefined) {
          return value >= this.budgetMin;
        }
        return true;
      },
      message: 'Maximum budget must be greater than or equal to minimum budget',
    },
  },
  moveInDate: {
    type: Date,
    required: [true, 'Preferred move-in date is required'],
  },
  preferredRoomType: {
    type: String,
    required: [true, 'Preferred room type is required'],
    enum: ['Single Room', 'Shared Room', 'Private Room', '1 RK', '1 BHK', '2 BHK'],
  },
  furnishingPreference: {
    type: String,
    required: [true, 'Furnishing preference is required'],
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'],
  },
  requiredAmenities: {
    type: [String],
    default: [],
  },
  foodPreference: {
    type: String,
    required: [true, 'Food preference is required'],
    enum: ['Veg Only', 'Non-Veg Allowed', 'Both'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Boys', 'Girls', 'Anyone'],
  },
  smokingPreference: {
    type: String,
    required: [true, 'Smoking habit preference is required'],
    enum: ['Allowed', 'Not Allowed'],
  },
  drinkingPreference: {
    type: String,
    required: [true, 'Drinking habit preference is required'],
    enum: ['Allowed', 'Not Allowed'],
  },
  pets: {
    type: Boolean,
    default: false,
  },
  parkingRequired: {
    type: Boolean,
    default: false,
  },
  attachedBathroomRequired: {
    type: Boolean,
    default: false,
  },
  balconyRequired: {
    type: Boolean,
    default: false,
  },
  kitchenRequired: {
    type: Boolean,
    default: false,
  },
  securityRequired: {
    type: Boolean,
    default: false,
  },
  preferredOccupancy: {
    type: String,
    required: [true, 'Occupancy preference is required'],
    enum: ['Single', 'Double', 'Triple'],
  },
  nearbyPreference: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', ProfileSchema);
