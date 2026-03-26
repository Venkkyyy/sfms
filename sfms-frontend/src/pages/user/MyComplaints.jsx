import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { Plus, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await API.get('/complaints', { params });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Complaints</h1>
          <p className="text-sm text-slate-500 mt-1">Track the status of your complaints</p>
        </div>
        <Link
          to="/complaints/new"
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'Pending', 'In Progress', 'Resolved'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s ? 'gradient-primary text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No complaints found</p>
          <Link to="/complaints/new" className="text-primary-600 text-sm font-medium mt-2 inline-block">
            Submit your first complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[c.priority]?.bg} ${PRIORITY_COLORS[c.priority]?.text}`}>
                      {c.priority}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{c.category}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    {c.assignedTo && <span>Assigned to: {c.assignedTo.name}</span>}
                  </div>
                  {c.resolutionNotes && (
                    <div className="mt-3 p-3 bg-green-50 rounded-xl">
                      <p className="text-xs font-medium text-green-700">Resolution Notes:</p>
                      <p className="text-sm text-green-600 mt-1">{c.resolutionNotes}</p>
                    </div>
                  )}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[c.status]?.bg} ${STATUS_COLORS[c.status]?.text}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
