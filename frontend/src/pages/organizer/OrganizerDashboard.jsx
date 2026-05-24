import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchOrganizerStats } from "../../store/slices/organizerSlice";
import { deleteEvent } from "../../store/slices/eventSlice";
import { FiCalendar, FiUsers, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiEye, FiCheckCircle } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import QRScanner from "../../components/common/QRScanner";
import { formatDate, formatCurrency, getImageUrl, getStatusColor } from "../../utils/helpers";
import api from "../../utils/api";
import toast from "react-hot-toast";

const TABS = [
  { id: "overview", label: "Overview", icon: FiTrendingUp },
  { id: "events", label: "My Events", icon: FiCalendar },
  { id: "bookings", label: "Attendees", icon: FiUsers },
  { id: "checkin", label: "Check-In", icon: MdQrCodeScanner },
];

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const { stats, events } = useSelector((s) => s.organizer);
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [qrInput, setQrInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [scanMode, setScanMode] = useState("camera");
  const [myEvents, setMyEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => { dispatch(fetchOrganizerStats()); }, [dispatch]);

  useEffect(() => {
    if (activeTab === "events") loadMyEvents();
    if (activeTab === "bookings") loadMyBookings();
  }, [activeTab]);

  const loadMyEvents = async () => {
    setLoadingEvents(true);
    try { const r = await api.get("/organizer/events"); setMyEvents(r.data.events); }
    catch { toast.error("Failed to load events"); }
    finally { setLoadingEvents(false); }
  };

  const loadMyBookings = async () => {
    setLoadingBookings(true);
    try { const r = await api.get("/organizer/bookings"); setMyBookings(r.data.bookings); }
    catch { toast.error("Failed to load bookings"); }
    finally { setLoadingBookings(false); }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteEvent(id));
    if (deleteEvent.fulfilled.match(result)) {
      toast.success("Event deleted");
      setMyEvents((prev) => prev.filter((e) => e._id !== id));
      setDeleteConfirm(null);
    }
  };

  const doCheckIn = async (rawInput) => {
    if (!rawInput || validating) return;
    setValidating(true);
    setValidationResult(null);
    try {
      let bookingId = rawInput.trim();
      if (bookingId.startsWith("{")) {
        try { bookingId = JSON.parse(bookingId).bookingId; }
        catch { setValidationResult({ success: false, message: "Invalid QR format" }); setValidating(false); return; }
      }
      const res = await api.post("/organizer/validate-qr", { bookingId });
      setValidationResult({ success: true, data: res.data });
      setQrInput("");
      toast.success("Check-in successful!");
    } catch (err) {
      const msg = err.response?.data?.message || "Check-in failed";
      setValidationResult({ success: false, message: msg });
      toast.error(msg);
    } finally { setValidating(false); }
  };

  const handleFormSubmit = (e) => { e.preventDefault(); doCheckIn(qrInput); };
  const handleCameraScan = (text) => { if (!validating) doCheckIn(text); };
  const resetCheckin = () => { setValidationResult(null); setQrInput(""); };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black">{user?.name?.charAt(0)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">Organizer</span>
                </div>
                <p className="text-white/70 text-sm">{user?.email}</p>
              </div>
            </div>
            <Link to="/organizer/events/create" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-purple-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm">
              <FiPlus /> Create Event
            </Link>
          </div>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {[
                { label: "Total Events", value: stats.totalEvents },
                { label: "Active Events", value: stats.activeEvents },
                { label: "Total Bookings", value: stats.totalBookings },
                { label: "Confirmed", value: stats.confirmedBookings },
                { label: "Revenue", value: formatCurrency(stats.totalRevenue) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-white/60 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === id ? "bg-purple-600 text-white shadow-lg" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}>
              <Icon /> {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/organizer/events/create" className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiPlus className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <div><p className="font-bold text-gray-900 dark:text-white">Create Event</p><p className="text-sm text-gray-500">Publish a new event</p></div>
              </Link>
              <button onClick={() => setActiveTab("checkin")} className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow group text-left">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MdQrCodeScanner className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div><p className="font-bold text-gray-900 dark:text-white">Check-In Attendees</p><p className="text-sm text-gray-500">Scan QR codes at entry</p></div>
              </button>
              <button onClick={() => setActiveTab("bookings")} className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow group text-left">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div><p className="font-bold text-gray-900 dark:text-white">View Attendees</p><p className="text-sm text-gray-500">See who is coming</p></div>
              </button>
            </div>
            {events.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Events</h2>
                  <button onClick={() => setActiveTab("events")} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {events.slice(0, 4).map((event) => (
                    <div key={event._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.totalBookings} bookings</p>
                      </div>
                      <div className="flex gap-1">
                        <Link to={`/events/${event._id}`} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><FiEye className="text-sm" /></Link>
                        <Link to={`/organizer/events/edit/${event._id}`} className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors"><FiEdit2 className="text-sm" /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Events ({myEvents.length})</h2>
              <Link to="/organizer/events/create" className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> New Event</Link>
            </div>
            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="skeleton-shimmer h-64 rounded-2xl" />)}</div>
            ) : myEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <div key={event._id} className="card-hover overflow-hidden">
                    <div className="relative">
                      <img src={getImageUrl(event.poster)} alt={event.title} className="w-full aspect-video object-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400"; }} />
                      <div className="absolute top-2 left-2">
                        <span className={`badge text-xs ${event.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{event.status}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">{event.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{formatDate(event.date)} - {event.venue?.city}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Bookings: {event.totalBookings}</span>
                        <span>Rating: {event.averageRating || "N/A"}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/events/${event._id}`} className="flex-1 text-center py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">View</Link>
                        <Link to={`/organizer/events/edit/${event._id}`} className="flex-1 text-center py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">Edit</Link>
                        <button onClick={() => setDeleteConfirm(event._id)} className="py-1.5 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🎭</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No events yet</h3>
                <p className="text-gray-500 mb-6">Create your first event and start selling tickets!</p>
                <Link to="/organizer/events/create" className="btn-primary">Create Your First Event</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Attendees</h2>
            {loadingBookings ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton-shimmer h-16 rounded-xl" />)}</div>
            ) : myBookings.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Attendee</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Event</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ticket</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {myBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{booking.user?.name?.charAt(0)}</div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{booking.user?.name}</p>
                                <p className="text-xs text-gray-500">{booking.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 max-w-xs">{booking.event?.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.event?.date)}</p>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.ticketType?.name} x {booking.quantity}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`badge text-xs w-fit ${getStatusColor(booking.status)}`}>{booking.status}</span>
                              {booking.isCheckedIn && <span className="badge bg-blue-100 text-blue-700 text-xs w-fit">Checked In</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">👥</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No attendees yet</h3>
                <p className="text-gray-500">Bookings for your events will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "checkin" && (
          <div className="max-w-lg mx-auto">
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MdQrCodeScanner className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Check-In Attendees</h2>
                <p className="text-gray-500 mt-1 text-sm">Scan QR code or enter Booking ID manually</p>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button onClick={() => setScanMode("camera")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${scanMode === "camera" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  <MdQrCodeScanner /> Camera Scan
                </button>
                <button onClick={() => setScanMode("manual")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${scanMode === "manual" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  Manual Entry
                </button>
              </div>

              {scanMode === "camera" ? (
                <div>
                  <QRScanner onScan={handleCameraScan} />
                  <p className="text-xs text-center text-gray-400 mt-3">Point camera at the attendees QR code ticket</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="label">Booking ID</label>
                    <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)}
                      placeholder="e.g. BK1234567890ABCDE"
                      className="input-field font-mono text-sm tracking-wider" autoFocus autoComplete="off" />
                    <p className="text-xs text-gray-400 mt-1">Find this on the attendees ticket (starts with BK...)</p>
                  </div>
                  <button type="submit" disabled={validating || !qrInput.trim()} className="btn-primary w-full py-3">
                    {validating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Validating...
                      </span>
                    ) : "Validate and Check In"}
                  </button>
                </form>
              )}

              {validationResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-5 rounded-2xl border-2 ${validationResult.success ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"}`}>
                  {validationResult.success ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheckCircle className="text-white text-lg" />
                        </div>
                        <div>
                          <p className="font-bold text-green-700 dark:text-green-400 text-lg">Check-In Successful!</p>
                          <p className="text-sm text-green-600 dark:text-green-500">Attendee marked as attended</p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold text-gray-900 dark:text-white">{validationResult.data.booking?.user?.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-600 dark:text-gray-400 text-xs">{validationResult.data.booking?.user?.email}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Event</span><span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs line-clamp-1">{validationResult.data.booking?.event?.title}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Ticket</span><span className="font-semibold text-gray-900 dark:text-white">{validationResult.data.booking?.ticketType?.name} x {validationResult.data.booking?.quantity}</span></div>
                        <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-2 mt-2"><span className="text-gray-500">Booking ID</span><span className="font-mono text-xs text-gray-600 dark:text-gray-400">{validationResult.data.booking?.bookingId}</span></div>
                      </div>
                      <button onClick={resetCheckin} className="w-full mt-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
                        Done - Check In Next Attendee
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">X</span>
                        </div>
                        <div>
                          <p className="font-bold text-red-700 dark:text-red-400">Check-In Failed</p>
                          <p className="text-sm text-red-600 dark:text-red-500">{validationResult.message}</p>
                        </div>
                      </div>
                      <button onClick={resetCheckin} className="w-full py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors">
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">How it works:</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>Camera mode: point at the QR code on the attendees ticket</li>
                  <li>Manual mode: type the Booking ID from their ticket</li>
                  <li>Attendees find their Booking ID in Dashboard - My Bookings</li>
                  <li>Each ticket can only be checked in once</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Event?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone. All bookings will be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
