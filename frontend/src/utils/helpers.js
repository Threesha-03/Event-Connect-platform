import { format, formatDistanceToNow, isAfter } from 'date-fns';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), fmt);
};

export const formatDateTime = (date, time) => {
  if (!date) return '';
  const d = format(new Date(date), 'EEE, MMM dd, yyyy');
  return time ? `${d} at ${time}` : d;
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === 0) return 'FREE';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const isEventUpcoming = (date) => {
  return isAfter(new Date(date), new Date());
};

export const getMinTicketPrice = (ticketTypes) => {
  if (!ticketTypes || ticketTypes.length === 0) return 0;
  return Math.min(...ticketTypes.map(t => t.price));
};

export const getTotalAvailableSeats = (ticketTypes) => {
  if (!ticketTypes) return 0;
  return ticketTypes.reduce((sum, t) => sum + t.availableSeats, 0);
};

export const getCategoryColor = (category) => {
  const colors = {
    Music: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Arts: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Business: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    Education: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Workshop: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    Comedy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Other: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  };
  return colors[category] || colors.Other;
};

export const getCategoryIcon = (category) => {
  const icons = {
    Music: '🎵', Technology: '💻', Sports: '⚽', Arts: '🎨',
    Food: '🍕', Business: '💼', Education: '📚', Workshop: '🔧',
    Comedy: '😂', Other: '🎯',
  };
  return icons[category] || '🎯';
};

export const getStatusColor = (status) => {
  const colors = {
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    attended: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return colors[status] || colors.pending;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
  if (url.startsWith('http')) return url;
  return url;
};

export const CATEGORIES = [
  'All', 'Music', 'Technology', 'Sports', 'Arts', 'Food',
  'Business', 'Education', 'Workshop', 'Comedy', 'Other',
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'date', label: 'Date: Earliest' },
  { value: '-date', label: 'Date: Latest' },
  { value: 'ticketTypes.price', label: 'Price: Low to High' },
  { value: '-ticketTypes.price', label: 'Price: High to Low' },
  { value: '-totalBookings', label: 'Most Popular' },
  { value: '-averageRating', label: 'Top Rated' },
];
