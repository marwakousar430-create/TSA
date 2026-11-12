import React, { useEffect, useState } from 'react';
import {
  Users,
  Building,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  BookOpen,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Teacher, SchoolClass, Section, Subject } from '../../types/database.types';

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<Partial<Teacher>>({
    teacher_id_code: '',
    name: '',
    qualification: '',
    subject: '',
    assigned_classes: ['Grade 9', 'Grade 10'],
    phone: '',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
    salary: 4500,
    photo_url: '',
    status: 'Active',
    bio: '',
  });

  const loadData = async () => {
    const t = await db.teachers.getAll();
    setTeachers(t);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToTable('teachers', loadData);
    return () => unsub();
  }, []);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacher_id_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    const nextCode = `TSA-T00${teachers.length + 1}`;
    setFormData({
      teacher_id_code: nextCode,
      name: '',
      qualification: 'M.Sc. in Secondary Education',
      subject: 'Mathematics',
      assigned_classes: ['Grade 9', 'Grade 10'],
      phone: '+1 (555) 000-0000',
      email: '',
      joining_date: new Date().toISOString().split('T')[0],
      salary: 4500,
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      status: 'Active',
      bio: 'Dedicated academy educator focusing on adolescent critical thinking.',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.email) return;

    if (editingTeacher) {
      await db.teachers.update(editingTeacher.id, formData);
      setEditingTeacher(null);
    } else {
      await db.teachers.create({
        teacher_id_code: formData.teacher_id_code || `TSA-T00${teachers.length + 1}`,
        name: formData.name || '',
        qualification: formData.qualification || 'M.Ed.',
        subject: formData.subject || '',
        assigned_classes: formData.assigned_classes || ['Grade 9'],
        phone: formData.phone || '',
        email: formData.email || '',
        joining_date: formData.joining_date || new Date().toISOString().split('T')[0],
        salary: Number(formData.salary || 4000),
        photo_url: formData.photo_url || '',
        status: (formData.status as any) || 'Active',
        bio: formData.bio,
      });
      setIsAddModalOpen(false);
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this faculty record from Supabase?')) {
      await db.teachers.delete(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teachers by name, subject, ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Teacher ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Qualification</th>
                <th className="py-3 px-4">Assigned Cohorts</th>
                <th className="py-3 px-4">Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                        alt={t.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-sky-700">{t.teacher_id_code}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{t.subject}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{t.qualification}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {t.assigned_classes.map((cls, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold tabular-nums text-slate-800">
                    ${t.salary.toLocaleString()}/mo
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingTeacher(t)}
                        title="View Profile"
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeacher(t);
                          setFormData({ ...t });
                        }}
                        title="Edit Teacher"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        title="Delete Teacher"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT TEACHER MODAL */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="bg-sky-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Add Faculty Member'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teacher ID Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.teacher_id_code}
                    onChange={(e) => setFormData({ ...formData, teacher_id_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Primary Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Teacher Biography / Research Focus</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-semibold text-white bg-sky-600 hover:bg-sky-700"
                >
                  Save Faculty Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TEACHER PROFILE MODAL */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-sky-900 p-6 text-white relative">
              <button
                onClick={() => setViewingTeacher(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={viewingTeacher.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'}
                  alt={viewingTeacher.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{viewingTeacher.name}</h3>
                  <div className="text-xs text-sky-300">{viewingTeacher.subject}</div>
                  <div className="text-[11px] font-mono text-sky-200 mt-1">{viewingTeacher.teacher_id_code}</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800 block">Qualification:</span>
                  <span>{viewingTeacher.qualification}</span>
                </div>
                {viewingTeacher.bio && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Biography:</span>
                    <p className="italic text-slate-500">"{viewingTeacher.bio}"</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-800 block">Contact Information:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <span>{viewingTeacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>{viewingTeacher.phone}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span>Compensation:</span>
                  <span className="font-mono font-bold text-slate-900">${viewingTeacher.salary.toLocaleString()} / mo</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewingTeacher(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  const [classForm, setClassForm] = useState({
    name: '',
    numeric_order: 9,
    capacity: 40,
    class_teacher_name: '',
    room_number: 'Room 201',
    monthly_tuition_fee: 160,
  });

  const [sectionForm, setSectionForm] = useState({
    class_name: 'Grade 9',
    name: 'Section C',
    capacity: 35,
    room_number: '203',
  });

  const load = async () => {
    const [c, s, t] = await Promise.all([db.classes.getAll(), db.sections.getAll(), db.teachers.getAll()]);
    setClasses(c);
    setSections(s);
    setTeachers(t);
  };

  useEffect(() => {
    load();
    const unsubC = subscribeToTable('classes', load);
    const unsubS = subscribeToTable('sections', load);
    return () => {
      unsubC();
      unsubS();
    };
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name) return;
    await db.classes.create(classForm);
    setIsAddClassOpen(false);
    load();
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const cl = classes.find((c) => c.name === sectionForm.class_name);
    await db.sections.create({
      class_id: cl?.id || 'cls-009',
      class_name: sectionForm.class_name,
      name: sectionForm.name,
      capacity: sectionForm.capacity,
      room_number: sectionForm.room_number,
    });
    setIsAddSectionOpen(false);
    load();
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('Delete this class from Supabase? Associated students will need reassignment.')) {
      await db.classes.delete(id);
      load();
    }
  };

  const handleDeleteSection = async (id: string) => {
    await db.sections.delete(id);
    load();
  };

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Academic Grades & Section Architecture</h2>
          <p className="text-xs text-slate-500">Configure class capacities, assigned room allocations, and fee schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddSectionOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            + Add Section
          </button>
          <button
            onClick={() => setIsAddClassOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs cursor-pointer"
          >
            + Create New Class
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.class_id === cls.id || s.class_name === cls.name);
          return (
            <div key={cls.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-600 uppercase">Grade {cls.numeric_order}</span>
                  <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-emerald-700 block">${cls.monthly_tuition_fee}/mo</span>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Delete Class
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Room Allocation:</span>
                  <span className="font-semibold text-slate-800">{cls.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Class Teacher:</span>
                  <span className="font-semibold text-slate-800">{cls.class_teacher_name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Capacity:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{cls.capacity} students</span>
                </div>
              </div>

              {/* Sections in this class */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Assigned Sections:
                </span>
                <div className="space-y-1.5">
                  {classSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{sec.name}</span>
                        <span className="text-slate-400 text-[11px] block">Room {sec.room_number} · {sec.capacity} seats</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE CLASS MODAL */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create New Academic Class</h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 9 - Advanced"
                  value={classForm.name}
                  onChange={(e) => setFormDataClass('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Numeric Order (Grade #)</label>
                  <input
                    type="number"
                    value={classForm.numeric_order}
                    onChange={(e) => setFormDataClass('numeric_order', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setFormDataClass('capacity', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={classForm.room_number}
                    onChange={(e) => setFormDataClass('room_number', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Fee ($)</label>
                  <input
                    type="number"
                    value={classForm.monthly_tuition_fee}
                    onChange={(e) => setFormDataClass('monthly_tuition_fee', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Class Teacher</label>
                <select
                  value={classForm.class_teacher_name}
                  onChange={(e) => setFormDataClass('class_teacher_name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Select a Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SECTION MODAL */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Section to Class</h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSection} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Class *</label>
                <select
                  value={sectionForm.class_name}
                  onChange={(e) => setSectionForm({ ...sectionForm, class_name: e.target.value })}
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
                <label className="block font-medium text-slate-700 mb-1">Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section C (Emerald)"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={sectionForm.capacity}
                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Room #</label>
                  <input
                    type="text"
                    value={sectionForm.room_number}
                    onChange={(e) => setSectionForm({ ...sectionForm, room_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function setFormDataClass(field: string, val: any) {
    setClassForm((prev) => ({ ...prev, [field]: val }));
  }
};
