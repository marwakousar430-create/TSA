import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  Building,
  CreditCard,
  CalendarCheck,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Plus,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Student, Teacher, SchoolClass, FeeRecord, AttendanceRecord, AdmissionInquiry } from '../../types/database.types';
import { AdminTab } from './AdminLayoutComponents';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddStudent: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateTab,
  onOpenAddStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionInquiry[]>([]);

  const loadData = async () => {
    const [s, t, c, f, a, adm] = await Promise.all([
      db.students.getAll(),
      db.teachers.getAll(),
      db.classes.getAll(),
      db.fees.getRecords(),
      db.attendance.getAll(),
      db.admissions.getAll(),
    ]);
    setStudents(s);
    setTeachers(t);
    setClasses(c);
    setFeeRecords(f);
    setAttendance(a);
    setAdmissions(adm);
  };

  useEffect(() => {
    loadData();
    const unsubS = subscribeToTable('students', loadData);
    const unsubF = subscribeToTable('fee_records', loadData);
    const unsubA = subscribeToTable('attendance', loadData);
    const unsubAdm = subscribeToTable('admissions', loadData);
    return () => {
      unsubS();
      unsubF();
      unsubA();
      unsubAdm();
    };
  }, []);

  // Compute metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  const totalCollected = feeRecords.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0);
  const totalPending = feeRecords.reduce((acc, curr) => acc + Number(curr.balance_due || 0), 0);
  const totalBilled = totalCollected + totalPending;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const today = '2026-11-04';
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentCount = todayAttendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 95;

  const pendingAdmissions = admissions.filter((a) => a.status === 'Pending');

  const handleApproveAdmission = async (id: string) => {
    await db.admissions.updateStatus(id, 'Accepted');
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sky-200">
            <span>Autumn Term 2026-2027</span>
            <span>·</span>
            <span>All Systems Nominal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Dr. Evelyn Vance
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            School operational metrics are actively syncing with your Supabase database. You have {pendingAdmissions.length} pending admission inquiries requiring review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddStudent}
            className="px-4 py-2.5 text-xs font-bold text-sky-950 bg-white hover:bg-sky-50 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-sky-600/80 hover:bg-sky-600 rounded-xl border border-white/20 transition-colors cursor-pointer"
          >
            Mark Daily Attendance
          </button>
        </div>
      </div>

      {/* 8 STATISTIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalStudents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-700">Active</span>
            <span>·</span>
            <span>Across 6 grade cohorts</span>
          </div>
        </div>

        {/* Stat 2: Total Teachers */}
        <div
          onClick={() => onNavigateTab('teachers')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Faculty Staff</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalTeachers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            100% Certified Specialists
          </div>
        </div>

        {/* Stat 3: Total Classes */}
        <div
          onClick={() => onNavigateTab('classes')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Classes & Sections</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalClasses}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            12 Operational Sections
          </div>
        </div>

        {/* Stat 4: Today's Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {presentCount} of {todayAttendance.length || totalStudents} Present
          </div>
        </div>

        {/* Stat 5: Fee Collected */}
        <div
          onClick={() => onNavigateTab('fees')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Total Fee Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
            ${totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {collectionRate}% Collection Rate
          </div>
        </div>

        {/* Stat 6: Pending Fees */}
        <div
          onClick={() => onNavigateTab('fees')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Pending / Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums">
            ${totalPending.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Due for November 2026
          </div>
        </div>

        {/* Stat 7: Admissions Inquiries */}
        <div
          onClick={() => onNavigateTab('admissions')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Admissions Queue</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {admissions.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {pendingAdmissions.length} Awaiting Review
          </div>
        </div>

        {/* Stat 8: Active Exams */}
        <div
          onClick={() => onNavigateTab('exams')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Examination Cycle</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tabular-nums">
            Mid-Term
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Report cards ready to print
          </div>
        </div>
      </div>

      {/* Two Column Layout: Admissions Queue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Admissions Applications */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Online Admissions Inquiries</h3>
              <p className="text-xs text-slate-500">Live submissions received via public website application form</p>
            </div>
            <button
              onClick={() => onNavigateTab('admissions')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Manage All ({admissions.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {admissions.slice(0, 4).map((inq) => (
              <div key={inq.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inq.student_name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-sky-700 font-semibold">{inq.applying_for_class}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inq.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inq.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Parent: {inq.father_name} · {inq.guardian_phone} · {inq.guardian_email}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {inq.status === 'Pending' && (
                    <button
                      onClick={() => handleApproveAdmission(inq.id)}
                      className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer"
                    >
                      Accept
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateTab('admissions')}
                    className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Shortcuts & Fee Progress */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fee Collection Progress */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Fee Ledger Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Total Collected</span>
                <span className="tabular-nums">${totalCollected.toLocaleString()} / ${totalBilled.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{collectionRate}% Collected</span>
                <span>${totalPending.toLocaleString()} Remaining</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('fees')}
              className="w-full py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg cursor-pointer transition-colors"
            >
              Open Fee Management & Receipts
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">Administrative Shortcuts</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={onOpenAddStudent}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 flex items-center justify-between text-slate-700 transition-colors cursor-pointer text-left font-medium"
              >
                <span>➕ Add New Student Record</span>
                <span className="text-slate-400">→</span>
              </button>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 flex items-center justify-between text-slate-700 transition-colors cursor-pointer text-left font-medium"
              >
                <span>📋 Mark Student Attendance</span>
                <span className="text-slate-400">→</span>
              </button>
              <button
                onClick={() => onNavigateTab('exams')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 flex items-center justify-between text-slate-700 transition-colors cursor-pointer text-left font-medium"
              >
                <span>🎓 Generate Result Report Cards</span>
                <span className="text-slate-400">→</span>
              </button>
              <button
                onClick={() => onNavigateTab('notices')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 flex items-center justify-between text-slate-700 transition-colors cursor-pointer text-left font-medium"
              >
                <span>📢 Publish School Notice</span>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
