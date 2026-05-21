import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Lock,
  Mail,
  Shield,
  Loader2,
  CheckCircle,
  HelpCircle,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || ''); // Readonly
  const [avatar, setAvatar] = useState(user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah');

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const avatarSeeds = ['Sarah', 'John', 'Alex', 'Emily', 'Marcus', 'Buster', 'Pepper', 'Cookie'];

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Name field cannot be blank', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await updateProfile({ name, avatar });
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (error) {
      showToast('Failed to save profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      showToast('Please type a new password', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await updateProfile({ password });
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message, 'error');
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Account Configuration</h2>
        <p className="text-xs text-slate-400 mt-1">Configure profile details, secure passwords and choose avatar seeds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card Preview */}
        <div className="glass-card p-6 border-slate-900 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* Radial BG glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-600/5 blur-3xl rounded-full"></div>
          
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-full border-2 border-violet-500/20 object-cover bg-slate-950 p-1 group-hover:scale-105 transition-transform"
          />

          <h3 className="text-sm font-bold text-slate-100 mt-4">{name}</h3>
          <p className="text-xs text-slate-500 mt-1">{email}</p>
          
          <div className="flex items-center gap-1.5 mt-3">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${user?.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/60'}`}>
              {user?.role}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-slate-900 mt-6 w-full text-left">
            Need role adjustments? Organizations are managed by Administrators. Reach out to coordinate settings.
          </div>
        </div>

        {/* Edit Info Form */}
        <div className="glass-card p-6 border-slate-900/60 lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3">Update Personal Details</h3>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email (Readonly)</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input type="email" value={email} className="w-full glass-input pl-10 cursor-not-allowed" readOnly />
                </div>
              </div>
            </div>

            {/* Avatar picker grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Modify Profile Avatar Seed</label>
              <div className="flex flex-wrap gap-2.5 bg-slate-950/30 border border-slate-900/60 p-3 rounded-xl">
                {avatarSeeds.map((seed) => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border transition-all cursor-pointer ${
                        avatar === url ? 'border-violet-500 scale-110 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={url} alt={seed} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* Secure password modification */}
          <div className="border-t border-slate-900 pt-6 mt-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-violet-400" />
              Secure Security Credentials
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
