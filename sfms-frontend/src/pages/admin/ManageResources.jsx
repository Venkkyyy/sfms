import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { RESOURCE_TYPES } from '../../utils/constants';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', resource: null });
  const [formData, setFormData] = useState({ name: '', type: 'Room', description: '', location: '', availability: true });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await API.get('/resources');
      setResources(res.data);
    } catch (err) {
      console.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setFormData({ name: '', type: 'Room', description: '', location: '', availability: true });
    setModal({ open: true, mode: 'create', resource: null });
  };

  const openEdit = (r) => {
    setFormData({ name: r.name, type: r.type, description: r.description, location: r.location, availability: r.availability });
    setModal({ open: true, mode: 'edit', resource: r });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'create') {
        await API.post('/resources', formData);
        toast.success('Resource created!');
      } else {
        await API.patch(`/resources/${modal.resource._id}`, formData);
        toast.success('Resource updated!');
      }
      setModal({ open: false, mode: 'create', resource: null });
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      toast.success('Resource deleted!');
      fetchResources();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Resources</h1>
          <p className="text-sm text-slate-500 mt-1">Add and manage facility resources</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No resources yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    r.type === 'Room' ? 'bg-blue-100 text-blue-600' :
                    r.type === 'Equipment' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{r.name}</h3>
                    <p className="text-xs text-slate-500">{r.type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  r.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {r.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {r.description && <p className="text-xs text-slate-500 mt-3">{r.description}</p>}
              {r.location && <p className="text-xs text-slate-400 mt-1">📍 {r.location}</p>}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEdit(r)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', resource: null })}
        title={modal.mode === 'create' ? 'Add Resource' : 'Edit Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resource-availability"
              checked={formData.availability}
              onChange={(e) => updateField('availability', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-600"
            />
            <label htmlFor="resource-availability" className="text-sm text-slate-700">Available for booking</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal({ open: false, mode: 'create', resource: null })}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 gradient-primary text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
            >
              {modal.mode === 'create' ? 'Create Resource' : 'Update Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
