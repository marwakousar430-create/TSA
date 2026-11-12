import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  Camera,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Student, SchoolClass, Section, StudentStatus } from '../../types/database.types';

export const StudentManagement: React.FC<{ isOpenAddDefault?: boolean; onCloseAddDefault?: () => void }> = ({
  isOpenAddDefault,
  onCloseAddDefault,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'roll' | 'reg' | 'date'>('roll');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(isOpenAddDefault || false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    father_name: '',
    date_of_birth: '2011-04-12',
    gender: 'Male',
    class_id: '',
    class_name: 'Grade 9',
    section_id: '',
    section_name: 'Section A (Blue)',
    roll_number: '',
    registration_number: '',
    contact_number: '',
    parent_contact: '',
    address: '',
    admission_date: new Date().toISOString().split('T')[0],
    photo_url: '',
    status: 'Active',
    blood_group: 'O+',
  });

  const loadData = async () => {
    const [s, c, sec] = await Promise.all([
      db.students.getAll(),
      db.classes.getAll(),
      db.sections.getAll(),
    ]);
    setStudents(s);
    setClasses(c);
    setSections(sec);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToTable('students', loadData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpenAddDefault) {
      setIsAddModalOpen(true);
    }
  }, [isOpenAddDefault]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesQuery =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.father_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = classFilter === 'All' || s.class_name === classFilter;
        const matchesSection = sectionFilter === 'All' || s.section_name === sectionFilter;
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesQuery && matchesClass && matchesSection && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'roll') return a.roll_number.localeCompare(b.roll_number);
        if (sortBy === 'reg') return a.registration_number.localeCompare(b.registration_number);
        return new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime();
      });
  }, [students, searchQuery, classFilter, sectionFilter, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Auto-generate next registration number
  const generateNextRegNumber = () => {
    const year = new Date().getFullYear();
    const nextNum = 1000 + students.length + 1;
    return `TSA-${year}-${nextNum}`;
  };

  const handleOpenAddModal = () => {
    const defaultCls = classes[0]?.name || 'Grade 9';
    const defaultSec = sections.find((s) => s.class_name === defaultCls)?.name || 'Section A (Blue)';
    setFormData({
      name: '',
      father_name: '',
      date_of_birth: '2011-04-12',
      gender: 'Male',
      class_id: classes[0]?.id || '',
      class_name: defaultCls,
      section_id: '',
      section_name: defaultSec,
      roll_number: String(1000 + students.length + 1).slice(-4),
      registration_number: generateNextRegNumber(),
      contact_number: '+1 (555) 000-0000',
      parent_contact: '+1 (555) 000-0001',
      address: 'Oakwood Academic District',
      admission_date: new Date().toISOString().split('T')[0],
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      status: 'Active',
      blood_group: 'O+',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.father_name) return;

    if (editingStudent) {
      await db.students.update(editingStudent.id, formData);
      setEditingStudent(null);
    } else {
      await db.students.create({
        name: formData.name || '',
        father_name: formData.father_name || '',
        date_of_birth: formData.date_of_birth || '2011-01-01',
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        class_id: formData.class_id || classes.find((c) => c.name === formData.class_name)?.id || 'cls-010',
        class_name: formData.class_name || 'Grade 10',
        section_id: formData.section_id || 'sec-10a',
        section_name: formData.section_name || 'Section A (Blue)',
        roll_number: formData.roll_number || '1010',
        registration_number: formData.registration_number || generateNextRegNumber(),
        contact_number: formData.contact_number || '',
        parent_contact: formData.parent_contact || '',
        address: formData.address || '',
        admission_date: formData.admission_date || new Date().toISOString().split('T')[0],
        photo_url: formData.photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        status: (formData.status as StudentStatus) || 'Active',
        blood_group: formData.blood_group,
      });
      setIsAddModalOpen(false);
      if (onCloseAddDefault) onCloseAddDefault();
    }
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deletingStudentId) {
      await db.students.delete(deletingStudentId);
      setDeletingStudentId(null);
      loadData();
    }
  };

  // Export to CSV Functionality
  const handleExportCSV = () => {
    const headers = [
      'Registration Number',
      'Name',
      'Father Name',
      'Gender',
      'Date of Birth',
      'Class',
      'Section',
      'Roll Number',
      'Contact',
      'Parent Contact',
      'Address',
      'Admission Date',
      'Status',
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.registration_number}"`,
      `"${s.name}"`,
      `"${s.father_name}"`,
      `"${s.gender}"`,
      `"${s.date_of_birth}"`,
      `"${s.class_name}"`,
      `"${s.section_name}"`,
      `"${s.roll_number}"`,
      `"${s.contact_number}"`,
      `"${s.parent_contact}"`,
      `"${s.address}"`,
      `"${s.admission_date}"`,
      `"${s.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Teen_School_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Search, Filters, CSV and Add Student */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, reg #, roll #..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-sky-500"
            >
              <option value="roll">Roll Number</option>
              <option value="name">Student Name</option>
              <option value="reg">Registration #</option>
              <option value="date">Admission Date</option>
            </select>
          </div>

          <span className="ml-auto text-slate-500 tabular-nums">
            Showing {filteredStudents.length} Students
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Reg #</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No student records matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-400">DOB: {s.date_of_birth} · {s.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-700 font-semibold">{s.registration_number}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{s.class_name}</span>
                      <span className="text-[11px] text-slate-500 block">{s.section_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums">{s.roll_number}</td>
                    <td className="py-3 px-4">
                      <div>{s.father_name}</div>
                      <div className="text-[11px] text-slate-400">{s.parent_contact}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">{s.contact_number}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'Suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingStudent(s)}
                          title="View Profile"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          title="Edit Student"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(s.id)}
                          title="Delete Student"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scaleUp">
            <div className="bg-sky-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">
                  {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Academy Student'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                  if (onCloseAddDefault) onCloseAddDefault();
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Class *</label>
                  <select
                    value={formData.class_name}
                    onChange={(e) => {
                      const selClass = classes.find((c) => c.name === e.target.value);
                      setFormData({
                        ...formData,
                        class_name: e.target.value,
                        class_id: selClass?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Section *</label>
                  <select
                    value={formData.section_name}
                    onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Section A (Blue)">Section A (Blue)</option>
                    <option value="Section B (Gold)">Section B (Gold)</option>
                    <option value="Section A (Alpha)">Section A (Alpha)</option>
                    <option value="Section B (Beta)">Section B (Beta)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Parent Emergency Contact</label>
                  <input
                    type="tel"
                    value={formData.parent_contact}
                    onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Home Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Photograph Image URL</label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                    if (onCloseAddDefault) onCloseAddDefault();
                  }}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT PROFILE MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleUp">
            <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-6 text-white relative">
              <button
                onClick={() => setViewingStudent(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={viewingStudent.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={viewingStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{viewingStudent.name}</h3>
                  <div className="text-xs text-sky-200 font-mono">{viewingStudent.registration_number}</div>
                  <div className="text-xs font-semibold text-sky-100 mt-1">
                    {viewingStudent.class_name} · {viewingStudent.section_name}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Roll Number:</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingStudent.roll_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Enrollment Status:</span>
                  <span className="font-bold text-emerald-700">{viewingStudent.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender & Blood Group:</span>
                  <span className="font-medium text-slate-800">{viewingStudent.gender} · {viewingStudent.blood_group || 'O+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Birth:</span>
                  <span className="font-medium text-slate-800">{viewingStudent.date_of_birth}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 w-28">Father's Name:</span>
                  <span>{viewingStudent.father_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-semibold text-slate-800 w-24">Parent Contact:</span>
                  <span>{viewingStudent.parent_contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-semibold text-slate-800 w-24">Student Phone:</span>
                  <span>{viewingStudent.contact_number || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800 w-24 shrink-0">Address:</span>
                  <span>{viewingStudent.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-semibold text-slate-800 w-24">Admission Date:</span>
                  <span>{viewingStudent.admission_date}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Delete Student Record?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This will remove the student from active rosters and historical attendance records in Supabase.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
