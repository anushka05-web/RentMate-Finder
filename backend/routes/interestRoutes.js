const express = require('express');
const router = express.Router();
const {
  sendInterest,
  acceptInterest,
  declineInterest,
  getTenantInterests,
  getOwnerInterests,
} = require('../controllers/interestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('tenant'), sendInterest);
router.patch('/:id/accept', authorize('owner'), acceptInterest);
router.patch('/:id/decline', authorize('owner'), declineInterest);

router.get('/tenant', authorize('tenant'), getTenantInterests);
router.get('/owner', authorize('owner'), getOwnerInterests);

module.exports = router;
