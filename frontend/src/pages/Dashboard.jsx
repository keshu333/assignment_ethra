import React, { useState, useEffect } from 'react';
import { projectService, taskService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState({
    projectsCount: 0,
    tasksCount: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    teamCount: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Load concurrent statistics
        const [projRes, taskRes, teamRes] = await Promise.all([
          projectService.getProjects(),
          taskService.getTasks(),
          userService.getUsers(),
        ]);

        const projects = projRes.data.projects || [];
        const tasks = taskRes.data.tasks || [];
        const team = teamRes.data.users || [];

        // Compute counts
        const totalProjects = projects.length;
        const totalTasks = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = tasks.filter(t => t.status !== 'completed').length;
        
        const now = new Date();
        const overdue = tasks.filter(t => {
          return t.status !== 'completed' && new Date(t.dueDate) < now;
        }).length;

        setStats({
          projectsCount: totalProjects,
          tasksCount: totalTasks,
          completedTasks: completed,
          pendingTasks: pending,
          overdueTasks: overdue,
          teamCount: team.length,
        });

        // Filter and assemble activities
        let allActivities = [];
        tasks.forEach(t => {
          if (t.activities) {
            t.activities.forEach(a => {
              allActivities.push({
                ...a,
                taskTitle: t.title,
                taskId: t._id,
              });
            });
          }
        });

        // Sort by date desc
        allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentActivities(allActivities.slice(0, 5));

        // Get 3 recent upcoming high priority tasks
        const todoTasks = tasks.filter(t => t.status !== 'completed');
        todoTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setRecentTasks(todoTasks.slice(0, 3));

      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        showToast('Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 bg-slate-900/50 w-48 rounded-md animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 glass-card border-slate-900/60 p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-800 w-16 rounded-md"></div>
              <div className="h-8 bg-slate-800 w-24 rounded-md"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 glass-card animate-pulse"></div>
          <div className="h-80 glass-card animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Stat item configuration
  const cardData = [
    { title: 'Total Projects', value: stats.projectsCount, icon: Briefcase, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { title: 'Total Tasks', value: stats.tasksCount, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Completed Tasks', value: stats.completedTasks, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Pending Tasks', value: stats.pendingTasks, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { title: 'Overdue Tasks', value: stats.overdueTasks, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  ];

  // Dynamic values for visual SVG charts
  const completionRate = stats.tasksCount ? Math.round((stats.completedTasks / stats.tasksCount) * 100) : 0;
  const strokeDash = 2 * Math.PI * 40; // radius = 40
  const dashOffset = strokeDash - (completionRate / 100) * strokeDash;

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{user?.name}</span> 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">Here is what is happening in your workspace today.</p>
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/projects"
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-violet-500/15 hover:shadow-violet-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {cardData.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className={`glass-card p-5 border flex flex-col justify-between h-28 relative overflow-hidden group ${item.bg}`}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</span>
                <IconComp className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="flex items-baseline mt-4 gap-1.5">
                <span className="text-2xl font-bold text-slate-100">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Tracker Card (Middle Ring) */}
        <div className="glass-card p-6 flex flex-col items-center justify-between border-slate-900 min-h-[300px]">
          <div className="w-full flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Analytics</span>
            <span className="badge-completed">Overall progress</span>
          </div>

          <div className="relative flex items-center justify-center my-4">
            {/* Circle SVG */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="40"
                className="stroke-slate-900"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="40"
                className="stroke-violet-500 transition-all duration-500 bg-glow-purple"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={strokeDash}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-100">{completionRate}%</span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full text-center mt-3 pt-3 border-t border-slate-900">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Remaining</span>
              <span className="text-md font-bold text-amber-400">{stats.pendingTasks} tasks</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Total Tracked</span>
              <span className="text-md font-bold text-slate-300">{stats.tasksCount} tasks</span>
            </div>
          </div>
        </div>

        {/* Priority workload Chart (SVG-based bar visualizer) */}
        <div className="glass-card p-6 flex flex-col justify-between border-slate-900 min-h-[300px]">
          <div className="w-full flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Priorities</span>
            <span className="badge-inprogress">Focus distribution</span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-5">
            {/* Low Priority bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Low Priority</span>
                <span className="text-slate-500">15%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500/80 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Medium Priority bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-400">Medium Priority</span>
                <span className="text-slate-500">45%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/80 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* High Priority bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400">High Priority</span>
                <span className="text-slate-500">40%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500/80 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-medium leading-relaxed mt-4 pt-3 border-t border-slate-900">
            Pro tip: Clear critical high priority overdue tasks to avoid dashboard alerts.
          </div>
        </div>

        {/* Team Members Count and Overview list */}
        <div className="glass-card p-6 flex flex-col border-slate-900 min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Priorities</span>
            <Link to="/tasks" className="text-violet-400 hover:text-violet-300 text-xs font-semibold flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-start gap-3.5">
            {recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 mb-2 text-slate-800" />
                <span className="text-xs font-medium">All caught up! No pending tasks.</span>
              </div>
            ) : (
              recentTasks.map((t) => (
                <div key={t._id} className="p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl hover:border-slate-800 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-100 truncate">{t.title}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                  <span className={`badge-${t.priority}`}>{t.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline and Logs */}
      <div className="glass-card p-6 border-slate-900">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400 animate-pulse" />
            Workspace Activity Log
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Real-time status updates</span>
        </div>

        <div className="relative border-l border-slate-900 pl-6 ml-3 space-y-5">
          {recentActivities.length === 0 ? (
            <div className="py-4 text-slate-500 text-xs">No recent actions recorded.</div>
          ) : (
            recentActivities.map((act, idx) => (
              <div key={idx} className="relative group">
                {/* Visual Dot indicator */}
                <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border border-slate-950 bg-violet-500 group-hover:scale-125 transition-transform"></span>
                <div>
                  <p className="text-xs text-slate-300 font-medium">
                    {act.user?.name || 'Someone'}{' '}
                    <span className="text-slate-400">{act.text}</span> on{' '}
                    <span className="text-violet-400 font-semibold">"{act.taskTitle}"</span>
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1.5">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
