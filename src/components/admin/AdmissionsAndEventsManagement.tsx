import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Plus,
  X,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { AdmissionInquiry, AdmissionStatus, SchoolEvent, GalleryItem } from '../../types/database.types';
import { ADMISSION_DB_AI_PROMPT, ADMISSION_TABLE_SQL } from '../../lib/supabaseSchema';

export const AdmissionsManagement: React.FC<{ onSwitchToStudents: () => void }> = ({ onSwitchToStudents }) => {
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [enrolledNotice, setEnrolledNotice] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const load = async () => {
    const data = await db.admissions.getAll();
    setInquiries(data);
  };

  useEffect(() => {
    load();
    const unsub = subscribeToTable('admissions', load);
    return () => unsub();
  }, []);

  const filtered = statusFilter === 'All' ? inquiries : inquiries.filter((i) => i.status === statusFilter);

  const handleStatusChange = async (id: string, status: AdmissionStatus) => {
    await db.admissions.updateStatus(id, status);
    load();
  };

  const handleEnrollAsStudent = async (inquiry: AdmissionInquiry) => {
    // Convert directly into students table!
    const regNumber = `TSA-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    await db.students.create({
      registration_number: regNumber,
      name: inquiry.student_name,
      father_name: inquiry.father_name,
      date_of_birth: inquiry.date_of_birth,
      gender: inquiry.gender,
      class_id: 'cls-010',
      class_name: inquiry.applying_for_class,
      section_id: 'sec-10a',
      section_name: 'Section A (Blue)',
      roll_number: String(Math.floor(1000 + Math.random() * 900)),
      contact_number: inquiry.guardian_phone,
      parent_contact: inquiry.guardian_phone,
      address: inquiry.address,
      admission_date: new Date().toISOString().split('T')[0],
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      status: 'Active',
      blood_group: inquiry.blood_group || 'O+',
    });

    await db.admissions.updateStatus(inquiry.id, 'Accepted', `Enrolled as official student with Reg #${regNumber}`);
    setEnrolledNotice(`Applicant ${inquiry.student_name} was successfully enrolled into ${inquiry.applying_for_class}!`);
    setTimeout(() => setEnrolledNotice(null), 5000);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this admission inquiry?')) {
      await db.admissions.delete(id);
      load();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Online Student Applications</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-800">
              Table: admissions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time applications submitted from the public "Apply Now" portal directly saved in Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setShowPromptModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>AI Prompt & SQL Schema</span>
          </button>

          <div className="flex items-center gap-1">
            {['All', 'Pending', 'Reviewed', 'Accepted', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  statusFilter === st ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {enrolledNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{enrolledNotice}</span>
          </div>
          <button onClick={onSwitchToStudents} className="text-sky-700 font-bold hover:underline">
            View Student Roster →
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Applicant Student</th>
                <th className="py-3 px-4">Applying Class</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No admission applications matching the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700 text-[11px]">
                      {inq.application_number || `TSA-${inq.id.slice(0, 6).toUpperCase()}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inq.student_name}</div>
                      <div className="text-[11px] text-slate-400">{inq.gender} · DOB: {inq.date_of_birth}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{inq.applying_for_class}</div>
                      {inq.academic_session && (
                        <div className="text-[11px] text-sky-600 font-normal">{inq.academic_session}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>F: {inq.father_name}</div>
                      {inq.mother_name && <div className="text-[11px] text-slate-400">M: {inq.mother_name}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{inq.guardian_phone}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{inq.guardian_email}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(inq.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value as any)}
                        className={`text-xs font-bold rounded px-2 py-1 border ${
                          inq.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : inq.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : inq.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inq.status !== 'Accepted' && (
                          <button
                            onClick={() => handleEnrollAsStudent(inq)}
                            title="Direct Enroll as Student into School Roster"
                            className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Enroll</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-md cursor-pointer"
                          title="View Full Application Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inq.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          title="Delete Application"
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
      </div>

      {/* VIEW INQUIRY MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Student Application File</h3>
                <span className="text-[11px] text-sky-700 font-mono font-semibold">
                  App #: {selectedInquiry.application_number || `TSA-${selectedInquiry.id.slice(0, 8)}`}
                </span>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-700">
              <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{selectedInquiry.student_name}</div>
                  <div className="text-[11px] text-sky-800">
                    Applying for: {selectedInquiry.applying_for_class} ({selectedInquiry.academic_session || '2026-2027'})
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                  selectedInquiry.status === 'Accepted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedInquiry.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {selectedInquiry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="font-semibold">{selectedInquiry.date_of_birth}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Gender & Blood Group</span>
                  <span className="font-semibold">{selectedInquiry.gender} · {selectedInquiry.blood_group || 'O+'}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block">Parent & Contact</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Father's Name:</span>
                  <span className="font-medium text-slate-900">{selectedInquiry.father_name}</span>
                </div>
                {selectedInquiry.mother_name && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Mother's Name:</span>
                    <span className="font-medium text-slate-900">{selectedInquiry.mother_name}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Guardian Phone:</span>
                  <span className="font-medium text-slate-900">{selectedInquiry.guardian_phone}</span>
                </div>
                {selectedInquiry.emergency_contact && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-medium text-slate-900">{selectedInquiry.emergency_contact}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Guardian Email:</span>
                  <span className="font-medium text-slate-900">{selectedInquiry.guardian_email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Residential Address:</span>
                  <span className="font-medium text-slate-900">{selectedInquiry.address || 'On file'}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block">Prior Academic Record</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Previous School:</span>
                  <span className="font-medium text-slate-900">{selectedInquiry.previous_school || 'Not specified'}</span>
                </div>
                {selectedInquiry.previous_grade_percentage && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Previous Score / GPA:</span>
                    <span className="font-medium text-emerald-700">{selectedInquiry.previous_grade_percentage}</span>
                  </div>
                )}
                {selectedInquiry.interests && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Extracurriculars:</span>
                    <span className="font-medium text-slate-900">
                      {Array.isArray(selectedInquiry.interests)
                        ? selectedInquiry.interests.join(', ')
                        : selectedInquiry.interests}
                    </span>
                  </div>
                )}
              </div>

              {selectedInquiry.notes && (
                <div className="pt-2 text-slate-600">
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold">Applicant Notes:</span>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 italic text-[11px]">
                    "{selectedInquiry.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-mono">UUID: {selectedInquiry.id}</span>
              <div className="flex gap-2">
                {selectedInquiry.status !== 'Accepted' && (
                  <button
                    onClick={() => {
                      handleEnrollAsStudent(selectedInquiry);
                      setSelectedInquiry(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enroll as Student</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase AI Prompt Modal for Admin */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Supabase Table AI Prompt & SQL</h3>
                  <p className="text-[11px] text-slate-500">Copy this prompt or query to initialize or update the table in Supabase.</p>
                </div>
              </div>
              <button onClick={() => setShowPromptModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            {/* AI Prompt */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">AI Database Prompt</span>
                <button
                  onClick={() => copyToClipboard(ADMISSION_DB_AI_PROMPT, 'prompt')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md cursor-pointer"
                >
                  {copiedType === 'prompt' ? 'Copied Prompt!' : 'Copy AI Prompt'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-slate-800">
                {ADMISSION_DB_AI_PROMPT}
              </pre>
            </div>

            {/* SQL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">Supabase SQL Editor Code</span>
                <button
                  onClick={() => copyToClipboard(ADMISSION_TABLE_SQL, 'sql')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md cursor-pointer"
                >
                  {copiedType === 'sql' ? 'Copied SQL!' : 'Copy SQL Script'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10.5px] rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-slate-800">
                {ADMISSION_TABLE_SQL}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const EventsGalleryManagement: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'gallery'>('events');

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddGalleryOpen, setIsAddGalleryOpen] = useState(false);

  // New Event Form
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Academic' as SchoolEvent['category'],
    event_date: new Date().toISOString().split('T')[0],
    event_time: '10:00 AM - 02:00 PM',
    location: 'Central Campus Auditorium',
    image_url: '',
    is_featured: false,
  });

  // New Gallery Form
  const [galForm, setGalForm] = useState({
    title: '',
    caption: '',
    category: 'Campus' as GalleryItem['category'],
    image_url: '',
  });

  const load = async () => {
    const [e, g] = await Promise.all([db.events.getAll(), db.gallery.getAll()]);
    setEvents(e);
    setGallery(g);
  };

  useEffect(() => {
    load();
    const unsubE = subscribeToTable('school_events', load);
    const unsubG = subscribeToTable('gallery', load);
    return () => {
      unsubE();
      unsubG();
    };
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.events.create(eventForm);
    setIsAddEventOpen(false);
    load();
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galForm.title || !galForm.image_url) return;
    await db.gallery.create({
      title: galForm.title,
      caption: galForm.caption,
      category: galForm.category,
      image_url: galForm.image_url,
      date_taken: new Date().toISOString().split('T')[0],
    });
    setIsAddGalleryOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
              activeSubTab === 'events' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            School Events ({events.length})
          </button>
          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
              activeSubTab === 'gallery' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Photo Gallery Items ({gallery.length})
          </button>
        </div>

        {activeSubTab === 'events' ? (
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddGalleryOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
        )}
      </div>

      {activeSubTab === 'events' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div key={evt.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-sky-700">{evt.category}</span>
                  <span>{evt.event_date}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{evt.description}</p>
                <div className="text-[11px] text-slate-500 mt-2">📍 {evt.location} · {evt.event_time}</div>
              </div>
              <div className="pt-3 border-t flex justify-end">
                <button
                  onClick={() => db.events.delete(evt.id).then(load)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.map((g) => (
            <div key={g.id} className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-700 uppercase">{g.category}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{g.title}</h4>
                </div>
                <button
                  onClick={() => db.gallery.delete(g.id).then(load)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add School Calendar Event</h3>
              <button onClick={() => setIsAddEventOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Ceremony">Ceremony</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={eventForm.event_time}
                    onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GALLERY MODAL */}
      {isAddGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Photo to Gallery</h3>
              <button onClick={() => setIsAddGalleryOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGallery} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={galForm.title}
                  onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                  placeholder="e.g. Annual Speech Day"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={galForm.category}
                  onChange={(e) => setGalForm({ ...galForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Campus">Campus</option>
                  <option value="Laboratories">Laboratories</option>
                  <option value="Sports">Sports</option>
                  <option value="Library">Library</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Achievements">Achievements</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={galForm.image_url}
                  onChange={(e) => setGalForm({ ...galForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Caption</label>
                <input
                  type="text"
                  value={galForm.caption}
                  onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGalleryOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
