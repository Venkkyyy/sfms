import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/reports')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-center text-slate-400 py-12">Failed to load reports</div>;

  const monthlyComplaintsData = data.monthlyComplaints.map((m) => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    complaints: m.count,
  }));

  const monthlyBookingsData = data.monthlyBookings.map((m) => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    bookings: m.count,
  }));

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed system usage reports and trends</p>
      </div>

      {/* Monthly Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Monthly Complaints Trend</h3>
          {monthlyComplaintsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyComplaintsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="complaints" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Monthly Bookings Trend</h3>
          {monthlyBookingsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyBookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No data yet</p>
          )}
        </div>
      </div>

      {/* Technician Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Technician Performance</h3>
        </div>
        {data.technicianPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Technician</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Total Assigned</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Resolved</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-700">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.technicianPerformance.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{t.name}</td>
                    <td className="px-6 py-4 text-slate-500">{t.email}</td>
                    <td className="px-6 py-4 text-slate-700">{t.total}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{t.resolved}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className="h-full gradient-success rounded-full transition-all"
                            style={{ width: `${Math.min(t.resolutionRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {t.resolutionRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">No performance data available yet</div>
        )}
      </div>
    </div>
  );
}
