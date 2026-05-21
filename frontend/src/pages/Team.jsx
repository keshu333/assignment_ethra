import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Shield,
  Loader2,
  Settings,
  Plus
} from 'lucide-react';

const Team = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    password: 'password123', // Default temporary credentials
    role: 'member',
    avatar: '',
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      setMembers(res.data.users || []);
    } catch (error) {
      showToast('Failed to load team list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await userService.updateRole(userId, newRole);
      if (res.data.success) {
        showToast('Member role updated successfully!', 'success');
        loadTeam();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating role', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the workspace? All their assigned projects and uncompleted tasks will be unassigned.')) {
      return;
    }

    try {
      const res = await userService.removeUser(userId);
      if (res.data.success) {
        showToast('Member removed from team', 'success');
        loadTeam();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error removing member', 'error');
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteData.name || !inviteData.email) {
      showToast('Please fill in required fields', 'warning');
      return;
    }

    try {
      setInviteLoading(true);
      // Auto-assign matching bot avatar based on name length
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${inviteData.name}`;
      
      // Simulate inviting: backend registers user normally
      const res = await userService.getUsers(); // checking first
      const dummyRes = await userService.updateRole; // verify
      
      // Call register flow for team invitation
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inviteData, avatar: avatarUrl }),
      });

      const data = await registerRes.json();
      if (data.success) {
        showToast(`Invited ${inviteData.name} successfully! Password: password123`, 'success');
        setInviteModalOpen(false);
        setInviteData({ name: '', email: '', password: 'password123', role: 'member', avatar: '' });
        loadTeam();
      } else {
        showToast(data.message || 'Invitation failed', 'error');
      }
    } catch (error) {
      showToast('Error registering new user', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-900/50 w-48 rounded-md animate-pulse"></div>
          <div className="h-10 bg-slate-900/50 w-32 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 glass-card border-slate-900/60 p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-800 w-32 rounded-md"></div>
                  <div className="h-3 bg-slate-800 w-24 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Team Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Manage organization team members, change workspace roles, and control access permissions.</p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-4.5 h-4.5" />
            Invite Member
          </button>
        )}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => {
          const isSelf = member._id === currentUser?._id;
          
          return (
            <div key={member._id} className="glass-card p-5 border-slate-900/60 glass-card-hover flex flex-col justify-between relative overflow-hidden group">
              {/* Member detail header */}
              <div className="flex items-start gap-4">
                <img
                  src={member.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={member.name}
                  className="w-12 h-12 rounded-full border border-violet-500/20 object-cover bg-slate-950"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {member.name}
                    {isSelf && <span className="text-[9px] bg-violet-600/10 text-violet-400 px-1 rounded">You</span>}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Lower panel: roles and adjustments */}
              <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-5">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  
                  {currentUser?.role === 'admin' && !isSelf ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-[10px] font-semibold text-violet-400 uppercase outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${member.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-400'}`}>
                      {member.role}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 font-medium">
                  Joined: {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Remove icon on hover */}
              {currentUser?.role === 'admin' && !isSelf && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="absolute top-3 right-3 hidden group-hover:flex p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                  title="Remove Member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card p-6 border-slate-850 shadow-2xl relative animate-fade-in">
            <h3 className="text-lg font-bold text-slate-100 mb-5 border-b border-slate-900 pb-3">
              Invite Team Member
            </h3>

            <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="jane@test.com"
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Workspace Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full glass-input text-xs"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <p className="text-[9px] text-slate-500 leading-normal bg-slate-900/10 p-2.5 rounded-lg border border-slate-900">
                Notice: Invited users are created immediately. They can sign in with their email and the default password: <span className="text-violet-400 font-bold">password123</span>. They can update their passwords anytime in Profile settings.
              </p>

              {/* Submit triggers */}
              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {inviteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
