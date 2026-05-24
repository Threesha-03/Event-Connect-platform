const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Remove from wishlist
// @route   POST /api/users/wishlist/:eventId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const idx = user.wishlist.indexOf(eventId);
    let message;

    if (idx === -1) {
      user.wishlist.push(eventId);
      message = 'Added to wishlist';
    } else {
      user.wishlist.splice(idx, 1);
      message = 'Removed from wishlist';
    }

    await user.save();
    res.json({ success: true, message, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title poster date time venue category ticketTypes averageRating');

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalBookings, confirmedBookings, cancelledBookings, upcomingBookings] = await Promise.all([
      Booking.countDocuments({ user: req.user._id }),
      Booking.countDocuments({ user: req.user._id, status: 'confirmed' }),
      Booking.countDocuments({ user: req.user._id, status: 'cancelled' }),
      Booking.countDocuments({
        user: req.user._id,
        status: 'confirmed',
      }).populate('event'),
    ]);

    const recentBookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title poster date venue')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: { totalBookings, confirmedBookings, cancelledBookings },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};
