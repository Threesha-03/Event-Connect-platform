const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, toggleWishlist, getWishlist, getDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/change-password', changePassword);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:eventId', toggleWishlist);
router.get('/dashboard', getDashboard);

module.exports = router;
