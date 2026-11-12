import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Filter,
  Calendar,
  Users,
  BarChart3,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Student, SchoolClass, Section, AttendanceRecord, AttendanceStatus } from '../../types/database.types';

export const AttendanceManagement: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Selection states
  const [selectedClass, setSelectedClass] = useState<string>('Grade 10');
  const [selectedSection, setSelectedSection] = useState<string>('Section A (Blue)');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-04');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  // Daily student attendance map: studentId -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadAll = async () => {
    const [c, sec, s, a] = await Promise.all([
      db.classes.getAll(),
      db.sections.getAll(),
      db.students.getAll(),
      db.attendance.getAll(),
    ]);
    setClasses(c);
    setSections(sec);
    setStudents(s);
    setAttendanceRecords(a);
  };

  useEffect(() => {
    loadAll();
    const unsubA = subscribeToTable('attendance', loadAll);
    const unsubS = subscribeToTable('students', loadAll);
    return () => {
      unsubA();
      unsubS();
    };
  }, []);

  // Filter students for the selected class and section
  const classStudents = students.filter(
    (s) => s.class_name === selectedClass && (selectedSection === 'All' || s.section_name.includes(selectedSection.split(' ')[0]))
  );

  // Sync attendance map whenever selectedDate, selectedClass, or attendanceRecords changes
  useEffect(() => {
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    classStudents.forEach((student) => {
      const existing = attendanceRecords.find((a) => a.student_id === student.id && a.date === selectedDate);
      if (existing) {
        map[student.id] = { status: existing.status, remarks: existing.remarks || '' };
      } else {
        map[student.id] = { status: 'Present', remarks: '' };
      }
    });
    setAttendanceMap(map);
    setIsSavedNotice(false);
  }, [selectedDate, selectedClass, selectedSection, attendanceRecords, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remarks: '' }),
        status,
      },
    }));
    setIsSavedNotice(false);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Present' }),
        remarks,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = { status: 'Present', remarks: attendanceMap[s.id]?.remarks || '' };
    });
    setAttendanceMap(updated);
    setIsSavedNotice(false);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    const selClassObj = classes.find((c) => c.name === selectedClass);
    const selSectionObj = sections.find((sec) => sec.name === selectedSection);

    const batch = classStudents.map((student) => {
      const recordState = attendanceMap[student.id] || { status: 'Present' as AttendanceStatus, remarks: '' };
      return {
        student_id: student.id,
        student_name: student.name,
        roll_number: student.roll_number,
        class_id: selClassObj?.id || student.class_id,
        class_name: student.class_name,
        section_id: selSectionObj?.id || student.section_id,
        section_name: student.section_name,
        date: selectedDate,
        status: recordState.status,
        remarks: recordState.remarks,
        recorded_by: 'Dr. Evelyn Vance (Admin)',
      };
    });

    await db.attendance.saveBatch(batch);
    setIsSaving(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 4000);
  };

  // Metrics for today in the selected class
  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'Absent').length;
  const leaveCount = Object.values(attendanceMap).filter((v) => v.status === 'Leave').length;
  const lateCount = Object.values(attendanceMap).filter((v) => v.status === 'Late').length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Date Picker Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Attendance Ledger</h2>
            <p className="text-xs text-slate-500">Record daily attendance with automated duplicate prevention in Supabase.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                viewMode === 'daily' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily Roster
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                viewMode === 'monthly' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Monthly Summary Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Class Cohort:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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
            <label className="block font-semibold text-slate-600 mb-1">Section:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="All">All Sections</option>
              <option value="Section A (Blue)">Section A (Blue)</option>
              <option value="Section B (Gold)">Section B (Gold)</option>
              <option value="Section A (Alpha)">Section A (Alpha)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Attendance Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
            </input>
          </div>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <>
          {/* Quick Metrics & Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-semibold tabular-nums">
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Present: {presentCount}</span>
              <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">Absent: {absentCount}</span>
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">Leave: {leaveCount}</span>
              <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">Late: {lateCount}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                Mark All Present
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={isSaving || classStudents.length === 0}
                className="px-5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          {isSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Attendance ledger for {selectedClass} on {selectedDate} saved to Supabase successfully!</span>
            </div>
          )}

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Roll #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Registration #</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No students enrolled in {selectedClass} ({selectedSection}).
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student) => {
                      const currentStatus = attendanceMap[student.id]?.status || 'Present';
                      const currentRemarks = attendanceMap[student.id]?.remarks || '';

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold tabular-nums text-slate-900">
                            {student.roll_number}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={student.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                                alt={student.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-bold text-slate-900">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{student.registration_number}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {(['Present', 'Absent', 'Leave', 'Late'] as AttendanceStatus[]).map((st) => {
                                const isActive = currentStatus === st;
                                const colors: Record<AttendanceStatus, string> = {
                                  Present: isActive
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                                  Absent: isActive
                                    ? 'bg-rose-600 text-white font-bold'
                                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100',
                                  Leave: isActive
                                    ? 'bg-amber-600 text-white font-bold'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100',
                                  Late: isActive
                                    ? 'bg-sky-600 text-white font-bold'
                                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100',
                                };
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, st)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${colors[st]}`}
                                  >
                                    {st}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={currentRemarks}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="e.g. excused, medical, sports duty"
                              className="w-full max-w-xs px-2.5 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* MONTHLY REPORT SUMMARY */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Monthly Attendance Performance · {selectedClass}
            </h3>
            <span className="text-xs text-slate-500">Total Recorded Sessions: {attendanceRecords.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Roll #</th>
                  <th className="py-2.5 px-4">Present</th>
                  <th className="py-2.5 px-4">Absent</th>
                  <th className="py-2.5 px-4">Leave</th>
                  <th className="py-2.5 px-4">Late</th>
                  <th className="py-2.5 px-4">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
                {classStudents.map((st) => {
                  const studentRecords = attendanceRecords.filter((a) => a.student_id === st.id);
                  const p = studentRecords.filter((r) => r.status === 'Present').length;
                  const ab = studentRecords.filter((r) => r.status === 'Absent').length;
                  const l = studentRecords.filter((r) => r.status === 'Leave').length;
                  const lt = studentRecords.filter((r) => r.status === 'Late').length;
                  const total = studentRecords.length || 1;
                  const pct = Math.round((p / total) * 100);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{st.name}</td>
                      <td className="py-2.5 px-4 font-mono">{st.roll_number}</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">{p}</td>
                      <td className="py-2.5 px-4 text-rose-700 font-semibold">{ab}</td>
                      <td className="py-2.5 px-4 text-amber-700">{l}</td>
                      <td className="py-2.5 px-4 text-sky-700">{lt}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <span className={pct >= 85 ? 'text-emerald-700' : 'text-amber-700'}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
