import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { TIME_SLOTS } from '../../utils/constants';
import { CalendarDays, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingForm() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({ resourceId: '', date: '', timeSlot: '', purpose: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/resources').then((res) => setResources(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/bookings', formData);
      toast.success('Booking request submitted!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Book a Resource</h1>
        <p className="text-sm text-slate-500 mt-1">Reserve rooms, equipment, or vehicles</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resource</label>
            <select
              id="booking-resource"
              value={formData.resourceId}
              onChange={(e) => updateField('resourceId', e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm bg-white"
            >
              <option value="">Select a resource</option>
              {resources.filter((r) => r.availability).map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.type}) {r.location && `- ${r.location}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="booking-date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                min={today}
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => updateField('timeSlot', slot)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                    formData.timeSlot === slot
                      ? 'gradient-primary text-white border-transparent shadow-lg shadow-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Purpose (optional)</label>
            <input
              id="booking-purpose"
              type="text"
              value={formData.purpose}
              onChange={(e) => updateField('purpose', e.target.value)}
              placeholder="e.g., Team meeting, Client presentation"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm bg-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="booking-submit"
              type="submit"
              disabled={loading || !formData.timeSlot}
              className="flex-1 gradient-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
