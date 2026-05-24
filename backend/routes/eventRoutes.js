const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  getTrendingEvents, getFeaturedEvents, getUpcomingEvents,
} = require('../controllers/eventController');
const { protect, adminOnly, optionalAuth, organizerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getEvents);
router.get('/trending', getTrendingEvents);
router.get('/featured', getFeaturedEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', optionalAuth, getEvent);

// Organizers AND admins can create events
router.post('/', protect, organizerOrAdmin, upload.single('poster'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
], createEvent);

router.put('/:id', protect, organizerOrAdmin, upload.single('poster'), updateEvent);
router.delete('/:id', protect, organizerOrAdmin, deleteEvent);

module.exports = router;
