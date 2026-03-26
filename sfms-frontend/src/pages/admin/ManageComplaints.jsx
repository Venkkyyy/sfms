import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ open: false, complaintId: null });
  const [selectedTech, setSelectedTech] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const [compRes, techRes] = await Promise.all([
        API.get('/complaints', { params }),
        API.get('/auth/me').then(() => API.get('/complaints')), // just to get token working
      ]);
      setComplaints(compRes.data);

      // Fetch technicians through admin dashboard or a workaround
      // We'll create a simple endpoint, but for now use the complaints data
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch technicians for assignment
    const fetchTechnicians = async () => {
      try {
        const res = await API.get('/admin/technicians');
        setTechnicians(res.data);
      } catch (err) {
        console.error('Failed to fetch technicians');
      }
    };
    fetchTechnicians();
  }, []);

  const handleAssign = async () => {
    if (!selectedTech) return toast.error('Please select a technician');
    try {
      await API.patch(`/complaints/${assignModal.complaintId}/assign`, { technicianId: selectedTech });
      toast.success('Complaint assigned successfully!');
      setAssignModal({ open: false, complaintId: null });
      setSelectedTech('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Complaints</h1>
        <p className="text-sm text-slate-500 mt-1">Review and assign complaints to technicians</p>
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

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No complaints found</p>
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
                    <span>By: {c.userId?.name || 'Unknown'}</span>
                    <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    {c.assignedTo && <span className="text-blue-500">Assigned to: {c.assignedTo.name}</span>}
                  </div>
                </div>
                {c.status === 'Pending' && (
                  <button
                    onClick={() => setAssignModal({ open: true, complaintId: c._id })}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Assign
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={assignModal.open}
        onClose={() => { setAssignModal({ open: false, complaintId: null }); setSelectedTech(''); }}
        title="Assign Technician"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select a technician to assign this complaint.</p>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm bg-white"
          >
            <option value="">-- Select a Technician --</option>
            {technicians.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setAssignModal({ open: false, complaintId: null }); setSelectedTech(''); }}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              className="flex-1 gradient-primary text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
            >
              Assign Technician
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
