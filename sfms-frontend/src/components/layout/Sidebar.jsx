import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, FileWarning, CalendarDays, Settings, LogOut,
  Users, BarChart3, ClipboardList, Wrench, Building2, Package
} from 'lucide-react';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/complaints', label: 'My Complaints', icon: FileWarning },
  { to: '/complaints/new', label: 'New Complaint', icon: ClipboardList },
  { to: '/bookings', label: 'My Bookings', icon: CalendarDays },
  { to: '/bookings/new', label: 'Book Resource', icon: Package },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/complaints', label: 'Complaints', icon: FileWarning },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/admin/resources', label: 'Resources', icon: Building2 },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

const techLinks = [
  { to: '/technician', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/technician/complaints', label: 'Assigned Tasks', icon: Wrench },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'technician' ? techLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out
          w-64 bg-[var(--color-sidebar)] text-white
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SFMS</h1>
            <p className="text-xs text-slate-400">Facility Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-3 mb-3">
            Navigation
          </p>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/technician'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[var(--color-sidebar-active)] text-white shadow-lg shadow-indigo-500/10'
                      : 'text-slate-400 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
