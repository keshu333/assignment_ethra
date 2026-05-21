import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Calendar = () => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await taskService.getTasks();
        setTasks(res.data.tasks || []);
      } catch (error) {
        showToast('Failed to load tasks for calendar', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Compute days of current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Prev month helper to pad grid
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create date grid array
  const calendarCells = [];

  // Pad previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Pad next month days to align perfect 6x7 grid (42 cells)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get tasks due on a specific date
  const getTasksForDate = (date) => {
    return tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Detail panel state for clicked day
  const [activeDate, setActiveDate] = useState(null);
  const activeTasks = activeDate ? getTasksForDate(activeDate) : [];

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 bg-slate-900/50 w-48 rounded-md animate-pulse"></div>
        <div className="h-[450px] glass-card animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Deadline Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-1">Keep track of important task deliverable dates across projects.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="py-2 px-4 rounded-xl border border-slate-900 bg-slate-900/40 text-xs font-semibold text-slate-300 hover:text-slate-100 cursor-pointer"
          >
            Today
          </button>
          
          <div className="flex items-center rounded-xl bg-slate-950/40 border border-slate-900 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 px-3.5 whitespace-nowrap min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Core Table Grid */}
        <div className="lg:col-span-3 glass-card p-6 border-slate-900/60 flex flex-col justify-start">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest pb-3 mb-2 border-b border-slate-900/60">
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {calendarCells.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.date);
              const isToday =
                new Date().getDate() === cell.date.getDate() &&
                new Date().getMonth() === cell.date.getMonth() &&
                new Date().getFullYear() === cell.date.getFullYear();
              
              const isSelected =
                activeDate &&
                activeDate.getDate() === cell.date.getDate() &&
                activeDate.getMonth() === cell.date.getMonth();

              return (
                <div
                  key={idx}
                  onClick={() => setActiveDate(cell.date)}
                  className={`
                    min-h-[75px] p-2 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden group
                    ${
                      cell.isCurrentMonth
                        ? 'bg-slate-950/20 border-slate-900 hover:border-slate-800'
                        : 'bg-slate-950/5 border-slate-950/50 text-slate-700 hover:border-slate-900/40'
                    }
                    ${isToday ? 'border-violet-500 bg-violet-600/5' : ''}
                    ${isSelected ? 'ring-2 ring-violet-500/80 border-violet-500' : ''}
                  `}
                >
                  {/* Number */}
                  <span className={`text-xs font-semibold ${isToday ? 'text-violet-400 font-bold' : cell.isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}`}>
                    {cell.day}
                  </span>

                  {/* Tasks indicators */}
                  <div className="flex flex-col gap-1 mt-1">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t._id}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate ${
                          t.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : t.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                            : 'bg-slate-850 text-slate-400 border border-slate-900'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[7.5px] font-semibold text-violet-400 text-right pl-1 pr-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected date sidebar details panel */}
        <div className="glass-card p-5 border-slate-900 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
              <CalendarIcon className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {activeDate ? activeDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
              </span>
            </div>

            {activeDate ? (
              <div className="space-y-3.5">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 space-y-2">
                    <Info className="w-7 h-7 mx-auto text-slate-800" />
                    <p className="text-xs font-medium">No deadlines on this day.</p>
                  </div>
                ) : (
                  activeTasks.map((t) => (
                    <div key={t._id} className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2 hover:border-slate-800 transition-colors">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-violet-400 uppercase truncate max-w-[65%]">{t.projectId?.title || 'General'}</span>
                        <span className={`badge-${t.priority}`}>{t.priority}</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{t.title}</h4>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-900">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{t.status}</span>
                        </div>

                        {t.assignedTo && (
                          <img
                            src={t.assignedTo.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                            alt={t.assignedTo.name}
                            className="w-4.5 h-4.5 rounded-full object-cover"
                            title={t.assignedTo.name}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs flex flex-col items-center gap-2">
                <Info className="w-6 h-6 text-slate-800 animate-bounce" />
                Click calendar grid cell to audit tasks.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-slate-900/60 mt-4">
            Highlighted day markers reflect priority distribution settings. Select dates to reveal complete timeline grids.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
