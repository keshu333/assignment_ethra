import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, Lock, Mail, Shield, User, Zap } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Logged in successfully!', 'success');
      navigate('/');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('keshu77@gmail.com');
      setPassword('');
      showToast('Please enter the Admin password', 'info');
      setTimeout(() => document.getElementById('password-input')?.focus(), 100);
    } else {
      setEmail('member@test.com');
      setPassword('');
      showToast('Please enter the Member password', 'info');
      setTimeout(() => document.getElementById('password-input')?.focus(), 100);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-md glass-card p-8 border-slate-900 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-3 rounded-2xl shadow-xl shadow-violet-500/20 mb-4 animate-bounce">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
            Welcome back to SyncPlan
          </h2>
          <p className="text-xs text-slate-500 mt-2">Enter details to manage your team workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full glass-input !pl-11"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input !pl-11"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Sign In to Workspace'
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fills */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Demo credentials (Click to auto-fill)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-violet-500/10 hover:border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-xs font-semibold text-violet-400 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
            <button
              onClick={() => handleQuickLogin('member')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-fuchsia-500/10 hover:border-fuchsia-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 text-xs font-semibold text-fuchsia-400 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              Member
            </button>
          </div>
        </div>

        {/* Register Redirect */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
