import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Search, Mail, Phone, GraduationCap, Building, Sparkles } from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { SchoolClass, Section, Teacher, Subject } from '../../types/database.types';

export const ClassesSectionsPage: React.FC<{ onNavigate: (page: string) => void; onOpenAdmissionModal: () => void }> = ({
  onNavigate,
  onOpenAdmissionModal,
}) => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, sec, sub] = await Promise.all([
        db.classes.getAll(),
        db.sections.getAll(),
        db.subjects.getAll(),
      ]);
      setClasses(c);
      setSections(sec);
      setSubjects(sub);
    };
    load();
    const unsubC = subscribeToTable('classes', load);
    const unsubS = subscribeToTable('sections', load);
    return () => {
      unsubC();
      unsubS();
    };
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Academic Structure</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Classes & Student Cohorts
        </h1>
        <p className="text-sm text-slate-500">
          Secondary grade levels, class sections, room allocations, and curriculum schedules across Teen School Academy.
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.class_id === cls.id || s.class_name === cls.name);
          const classSubjects = subjects.filter((sb) => sb.class_id === cls.id || sb.class_name === cls.name);

          return (
            <div
              key={cls.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-sky-600 uppercase">Grade {cls.numeric_order}</span>
                    <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-bold tabular-nums">
                    ${cls.monthly_tuition_fee}/mo
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Assigned Room:</span>
                    <span className="font-semibold text-slate-700">{cls.room_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Teacher:</span>
                    <span className="font-semibold text-slate-700">{cls.class_teacher_name || 'Assigned by Dean'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum Cohort Capacity:</span>
                    <span className="font-semibold text-slate-700 tabular-nums">{cls.capacity} Scholars</span>
                  </div>
                </div>

                {/* Sections list */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">Registered Sections:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {classSections.length > 0 ? (
                      classSections.map((sec) => (
                        <span key={sec.id} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                          {sec.name} ({sec.capacity} seats)
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sections A & B</span>
                    )}
                  </div>
                </div>

                {/* Core subjects */}
                {classSubjects.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-700 block mb-1">Key Curriculum Modules:</span>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-1">
                      {classSubjects.slice(0, 4).map((sub, idx) => (
                        <span key={sub.id}>
                          {sub.name}
                          {idx < Math.min(classSubjects.length, 4) - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={onOpenAdmissionModal}
                  className="w-full py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Apply for {cls.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TeachersDirectoryPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      const data = await db.teachers.getAll();
      setTeachers(data);
    };
    load();
    const unsub = subscribeToTable('teachers', load);
    return () => unsub();
  }, []);

  const subjectsList = ['All', ...Array.from(new Set(teachers.map((t) => t.subject.split('&')[0].trim())))];

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || t.subject.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Distinguished Faculty</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Mentors, Scholars & Educators
        </h1>
        <p className="text-sm text-slate-500">
          Our teachers hold advanced degrees from world-renowned universities and possess a shared passion for adolescent education.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name, qualification..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Discipline:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0">
                <img
                  src={teacher.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-sky-700">{teacher.teacher_id_code}</span>
                <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                <div className="text-xs font-semibold text-sky-700 mt-0.5">{teacher.subject}</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Qualification:</span>
                <span className="font-medium text-slate-800">{teacher.qualification}</span>
              </div>
              {teacher.bio && <p className="italic text-slate-500 text-[11px] leading-relaxed">"{teacher.bio}"</p>}
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Classes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.assigned_classes.map((cls, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">{teacher.email}</span>
              </div>
              <span className="text-emerald-700 font-semibold">{teacher.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
