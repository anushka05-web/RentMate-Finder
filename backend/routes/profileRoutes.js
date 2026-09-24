const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('tenant'));

router.route('/')
  .post(upsertProfile);

router.route('/my-profile')
  .get(getMyProfile);

module.exports = router;
