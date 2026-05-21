import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Default notifications
  const notifications = [
    { id: 1, text: 'Emily completed "UI Wireframes"', time: '10m ago' },
    { id: 2, text: 'New project "Project Apollo" assigned', time: '2h ago' },
    { id: 3, text: 'Task "Fix CORS Headers" is overdue', time: '1d ago' },
  ];

  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-900 bg-slate-950/40 px-6 backdrop-blur-md">
      {/* Page Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300 capitalize">
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Aesthetic Only */}
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="glass-input pl-9 pr-4 py-1.5 text-xs w-56 focus:w-64"
          />
        </div>

        {/* Notifications Icon dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            className="p-2 rounded-lg border border-slate-900 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-violet-500 bg-glow-purple"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 glass-card p-2 border-slate-800 shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between p-3 border-b border-slate-800/80">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] font-medium text-violet-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 my-0.5 rounded-lg hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-800/30 flex flex-col gap-1 cursor-pointer">
                    <p className="text-xs text-slate-300 font-medium">{n.text}</p>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 p-1 pr-3 border border-slate-900 bg-slate-900/20 hover:bg-slate-900/40 rounded-full transition-all cursor-pointer"
            >
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=taskmanager'}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-violet-500/20 object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-slate-300 truncate max-w-28">{user.name.split(' ')[0]}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-52 glass-card p-1.5 border-slate-800 shadow-2xl z-50 animate-fade-in">
                <div className="p-3 border-b border-slate-800/80 mb-1.5">
                  <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Link>

                <a
                  href="#"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Docs & Help
                </a>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 mt-1 border-t border-slate-800/80 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
