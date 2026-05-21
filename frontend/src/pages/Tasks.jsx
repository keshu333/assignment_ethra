import React, { useState, useEffect } from 'react';
import { taskService, projectService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Search,
  Filter,
  KanbanSquare,
  List,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Trash2,
  Edit2,
  Calendar,
  User,
  Loader2,
  X,
  PlusCircle,
  Activity
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout View: 'kanban' | 'list'
  const [viewMode, setViewMode] = useState('kanban');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Task Details Panel/Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Create / Edit Form Modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignedTo: '',
    projectId: '',
    dueDate: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all resources
  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterProject) params.projectId = filterProject;
      if (filterPriority) params.priority = filterPriority;
      if (search) params.search = search;

      const [taskRes, projRes, teamRes] = await Promise.all([
        taskService.getTasks(params),
        projectService.getProjects(),
        userService.getUsers(),
      ]);

      setTasks(taskRes.data.tasks || []);
      setProjects(projRes.data.projects || []);
      setTeamMembers(teamRes.data.users || []);

      // If details drawer is open, refresh its data too
      if (selectedTask) {
        const updated = taskRes.data.tasks.find((t) => t._id === selectedTask._id);
        if (updated) setSelectedTask(updated);
      }
    } catch (error) {
      console.error('Error fetching tasks data:', error);
      showToast('Failed to load task details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterProject, filterPriority, search]);

  // Handle Drag Start
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle Drop
  const handleDrop = async (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      // Find task to check role limits
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      if (task.status === targetStatus) return;

      const res = await taskService.updateTask(taskId, { status: targetStatus });
      if (res.data.success) {
        showToast(`Task status updated to "${targetStatus}"`, 'success');
        loadData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating task status', 'error');
    }
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      assignedTo: teamMembers[0]?._id || '',
      projectId: projects[0]?._id || '',
      dueDate: '',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || '',
      projectId: task.projectId?._id || task.projectId || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      const res = await taskService.deleteTask(id);
      if (res.data.success) {
        showToast('Task deleted successfully', 'success');
        if (selectedTask?._id === id) setSelectedTask(null);
        loadData();
      }
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId || !formData.dueDate) {
      showToast('Please fill in required task fields', 'warning');
      return;
    }

    try {
      setFormLoading(true);
      if (editingTask) {
        // Edit Action
        const res = await taskService.updateTask(editingTask._id, formData);
        if (res.data.success) {
          showToast('Task updated successfully', 'success');
          setFormOpen(false);
          loadData();
        }
      } else {
        // Create Action
        const res = await taskService.createTask(formData);
        if (res.data.success) {
          showToast('Task created successfully', 'success');
          setFormOpen(false);
          loadData();
        }
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Error saving task', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setActionLoading(true);
      const res = await taskService.addComment(selectedTask._id, commentText);
      if (res.data.success) {
        showToast('Comment posted', 'success');
        setCommentText('');
        loadData();
      }
    } catch (error) {
      showToast('Failed to post comment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Add File Attachment
  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!attachmentName || !attachmentUrl) {
      showToast('Please fill in attachment details', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      const res = await taskService.addAttachment(selectedTask._id, {
        name: attachmentName,
        url: attachmentUrl,
      });
      if (res.data.success) {
        showToast('File attached successfully!', 'success');
        setAttachmentName('');
        setAttachmentUrl('');
        loadData();
      }
    } catch (error) {
      showToast('Failed to upload file link', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for quick click-to-move card status
  const handleMoveStatus = async (taskId, nextStatus) => {
    try {
      const res = await taskService.updateTask(taskId, { status: nextStatus });
      if (res.data.success) {
        showToast(`Moved to ${nextStatus}`, 'success');
        loadData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error moving task', 'error');
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 bg-slate-900/50 w-48 rounded-md animate-pulse"></div>
        <div className="h-12 bg-slate-900/50 w-full rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 glass-card animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Kanban Column definitions
  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
    { id: 'inprogress', title: 'In Progress', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
  ];

  return (
    <div className="flex-1 p-6 space-y-5 animate-fade-in overflow-y-auto max-h-[calc(100vh-4rem)] relative flex flex-col justify-start">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Task Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Assign, track, and collaborate on project deliverables.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/40 border border-slate-900">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === 'kanban' ? 'bg-slate-900 text-violet-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Kanban Board"
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-900 text-violet-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card p-4 border-slate-900/60 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by name or notes..."
            className="w-full glass-input pl-10"
          />
        </div>

        {/* Project filtering */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full md:w-48 glass-input text-xs"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="w-full md:w-36 glass-input text-xs"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start min-h-[500px]">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex flex-col h-full min-h-[450px] bg-slate-950/20 rounded-2xl border border-slate-900/50 p-4 space-y-4"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between p-3 border rounded-xl font-bold text-xs uppercase tracking-wider ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px]">{colTasks.length}</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[500px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 border border-dashed border-slate-900 rounded-xl text-slate-600 text-xs">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          onClick={() => setSelectedTask(task)}
                          className="glass-card p-4.5 border-slate-900/60 glass-card-hover cursor-grab active:cursor-grabbing relative overflow-hidden group select-none"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide truncate max-w-[70%]">
                              {task.projectId?.title || 'General Workspace'}
                            </span>
                            <span className={`badge-${task.priority}`}>{task.priority}</span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-200 mt-2 line-clamp-1 group-hover:text-violet-400 transition-colors">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-900/60">
                            {/* Deadline */}
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-400 animate-pulse' : ''}`} />
                              <span className={`text-[10px] font-medium ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Assignee */}
                            {task.assignedTo && (
                              <img
                                src={task.assignedTo.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                                alt={task.assignedTo.name}
                                className="w-5.5 h-5.5 rounded-full border border-violet-500/20 object-cover"
                                title={task.assignedTo.name}
                              />
                            )}
                          </div>

                          {/* Quick Action status shift buttons */}
                          <div className="absolute right-3.5 top-3.5 hidden group-hover:flex items-center gap-1 bg-slate-950/80 backdrop-blur border border-slate-900 rounded p-0.5">
                            {col.id !== 'todo' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveStatus(task._id, col.id === 'completed' ? 'inprogress' : 'todo');
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-slate-100"
                              >
                                ◀
                              </button>
                            )}
                            {col.id !== 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveStatus(task._id, col.id === 'todo' ? 'inprogress' : 'completed');
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-slate-100"
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View Mode */}
      {viewMode === 'list' && (
        <div className="glass-card border-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/20 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Task Title</th>
                  <th className="py-4 px-4">Project</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Assignee</th>
                  <th className="py-4 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                      No tasks found. Create a new task.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                    
                    const statusColors = {
                      todo: 'badge-todo',
                      inprogress: 'badge-inprogress',
                      completed: 'badge-completed',
                    };

                    return (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-900/20 cursor-pointer transition-colors group text-xs text-slate-300 font-medium"
                      >
                        <td className="py-4 px-6 font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
                          {task.title}
                        </td>
                        <td className="py-4 px-4 text-violet-400">{task.projectId?.title || 'General Workspace'}</td>
                        <td className="py-4 px-4">
                          <span className={`badge-${task.priority}`}>{task.priority}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={statusColors[task.status]}>{task.status}</span>
                        </td>
                        <td className="py-4 px-4">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={task.assignedTo.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                                alt={task.assignedTo.name}
                                className="w-5.5 h-5.5 rounded-full object-cover"
                              />
                              <span className="text-[11px] font-semibold">{task.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">Unassigned</span>
                          )}
                        </td>
                        <td className={`py-4 px-4 ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Details Right Panel Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          {/* Overlay Close Trigger */}
          <div className="flex-1" onClick={() => setSelectedTask(null)}></div>

          {/* Drawer Body */}
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-900 h-screen p-6 shadow-2xl overflow-y-auto animate-fade-in flex flex-col justify-between">
            <div>
              {/* Header Drawer */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className={`badge-${selectedTask.priority}`}>{selectedTask.priority}</span>
                  <span className="text-slate-500 text-xs">| Project Workspace: {selectedTask.projectId?.title || 'General'}</span>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & description */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-extrabold text-slate-100 leading-tight">
                    {selectedTask.title}
                  </h3>
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          handleOpenEdit(selectedTask);
                        }}
                        className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedTask._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 bg-slate-900/30 p-4 rounded-xl border border-slate-900/60 leading-relaxed">
                  {selectedTask.description || 'No description notes added to this task yet.'}
                </p>
              </div>

              {/* Assigned User and due date info cards */}
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="p-3 border border-slate-900 rounded-xl bg-slate-900/20 flex items-center gap-3">
                  <User className="w-4.5 h-4.5 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Assignee</span>
                    <span className="text-xs font-bold text-slate-200">
                      {selectedTask.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-slate-900 rounded-xl bg-slate-900/20 flex items-center gap-3">
                  <Calendar className="w-4.5 h-4.5 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Due Date</span>
                    <span className="text-xs font-bold text-slate-200">
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="border-t border-slate-900 pt-5 mt-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-violet-400" />
                  File Attachments ({selectedTask.attachments?.length || 0})
                </h4>

                <div className="space-y-2 mb-4">
                  {selectedTask.attachments?.map((at, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-900 bg-slate-950/40">
                      <span className="text-xs font-bold text-slate-300 truncate max-w-[60%]">{at.name}</span>
                      <a
                        href={at.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 hover:underline"
                      >
                        Download Link
                      </a>
                    </div>
                  ))}
                </div>

                {/* Add Attachment Form */}
                <form onSubmit={handleAddAttachment} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="File label (e.g. Logo Figma)"
                    className="flex-1 glass-input py-1.5 text-xs"
                    required
                  />
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="URL (http://...)"
                    className="flex-1 glass-input py-1.5 text-xs"
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="py-1.5 px-3 bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Activity Timeline Log */}
              <div className="border-t border-slate-900 pt-5 mt-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-violet-400" />
                  Task Log Activity
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-3.5 pr-2.5">
                  {selectedTask.activities?.map((act, i) => (
                    <div key={i} className="flex flex-col gap-0.5 border-l border-slate-900 pl-3">
                      <p className="text-[11px] text-slate-300 font-medium">
                        {act.user?.name || 'Someone'} <span className="text-slate-400">{act.text}</span>
                      </p>
                      <span className="text-[9px] text-slate-500">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-900 pt-5 mt-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  Comments ({selectedTask.comments?.length || 0})
                </h4>

                <div className="space-y-3 max-h-44 overflow-y-auto mb-4 pr-1">
                  {selectedTask.comments?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No comments posted yet.</p>
                  ) : (
                    selectedTask.comments?.map((comment) => (
                      <div key={comment._id} className="flex gap-2.5 items-start p-2.5 rounded-lg border border-slate-900 bg-slate-900/10">
                        <img
                          src={comment.user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                          alt={comment.user?.name}
                          className="w-6 h-6 rounded-full object-cover mt-0.5 border border-violet-500/10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-slate-300">{comment.user?.name}</span>
                            <span className="text-[9px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write comment..."
                    className="flex-1 glass-input py-2 text-xs"
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="py-2 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation / Editing Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-card p-6 border-slate-850 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100 mb-5 border-b border-slate-900 pb-3">
              {editingTask ? 'Modify Task Details' : 'Launch New Task'}
            </h3>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task Name"
                  className="w-full glass-input"
                  required
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Notes / Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add detailed task instructions..."
                  className="w-full glass-input min-h-[85px]"
                  rows="3"
                />
              </div>

              {/* Workspace project */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Project Workspace</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full glass-input"
                  required
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full glass-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full glass-input"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Member & Due date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Assign User</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full glass-input"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full glass-input"
                    required
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
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
                  {editingTask ? 'Save task updates' : 'Post Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
