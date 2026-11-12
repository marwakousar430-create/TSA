import React, { useEffect, useState } from 'react';
import {
  BookMarked,
  BellRing,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Send,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Homework, SchoolNotice, SchoolClass, Subject } from '../../types/database.types';

export const HomeworkManagement: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    class_name: 'Grade 10',
    subject: 'English Literature',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    teacher_name: 'Sarah Jenkins',
  });

  const load = async () => {
    const [hw, c, s] = await Promise.all([db.homework.getAll(), db.classes.getAll(), db.subjects.getAll()]);
    setHomeworkList(hw);
    setClasses(c);
    setSubjects(s);
  };

  useEffect(() => {
    load();
    const unsub = subscribeToTable('homework', load);
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    const cl = classes.find((c) => c.name === form.class_name);
    await db.homework.create({
      title: form.title,
      description: form.description,
      class_id: cl?.id || 'cls-010',
      class_name: form.class_name,
      subject: form.subject,
      assigned_date: new Date().toISOString().split('T')[0],
      due_date: form.due_date,
      teacher_id: 'tch-001',
      teacher_name: form.teacher_name,
    });
    setIsAddOpen(false);
    setForm({
      title: '',
      description: '',
      class_name: 'Grade 10',
      subject: 'English Literature',
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      teacher_name: 'Sarah Jenkins',
    });
    load();
  };

  const handleDelete = async (id: string) => {
    await db.homework.delete(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Homework & Coursework Allocations</h2>
          <p className="text-xs text-slate-500">Assign curriculum exercises, lab prep work, and essay assignments by class.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Homework</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeworkList.map((hw) => (
          <div key={hw.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-sky-700">{hw.class_name}</span>
                <span className="font-medium text-amber-700">Due: {hw.due_date}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{hw.title}</h3>
              <div className="text-xs font-semibold text-slate-600 mt-1">{hw.subject}</div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{hw.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Assigned by {hw.teacher_name}</span>
              <button onClick={() => handleDelete(hw.id)} className="text-slate-400 hover:text-rose-600 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Assign Class Homework</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Homework Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Problem Set"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={form.class_name}
                    onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject Course *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigning Teacher</label>
                  <input
                    type="text"
                    value={form.teacher_name}
                    onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assignment Instructions *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed student instructions, formatting, and submission requirements..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const NoticesManagement: React.FC = () => {
  const [notices, setNotices] = useState<SchoolNotice[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Academic' as SchoolNotice['category'],
    audience: 'All' as SchoolNotice['audience'],
    priority: 'Normal' as SchoolNotice['priority'],
    is_published: true,
  });

  const load = async () => {
    const data = await db.notices.getAll();
    setNotices(data);
  };

  useEffect(() => {
    load();
    const unsub = subscribeToTable('notices', load);
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    await db.notices.create({
      title: form.title,
      content: form.content,
      category: form.category,
      audience: form.audience,
      priority: form.priority,
      is_published: form.is_published,
      published_date: new Date().toISOString().split('T')[0],
      author: 'Principal Office',
    });
    setIsAddOpen(false);
    setForm({
      title: '',
      content: '',
      category: 'Academic',
      audience: 'All',
      priority: 'Normal',
      is_published: true,
    });
    load();
  };

  const handleTogglePublish = async (notice: SchoolNotice) => {
    await db.notices.update(notice.id, { is_published: !notice.is_published });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this official bulletin from Supabase?')) {
      await db.notices.delete(id);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Official Notices & Bulletins</h2>
          <p className="text-xs text-slate-500">
            Publish school announcements. All published bulletins immediately appear on the public website.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Bulletin</span>
        </button>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{n.category}</span>
                <span>Date: {n.published_date}</span>
                <span>·</span>
                <span>Audience: {n.audience}</span>
                {n.priority === 'High' && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">Urgent</span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => handleTogglePublish(n)}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  n.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {n.is_published ? 'Published' : 'Draft'}
              </button>
              <button
                onClick={() => handleDelete(n.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                title="Delete bulletin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Post Official Bulletin</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Registration Open"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Exam">Exam</option>
                    <option value="Event">Event</option>
                    <option value="Urgent">Urgent</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Parents">Parents</option>
                    <option value="Teachers">Teachers</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">Urgent / High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Detailed announcement text..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="pub-check" className="text-slate-700 font-medium">
                  Publish to Public Website Immediately
                </label>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
