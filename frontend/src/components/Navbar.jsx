import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Menu, X, LayoutDashboard, PlusCircle, ClipboardList } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const customerLinks = [
    { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customer/create-return', icon: PlusCircle, label: 'New Return' },
    { to: '/customer/my-returns', icon: ClipboardList, label: 'My Returns' },
  ];
  const managerLinks = [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/returns', icon: ClipboardList, label: 'All Returns' },
  ];
  const links = user?.role === 'manager' ? managerLinks : customerLinks;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-sm tracking-tight hidden sm:block">
              ReturnAI
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden sm:flex items-center gap-1">
              {links.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-700">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Logout</span>
                </button>
                {/* Mobile menu button */}
                <button className="sm:hidden p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <Link to="/login" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && user && (
          <div className="sm:hidden py-2 border-t border-slate-100 animate-fade-in">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
