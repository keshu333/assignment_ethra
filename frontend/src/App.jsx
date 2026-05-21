import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

const AppContent = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if current route is a public auth page
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Map route path to human readable page title
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Overview Analytics';
      case '/projects':
        return 'Workspace Projects';
      case '/tasks':
        return 'Workspace Tasks';
      case '/team':
        return 'Team Directory';
      case '/calendar':
        return 'Schedule Calendar';
      case '/profile':
        return 'Profile Configurations';
      default:
        return 'SyncPlan Workspace';
    }
  };

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main workspace frame */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setMobileOpen(true)} title={getPageTitle(location.pathname)} />
        
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<Team />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
