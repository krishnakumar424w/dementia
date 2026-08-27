import React, { useState, useEffect } from 'react';
import { ReminderItem, Role } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/audio';
import { 
  Bell, CheckCircle2, Circle, Clock, Plus, 
  Pill, Droplets, Footprints, Brain, Heart, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RemindersViewProps {
  patientId: string;
  userRole: Role;
  patientName: string;
}

const CATEGORY_ICONS = {
  medication: { icon: Pill, tag: 'Medication', badge: 'hd-badge-rose' },
  hydration: { icon: Droplets, tag: 'Hydration', badge: 'hd-badge-blue' },
  exercise: { icon: Footprints, tag: 'Mobility', badge: 'hd-badge-emerald' },
  cognitive: { icon: Brain, tag: 'Cognitive', badge: 'hd-badge-blue' },
  social: { icon: Heart, tag: 'Social', badge: 'hd-badge-amber' },
};

export const RemindersView: React.FC<RemindersViewProps> = ({
  patientId,
  userRole,
  patientName,
}) => {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('03:00 PM');
  const [newCategory, setNewCategory] = useState<ReminderItem['category']>('medication');
  const [newNotes, setNewNotes] = useState<string>('');

  const loadReminders = async () => {
    try {
      setLoading(true);
      const res = await api.getReminders(patientId);
      setReminders(res.reminders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [patientId]);

  const handleToggle = async (id: string) => {
    sounds.playMatchSuccess();
    try {
      setReminders(prev =>
        prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
      );
      await api.toggleReminder(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.createReminder({
        patientId,
        title: newTitle.trim(),
        time: newTime,
        category: newCategory,
        notes: newNotes,
        recurrence: 'daily',
      });
      if (res.reminder) {
        setReminders(prev => [...prev, res.reminder]);
        setIsAdding(false);
        setNewTitle('');
        setNewNotes('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const completedCount = reminders.filter(r => r.completed).length;

  return (
    <div className="w-full space-y-4">
      {/* Top Banner */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Daily Care Schedule & Medication Telemetry</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">SUBJECT: {(patientName || 'PATIENT').toUpperCase()}</span>
        </div>

        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Daily Health Routine & Care Reminders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated auditory alerts and task completion logging
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xs text-center font-mono">
              <span className="text-[9px] font-bold uppercase text-slate-500 block">Completed</span>
              <span className="text-sm font-extrabold text-slate-900">{completedCount} / {reminders.length}</span>
            </div>

            {(userRole === 'family' || userRole === 'nurse' || userRole === 'admin') && (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateReminder}
            className="hd-card shadow-2xs p-4 bg-white border border-slate-300 space-y-3"
          >
            <div className="hd-card-title flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Schedule New Care Reminder</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Title / Medication</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Afternoon Galantamine (8mg) & Glass of Water"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Scheduled Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 02:30 PM"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs font-mono"
                >
                  <option value="medication">💊 Medication</option>
                  <option value="hydration">💧 Hydration</option>
                  <option value="cognitive">🧠 Brain Drill</option>
                  <option value="exercise">🚶 Walk & Mobility</option>
                  <option value="social">❤️ Social Call</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Instructions / Dosage</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Take with warm meal..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-xs shadow-xs hover:bg-blue-700"
              >
                Save Schedule Item
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reminder Items List (Dense Card Table) */}
      <div className="hd-card shadow-2xs divide-y divide-slate-100 bg-white">
        {reminders.map((reminder) => {
          const categoryMeta = CATEGORY_ICONS[reminder.category] || CATEGORY_ICONS.medication;
          const CategoryIcon = categoryMeta.icon;

          return (
            <div
              key={reminder.id}
              onClick={() => handleToggle(reminder.id)}
              className={`p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                reminder.completed ? 'bg-slate-50/70 opacity-75' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xs bg-slate-100 text-slate-700 border border-slate-200">
                  <CategoryIcon className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-xs border border-blue-200 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{reminder.time}</span>
                    </span>
                    <span className={`hd-badge ${categoryMeta.badge}`}>
                      {categoryMeta.tag}
                    </span>
                  </div>

                  <h4 className={`text-xs font-bold mt-1 ${
                    reminder.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                  }`}>
                    {reminder.title}
                  </h4>

                  {reminder.notes && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{reminder.notes}</p>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {reminder.completed ? (
                  <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
