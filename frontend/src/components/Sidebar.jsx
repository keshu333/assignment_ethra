import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  const sidebarClasses = `
    hidden md:flex flex-col h-screen glass-panel transition-all duration-300 z-40 flex-shrink-0
    ${collapsed ? 'w-20' : 'w-64'}
  `;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        onClick={() => setMobileOpen && setMobileOpen(false)}
        className={({ isActive }) => `
          flex items-center gap-4 px-4 py-3.5 my-1 rounded-xl transition-all duration-200 group relative
          ${
            isActive
              ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 text-violet-400 border border-violet-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
        {collapsed && (
          <div className="absolute left-20 bg-slate-950 border border-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </NavLink>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        {/* Logo/Brand */}
        <div className="flex items-center justify-between py-2 mb-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                SyncPlan
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg border border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1">
          {menuItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* Footer Profile & Toggles */}
      <div className="flex flex-col gap-4">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className={`
            flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-800/50 hover:bg-slate-900/60 transition-colors text-slate-400 hover:text-slate-200 cursor-pointer
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium capitalize">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User Card */}
        {user && (
          <div
            className={`
              flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-900/60
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <img
              src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=taskmanager'}
              alt={user.name}
              className="w-9 h-9 rounded-full border border-violet-500/20 object-cover"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-400'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        {collapsed && (
          <button
            onClick={logout}
            className="flex justify-center p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={sidebarClasses}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Slide-in Sidebar */}
      <div className={`md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-900 p-2 flex flex-col justify-between transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-2 flex justify-between items-center border-b border-slate-900 mb-4">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
              SyncPlan
            </span>
            <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
