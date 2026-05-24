const express = require('express');
const router = express.Router();
const {
  createBooking, confirmBooking, getMyBookings, getBooking,
  cancelBooking, validateQR,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/cancel', cancelBooking);
router.post('/validate-qr', adminOnly, validateQR);

module.exports = router;
