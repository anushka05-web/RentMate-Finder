const express = require('express');
const router = express.Router();
const {
  createListing,
  updateListing,
  deleteListing,
  getListings,
  getMyListings,
  getListingById,
  toggleFilled,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('owner'), createListing)
  .get(protect, getListings);

router.route('/my-listings')
  .get(protect, authorize('owner'), getMyListings);

router.route('/:id')
  .get(protect, getListingById)
  .put(protect, authorize('owner', 'admin'), updateListing)
  .delete(protect, authorize('owner', 'admin'), deleteListing);

router.route('/:id/fill')
  .patch(protect, authorize('owner'), toggleFilled);

module.exports = router;
