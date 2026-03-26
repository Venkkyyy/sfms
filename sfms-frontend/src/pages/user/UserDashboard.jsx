import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { FileWarning, CalendarDays, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compRes, bookRes] = await Promise.all([
        API.get('/complaints'),
        API.get('/bookings'),
      ]);
      setComplaints(compRes.data);
      setBookings(bookRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalComplaints: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    totalBookings: bookings.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/complaints/new"
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </Link>
        <Link
          to="/bookings/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <CalendarDays className="w-4 h-4" /> Book Resource
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.totalComplaints}</p>
              <p className="text-xs text-slate-500">Total Complaints</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
              <p className="text-xs text-slate-500">Resolved</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.totalBookings}</p>
              <p className="text-xs text-slate-500">Total Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent Complaints</h3>
            <Link to="/complaints" className="text-xs text-primary-600 font-medium hover:text-primary-700">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {complaints.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No complaints yet</div>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div key={c._id} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{c.category}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]?.bg} ${STATUS_COLORS[c.status]?.text}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent Bookings</h3>
            <Link to="/bookings" className="text-xs text-primary-600 font-medium hover:text-primary-700">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {bookings.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No bookings yet</div>
            ) : (
              bookings.slice(0, 5).map((b) => (
                <div key={b._id} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{b.resourceId?.name || 'Resource'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(b.date).toLocaleDateString()} • {b.timeSlot}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]?.bg} ${STATUS_COLORS[b.status]?.text}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
