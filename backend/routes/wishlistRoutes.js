const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleWishlist, getWishlist } = require('../controllers/userController');

router.use(protect);
router.get('/', getWishlist);
router.post('/:eventId', toggleWishlist);

module.exports = router;
