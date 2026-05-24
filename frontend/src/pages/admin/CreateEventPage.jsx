import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { createEvent } from '../../store/slices/eventSlice';
import { AdminMap } from '../../components/common/MapComponent';
import { FiPlus, FiTrash2, FiMapPin, FiImage } from 'react-icons/fi';
import { CATEGORIES } from '../../utils/helpers';
import toast from 'react-hot-toast';

const defaultTicket = { name: '', price: 0, totalSeats: 100, description: '' };

const CreateEventPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.events);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Music',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    isWorkshop: false,
    isFeatured: false,
    isTrending: false,
    tags: '',
    organizerPhone: '',
  });

  const [venue, setVenue] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    latitude: null,
    longitude: null,
  });

  const [tickets, setTickets] = useState([{ ...defaultTicket, name: 'General' }]);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');

  const handleMapClick = (lat, lng) => {
    setVenue(v => ({ ...v, latitude: lat, longitude: lng }));
    toast.success(`Location set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPoster(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const addTicket = () => setTickets(t => [...t, { ...defaultTicket }]);
  const removeTicket = (i) => setTickets(t => t.filter((_, idx) => idx !== i));
  const updateTicket = (i, key, value) => {
    setTickets(t => t.map((ticket, idx) => idx === i ? { ...ticket, [key]: value } : ticket));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!venue.latitude || !venue.longitude) {
      toast.error('Please select event location on the map');
      return;
    }

    if (tickets.some(t => !t.name || t.price < 0 || t.totalSeats < 1)) {
      toast.error('Please fill in all ticket details correctly');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append('venue', JSON.stringify(venue));
    formData.append('ticketTypes', JSON.stringify(tickets));
    if (poster) formData.append('poster', poster);

    const result = await dispatch(createEvent(formData));
    if (createEvent.fulfilled.match(result)) {
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } else {
      toast.error(result.payload || 'Failed to create event');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-ghost">← Back</button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Create New Event</h1>
            <p className="text-gray-500">Fill in the details to publish your event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Sunburn Festival 2024"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none"
                  rows={5}
                  placeholder="Describe your event in detail..."
                  required
                  maxLength={2000}
                />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                    className="input-field"
                    required
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                    className="input-field"
                    placeholder="Music, Festival, EDM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="label">Start Time *</label>
                  <input type="time" value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))} className="input-field" />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'isFeatured', label: '⭐ Featured Event' },
                  { key: 'isTrending', label: '🔥 Trending Event' },
                  { key: 'isWorkshop', label: '🔧 Workshop (Certificate)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm(p => ({ ...p, [key]: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Poster */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Event Poster</h2>
            <div className="flex items-start gap-6">
              <label className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors">
                <FiImage className="text-4xl text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Click to upload poster image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                <input type="file" accept="image/*" onChange={handlePosterChange} className="hidden" />
              </label>
              {posterPreview && (
                <div className="relative">
                  <img src={posterPreview} alt="Preview" className="w-40 h-28 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setPoster(null); setPosterPreview(''); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >×</button>
                </div>
              )}
            </div>
          </div>

          {/* Venue */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              <FiMapPin className="inline mr-2 text-primary-500" />
              Venue & Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Venue Name *</label>
                <input type="text" value={venue.name} onChange={(e) => setVenue(v => ({ ...v, name: e.target.value }))} className="input-field" placeholder="e.g. NSCI Dome" required />
              </div>
              <div>
                <label className="label">City *</label>
                <input type="text" value={venue.city} onChange={(e) => setVenue(v => ({ ...v, city: e.target.value }))} className="input-field" placeholder="e.g. Mumbai" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address *</label>
                <input type="text" value={venue.address} onChange={(e) => setVenue(v => ({ ...v, address: e.target.value }))} className="input-field" placeholder="Full address" required />
              </div>
              <div>
                <label className="label">State</label>
                <input type="text" value={venue.state} onChange={(e) => setVenue(v => ({ ...v, state: e.target.value }))} className="input-field" placeholder="e.g. Maharashtra" />
              </div>
              <div>
                <label className="label">Country</label>
                <input type="text" value={venue.country} onChange={(e) => setVenue(v => ({ ...v, country: e.target.value }))} className="input-field" />
              </div>
            </div>

            <div className="mb-3">
              <p className="label flex items-center gap-2">
                <FiMapPin className="text-primary-500" />
                Click on map to set location *
                {venue.latitude && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-normal">
                    ✓ {venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}
                  </span>
                )}
              </p>
            </div>
            <AdminMap
              latitude={venue.latitude}
              longitude={venue.longitude}
              onLocationSelect={handleMapClick}
            />
          </div>

          {/* Tickets */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ticket Types</h2>
              <button type="button" onClick={addTicket} className="btn-secondary text-sm py-2 flex items-center gap-1">
                <FiPlus /> Add Ticket
              </button>
            </div>
            <div className="space-y-4">
              {tickets.map((ticket, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ticket {i + 1}</span>
                    {tickets.length > 1 && (
                      <button type="button" onClick={() => removeTicket(i)} className="text-red-500 hover:text-red-700 transition-colors">
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="label text-xs">Name *</label>
                      <input type="text" value={ticket.name} onChange={(e) => updateTicket(i, 'name', e.target.value)} className="input-field text-sm py-2" placeholder="General" required />
                    </div>
                    <div>
                      <label className="label text-xs">Price (₹) *</label>
                      <input type="number" value={ticket.price} onChange={(e) => updateTicket(i, 'price', Number(e.target.value))} className="input-field text-sm py-2" min="0" required />
                    </div>
                    <div>
                      <label className="label text-xs">Total Seats *</label>
                      <input type="number" value={ticket.totalSeats} onChange={(e) => updateTicket(i, 'totalSeats', Number(e.target.value))} className="input-field text-sm py-2" min="1" required />
                    </div>
                    <div>
                      <label className="label text-xs">Description</label>
                      <input type="text" value={ticket.description} onChange={(e) => updateTicket(i, 'description', e.target.value)} className="input-field text-sm py-2" placeholder="Optional" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : '🚀 Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
