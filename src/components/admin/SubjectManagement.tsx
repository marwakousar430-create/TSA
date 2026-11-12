import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Search, X } from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Subject, SchoolClass, Teacher } from '../../types/database.types';

export const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    class_name: 'Grade 10',
    teacher_name: '',
    full_marks: 100,
    pass_marks: 40,
  });

  const load = async () => {
    const [sub, cls, tch] = await Promise.all([
      db.subjects.getAll(),
      db.classes.getAll(),
      db.teachers.getAll(),
    ]);
    setSubjects(sub);
    setClasses(cls);
    setTeachers(tch);
  };

  useEffect(() => {
    load();
    const unsub = subscribeToTable('subjects', load);
    return () => unsub();
  }, []);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    const cl = classes.find((c) => c.name === form.class_name);
    const tc = teachers.find((t) => t.name === form.teacher_name);

    await db.subjects.create({
      name: form.name,
      code: form.code,
      class_id: cl?.id || 'cls-010',
      class_name: form.class_name,
      teacher_id: tc?.id,
      teacher_name: form.teacher_name,
      full_marks: form.full_marks,
      pass_marks: form.pass_marks,
    });
    setIsAddOpen(false);
    setForm({
      name: '',
      code: '',
      class_name: 'Grade 10',
      teacher_name: '',
      full_marks: 100,
      pass_marks: 40,
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subject from the curriculum?')) {
      await db.subjects.delete(id);
      load();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by name, code, class..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject Course</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Assigned Grade</th>
                <th className="py-3 px-4">Faculty Lead</th>
                <th className="py-3 px-4">Max Marks</th>
                <th className="py-3 px-4">Pass Threshold</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-sky-700">{s.code}</td>
                  <td className="py-3 px-4 font-medium">{s.class_name}</td>
                  <td className="py-3 px-4 text-slate-600">{s.teacher_name || 'Department Faculty'}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">{s.full_marks}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-emerald-700">{s.pass_marks}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUBJECT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Academic Course Subject</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Molecular Genetics & Biology"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIO-301"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
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
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Faculty Lead</label>
                <select
                  value={form.teacher_name}
                  onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Select Faculty Lead</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Marks</label>
                  <input
                    type="number"
                    value={form.full_marks}
                    onChange={(e) => setForm({ ...form, full_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    value={form.pass_marks}
                    onChange={(e) => setForm({ ...form, pass_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
