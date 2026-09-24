const mongoose = require('mongoose');
const { INDIAN_CITIES } = require('../utils/constants');

const ListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'City location is required'],
    enum: {
      values: INDIAN_CITIES,
      message: '{VALUE} is not a valid Indian city',
    },
  },
  locality: {
    type: String,
    required: [true, 'Locality / Area is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address detail is required'],
    trim: true,
  },
  rent: {
    type: Number,
    required: [true, 'Rent is required'],
    min: [0, 'Rent cannot be negative'],
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: [0, 'Security deposit cannot be negative'],
  },
  availableFrom: {
    type: Date,
    required: [true, 'Available from date is required'],
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single Room', 'Shared Room', 'Private Room', '1 RK', '1 BHK', '2 BHK'],
  },
  furnishing: {
    type: String,
    required: [true, 'Furnishing status is required'],
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'],
  },
  amenities: {
    type: [String],
    default: [],
  },
  foodPreference: {
    type: String,
    required: [true, 'Food preference is required'],
    enum: ['Veg Only', 'Non-Veg Allowed', 'Both'],
  },
  genderPreference: {
    type: String,
    required: [true, 'Gender preference is required'],
    enum: ['Boys', 'Girls', 'Anyone'],
  },
  smoking: {
    type: String,
    required: [true, 'Smoking rule is required'],
    enum: ['Allowed', 'Not Allowed'],
  },
  drinking: {
    type: String,
    required: [true, 'Drinking rule is required'],
    enum: ['Allowed', 'Not Allowed'],
  },
  guests: {
    type: String,
    required: [true, 'Guests rule is required'],
    enum: ['Allowed', 'Not Allowed'],
  },
  occupancy: {
    type: String,
    required: [true, 'Occupancy is required'],
    enum: ['Single', 'Double', 'Triple'],
  },
  nearby: {
    type: [String],
    default: [],
  },
  photos: {
    type: [String],
    default: [],
  },
  isFilled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Listing', ListingSchema);
