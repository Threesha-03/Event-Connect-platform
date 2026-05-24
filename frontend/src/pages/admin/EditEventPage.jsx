import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent, updateEvent } from '../../store/slices/eventSlice';
import { AdminMap } from '../../components/common/MapComponent';
import { FiPlus, FiTrash2, FiMapPin } from 'react-icons/fi';
import { CATEGORIES } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EditEventPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { event, loading } = useSelector((state) => state.events);
  const [form, setForm] = useState(null);
  const [venue, setVenue] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');

  useEffect(() => {
    dispatch(fetchEvent(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'Music',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        endTime: event.endTime || '',
        isWorkshop: event.isWorkshop || false,
        isFeatured: event.isFeatured || false,
        isTrending: event.isTrending || false,
        tags: event.tags?.join(', ') || '',
        status: event.status || 'published',
      });
      setVenue(event.venue || { name: '', address: '', city: '', state: '', country: 'India', latitude: null, longitude: null });
      setTickets(event.ticketTypes || []);
      setPosterPreview(event.poster || '');
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venue.latitude || !venue.longitude) {
      toast.error('Please set event location on map');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append('venue', JSON.stringify(venue));
    formData.append('ticketTypes', JSON.stringify(tickets));
    if (poster) formData.append('poster', poster);

    const result = await dispatch(updateEvent({ id, data: formData }));
    if (updateEvent.fulfilled.match(result)) {
      toast.success('Event updated!');
      navigate('/admin/events');
    } else {
      toast.error(result.payload || 'Failed to update');
    }
  };

  if (!form) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-ghost">← Back</button>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Edit Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Event Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" rows={5} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className="input-field">
                    {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                    {['published', 'draft', 'cancelled', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="label">Time *</label>
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
                  { key: 'isFeatured', label: '⭐ Featured' },
                  { key: 'isTrending', label: '🔥 Trending' },
                  { key: 'isWorkshop', label: '🔧 Workshop' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.checked }))} className="w-4 h-4 text-primary-600 rounded" />
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
              <label className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                <p className="text-sm text-gray-500">Click to change poster</p>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setPoster(f); setPosterPreview(URL.createObjectURL(f)); } }} className="hidden" />
              </label>
              {posterPreview && (
                <img src={posterPreview} alt="Preview" className="w-40 h-28 object-cover rounded-xl"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'; }} />
              )}
            </div>
          </div>

          {/* Venue */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Venue & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Venue Name *</label>
                <input type="text" value={venue.name} onChange={(e) => setVenue(v => ({ ...v, name: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="label">City *</label>
                <input type="text" value={venue.city} onChange={(e) => setVenue(v => ({ ...v, city: e.target.value }))} className="input-field" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address *</label>
                <input type="text" value={venue.address} onChange={(e) => setVenue(v => ({ ...v, address: e.target.value }))} className="input-field" required />
              </div>
            </div>
            <p className="label mb-2">
              <FiMapPin className="inline mr-1 text-primary-500" />
              Click map to update location
              {venue.latitude && <span className="text-xs text-green-600 ml-2">✓ Set</span>}
            </p>
            <AdminMap latitude={venue.latitude} longitude={venue.longitude} onLocationSelect={(lat, lng) => setVenue(v => ({ ...v, latitude: lat, longitude: lng }))} />
          </div>

          {/* Tickets */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ticket Types</h2>
              <button type="button" onClick={() => setTickets(t => [...t, { name: '', price: 0, totalSeats: 100, availableSeats: 100, description: '' }])} className="btn-secondary text-sm py-2 flex items-center gap-1">
                <FiPlus /> Add
              </button>
            </div>
            <div className="space-y-4">
              {tickets.map((ticket, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ticket {i + 1}</span>
                    {tickets.length > 1 && (
                      <button type="button" onClick={() => setTickets(t => t.filter((_, idx) => idx !== i))} className="text-red-500">
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="label text-xs">Name</label>
                      <input type="text" value={ticket.name} onChange={(e) => setTickets(t => t.map((tk, idx) => idx === i ? { ...tk, name: e.target.value } : tk))} className="input-field text-sm py-2" required />
                    </div>
                    <div>
                      <label className="label text-xs">Price (₹)</label>
                      <input type="number" value={ticket.price} onChange={(e) => setTickets(t => t.map((tk, idx) => idx === i ? { ...tk, price: Number(e.target.value) } : tk))} className="input-field text-sm py-2" min="0" />
                    </div>
                    <div>
                      <label className="label text-xs">Total Seats</label>
                      <input type="number" value={ticket.totalSeats} onChange={(e) => setTickets(t => t.map((tk, idx) => idx === i ? { ...tk, totalSeats: Number(e.target.value) } : tk))} className="input-field text-sm py-2" min="1" />
                    </div>
                    <div>
                      <label className="label text-xs">Description</label>
                      <input type="text" value={ticket.description} onChange={(e) => setTickets(t => t.map((tk, idx) => idx === i ? { ...tk, description: e.target.value } : tk))} className="input-field text-sm py-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-base">
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
