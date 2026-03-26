import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { STATUS_COLORS } from '../../utils/constants';
import { Plus } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await API.get('/bookings', { params });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">View and track your resource bookings</p>
        </div>
        <Link
          to="/bookings/new"
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Plus className="w-4 h-4" /> New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === s ? 'gradient-primary text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No bookings found</p>
          <Link to="/bookings/new" className="text-primary-600 text-sm font-medium mt-2 inline-block">
            Make your first booking
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">{b.resourceId?.name || 'Resource'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{b.resourceId?.type} {b.resourceId?.location && `• ${b.resourceId.location}`}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>📅 {new Date(b.date).toLocaleDateString()}</span>
                    <span>🕐 {b.timeSlot}</span>
                  </div>
                  {b.purpose && <p className="text-xs text-slate-400 mt-1">Purpose: {b.purpose}</p>}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap capitalize ${STATUS_COLORS[b.status]?.bg} ${STATUS_COLORS[b.status]?.text}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
