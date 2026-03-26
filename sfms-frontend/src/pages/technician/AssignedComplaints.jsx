import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { STATUS_COLORS, PRIORITY_COLORS, COMPLAINT_STATUSES } from '../../utils/constants';
import { Wrench, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState({ open: false, complaint: null });
  const [updateData, setUpdateData] = useState({ status: '', resolutionNotes: '' });

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

  const openUpdate = (c) => {
    setUpdateData({ status: c.status, resolutionNotes: c.resolutionNotes || '' });
    setUpdateModal({ open: true, complaint: c });
  };

  const handleUpdate = async () => {
    try {
      const payload = {};
      if (updateData.status) payload.status = updateData.status;
      if (updateData.resolutionNotes) payload.resolutionNotes = updateData.resolutionNotes;

      await API.patch(`/complaints/${updateModal.complaint._id}`, payload);
      toast.success('Complaint updated!');
      setUpdateModal({ open: false, complaint: null });
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assigned Complaints</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and resolve your assigned tasks</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'In Progress', 'Resolved'].map((s) => (
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

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No assigned complaints</p>
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
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]?.bg} ${STATUS_COLORS[c.status]?.text}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{c.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span>Reported by: {c.userId?.name || 'Unknown'}</span>
                    <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </div>
                  {c.resolutionNotes && (
                    <div className="mt-3 p-3 bg-green-50 rounded-xl">
                      <p className="text-xs font-medium text-green-700">Your Notes:</p>
                      <p className="text-sm text-green-600 mt-1">{c.resolutionNotes}</p>
                    </div>
                  )}
                </div>
                {c.status !== 'Resolved' && (
                  <button
                    onClick={() => openUpdate(c)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Update
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      <Modal
        isOpen={updateModal.open}
        onClose={() => setUpdateModal({ open: false, complaint: null })}
        title="Update Complaint"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={updateData.status}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resolution Notes</label>
            <textarea
              value={updateData.resolutionNotes}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
              placeholder="Describe what was done to resolve the issue..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setUpdateModal({ open: false, complaint: null })}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 gradient-primary text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
            >
              Update Complaint
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
