import React, { useState, useEffect } from 'react';
import { projectService, userService, taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Briefcase,
  Calendar,
  Trash2,
  Edit2,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  FolderMinus
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    deadline: '',
    members: [],
  });

  const [formLoading, setFormLoading] = useState(false);

  // Fetch all resources concurrently
  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, teamRes, taskRes] = await Promise.all([
        projectService.getProjects(),
        userService.getUsers(),
        taskService.getTasks(),
      ]);

      setProjects(projRes.data.projects || []);
      setTeamMembers(teamRes.data.users || []);
      setTasks(taskRes.data.tasks || []);
    } catch (error) {
      console.error('Error loading projects resources:', error);
      showToast('Failed to fetch projects data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute tasks status count inside a project
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter((t) => t.projectId?._id === projectId || t.projectId === projectId);
    if (!projectTasks.length) return 0;
    const completed = projectTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      status: 'active',
      deadline: '',
      members: [user._id],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      deadline: project.deadline ? project.deadline.substring(0, 10) : '',
      members: project.members.map((m) => m._id),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be permanently removed.')) {
      return;
    }

    try {
      const res = await projectService.deleteProject(id);
      if (res.data.success) {
        showToast('Project deleted successfully', 'success');
        loadData();
      }
    } catch (error) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleMemberSelect = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      showToast('Please enter a title and deadline date', 'warning');
      return;
    }

    try {
      setFormLoading(true);
      if (editingProject) {
        // Edit Action
        const res = await projectService.updateProject(editingProject._id, formData);
        if (res.data.success) {
          showToast('Project updated successfully!', 'success');
          setModalOpen(false);
          loadData();
        }
      } else {
        // Create Action
        const res = await projectService.createProject(formData);
        if (res.data.success) {
          showToast('Project created successfully!', 'success');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Error saving project', 'error');
    } finally {
      setFormLoading(false);
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
            <div key={i} className="h-64 glass-card border-slate-900/60 p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-800 w-3/4 rounded-md"></div>
              <div className="h-12 bg-slate-800 w-full rounded-md"></div>
              <div className="h-4 bg-slate-800 w-1/2 rounded-md"></div>
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
          <h2 className="text-xl font-bold text-slate-100">Project Workspaces</h2>
          <p className="text-xs text-slate-400 mt-1">Manage and track your active, completed or hold-listed projects.</p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Create Project
          </button>
        )}
      </div>

      {/* Grid List */}
      {projects.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center max-w-xl mx-auto border-dashed border-slate-800">
          <FolderMinus className="w-16 h-16 text-slate-800 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            There are no projects assigned to you. Contact an administrator to create or invite you to a workspace.
          </p>
          {user?.role === 'admin' && (
            <button
              onClick={handleOpenCreate}
              className="mt-6 py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Create first Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = getProjectProgress(project._id);
            const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';
            
            // Status badges
            const statusBadges = {
              active: <span className="badge-inprogress">Active</span>,
              completed: <span className="badge-completed">Completed</span>,
              onhold: <span className="badge-todo">On Hold</span>,
            };

            return (
              <div key={project._id} className="glass-card p-6 border-slate-900/60 glass-card-hover flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
                {/* Visual Top Highlight strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.status === 'completed' ? 'from-emerald-500 to-teal-500' : project.status === 'onhold' ? 'from-amber-500 to-orange-500' : 'from-violet-500 to-fuchsia-500'}`}></div>

                <div>
                  {/* Title & Status */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-violet-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <div className="flex-shrink-0">{statusBadges[project.status]}</div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="my-5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                    <span>Task Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100
                          ? 'bg-emerald-500'
                          : project.status === 'onhold'
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-900/60 mt-2">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className={`text-[10px] font-medium ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                      Due: {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Team Avatars */}
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {project.members?.slice(0, 4).map((member, i) => (
                      <img
                        key={i}
                        className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-slate-950 object-cover border border-violet-500/20"
                        src={member.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=task'}
                        alt={member.name}
                        title={member.name}
                      />
                    ))}
                    {project.members?.length > 4 && (
                      <div className="flex items-center justify-center h-6.5 w-6.5 rounded-full ring-2 ring-slate-950 bg-slate-800 text-[9px] font-bold text-slate-400">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Admin Actions panel */}
                {user?.role === 'admin' && (
                  <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1 bg-slate-950/80 backdrop-blur border border-slate-850 p-1 rounded-lg shadow-lg">
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="p-1 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Creation / Editing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-card p-6 border-slate-850 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100 mb-5 border-b border-slate-900 pb-3">
              {editingProject ? 'Modify Project Workspace' : 'Launch New Project'}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Project Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Acme Redesign Project"
                  className="w-full glass-input"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline project milestones and deliverables..."
                  className="w-full glass-input min-h-[80px]"
                  rows="3"
                />
              </div>

              {/* Status & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full glass-input"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="onhold">On Hold</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Deadline Date</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full glass-input"
                    required
                  />
                </div>
              </div>

              {/* Assign team members */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Assign Team Members</label>
                <div className="max-h-40 overflow-y-auto bg-slate-950/40 border border-slate-900/60 rounded-xl p-2.5 space-y-1">
                  {teamMembers.map((member) => {
                    const isChecked = formData.members.includes(member._id);
                    return (
                      <div
                        key={member._id}
                        onClick={() => handleMemberSelect(member._id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-900/40 transition-colors ${
                          isChecked ? 'bg-violet-600/10 border border-violet-500/10' : 'border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                            alt={member.name}
                            className="w-6.5 h-6.5 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-slate-200 truncate">{member.name}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${isChecked ? 'bg-violet-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                          {isChecked ? 'Assigned' : 'Unassigned'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingProject ? 'Save updates' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
