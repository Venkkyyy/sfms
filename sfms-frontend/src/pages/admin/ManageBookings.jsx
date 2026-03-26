import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { STATUS_COLORS } from '../../utils/constants';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageBookings() {
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

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}!`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">Approve or reject resource booking requests</p>
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
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">User</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Resource</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Time</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Purpose</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{b.userId?.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {b.resourceId?.name}
                      <span className="text-xs text-slate-400 ml-1">({b.resourceId?.type})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600">{b.timeSlot}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate">{b.purpose || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[b.status]?.bg} ${STATUS_COLORS[b.status]?.text}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(b._id, 'approved')}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(b._id, 'rejected')}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
