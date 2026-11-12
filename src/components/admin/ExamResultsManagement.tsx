import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  Plus,
  Printer,
  X,
  Search,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Save,
  Trophy,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { Examination, ExamResult, Student, SchoolClass, Subject, SubjectScore } from '../../types/database.types';

export const ExamResultsManagement: React.FC = () => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Selection states
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('Grade 10');
  const [activeTab, setActiveTab] = useState<'results' | 'entry' | 'exams'>('results');

  // Printable Report Card Modal
  const [cardToPrint, setCardToPrint] = useState<ExamResult | null>(null);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // New Exam Form
  const [examForm, setExamForm] = useState({
    title: 'Winter Comprehensive Examination 2026',
    term: 'Final Term' as 'Mid Term' | 'Final Term' | 'First Quarter' | 'Pre-Board',
    academic_year: '2026-2027',
    start_date: '2026-12-10',
    end_date: '2026-12-22',
  });

  // Marks Entry Form state: studentId -> { scores: Record<subjectName, number> }
  const [marksState, setMarksState] = useState<Record<string, Record<string, number>>>({});
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const loadData = async () => {
    const [e, r, s, c, sub] = await Promise.all([
      db.exams.getAll(),
      db.exams.getResults(),
      db.students.getAll(),
      db.classes.getAll(),
      db.subjects.getAll(),
    ]);
    setExams(e);
    setResults(r);
    setStudents(s);
    setClasses(c);
    setSubjects(sub);
    if (!selectedExamId && e.length > 0) {
      setSelectedExamId(e[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsubE = subscribeToTable('examinations', loadData);
    const unsubR = subscribeToTable('exam_results', loadData);
    return () => {
      unsubE();
      unsubR();
    };
  }, []);

  const classStudents = students.filter((s) => s.class_name === selectedClass);
  const classSubjects = subjects.filter((sb) => sb.class_name === selectedClass);
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Grade calculation helper
  const calculateGradeAndGpa = (pct: number): { grade: string; gpa: number } => {
    if (pct >= 93) return { grade: 'A+', gpa: 4.0 };
    if (pct >= 85) return { grade: 'A', gpa: 3.75 };
    if (pct >= 78) return { grade: 'B+', gpa: 3.3 };
    if (pct >= 70) return { grade: 'B', gpa: 3.0 };
    if (pct >= 60) return { grade: 'C', gpa: 2.0 };
    return { grade: 'F', gpa: 0.0 };
  };

  // Prepopulate marks state when opening marks entry
  useEffect(() => {
    const initialMarks: Record<string, Record<string, number>> = {};
    classStudents.forEach((student) => {
      initialMarks[student.id] = {};
      const existingResult = results.find((r) => r.exam_id === selectedExamId && r.student_id === student.id);

      classSubjects.forEach((sub) => {
        const foundScore = existingResult?.subject_scores.find((s) => s.subject_name === sub.name);
        initialMarks[student.id][sub.name] = foundScore ? foundScore.obtained_marks : 85;
      });
    });
    setMarksState(initialMarks);
  }, [selectedClass, selectedExamId, students, results, subjects]);

  const handleMarkChange = (studentId: string, subjectName: string, val: number) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectName]: Math.min(100, Math.max(0, val)),
      },
    }));
  };

  const handleSaveAllMarks = async () => {
    if (!currentExam) return;

    for (const student of classStudents) {
      const studentMarks = marksState[student.id] || {};
      const subjectScores: SubjectScore[] = classSubjects.map((sub) => {
        const obtained = studentMarks[sub.name] || 0;
        const subPct = (obtained / sub.full_marks) * 100;
        const { grade } = calculateGradeAndGpa(subPct);
        return {
          subject_id: sub.id,
          subject_name: sub.name,
          max_marks: sub.full_marks,
          obtained_marks: obtained,
          grade,
        };
      });

      const totalMarks = subjectScores.reduce((acc, c) => acc + c.max_marks, 0);
      const obtainedMarks = subjectScores.reduce((acc, c) => acc + c.obtained_marks, 0);
      const percentage = totalMarks > 0 ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2)) : 0;
      const { grade, gpa } = calculateGradeAndGpa(percentage);

      await db.exams.saveResult({
        exam_id: currentExam.id,
        exam_title: currentExam.title,
        student_id: student.id,
        student_name: student.name,
        roll_number: student.roll_number,
        registration_number: student.registration_number,
        class_id: student.class_id,
        class_name: student.class_name,
        section_id: student.section_id,
        section_name: student.section_name,
        subject_scores: subjectScores,
        total_marks: totalMarks,
        obtained_marks: obtainedMarks,
        percentage,
        grade,
        gpa,
        remarks:
          percentage >= 90
            ? 'Outstanding performance with Highest Honors.'
            : percentage >= 80
            ? 'Commendable academic effort across all examinations.'
            : 'Satisfactory standing; continued focus encouraged.',
      });
    }

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 4000);
    loadData();
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.exams.create({
      title: examForm.title,
      term: examForm.term,
      academic_year: examForm.academic_year,
      start_date: examForm.start_date,
      end_date: examForm.end_date,
      is_published: true,
    });
    setIsAddExamOpen(false);
    loadData();
  };

  // Filtered results
  const filteredResults = results.filter(
    (r) => (selectedExamId ? r.exam_id === selectedExamId : true) && (selectedClass ? r.class_name === selectedClass : true)
  );

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Examinations & Student Performance</h2>
            <p className="text-xs text-slate-500">Record student marks, auto-calculate GPA & grades, and generate result cards.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                activeTab === 'results' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Class Results
            </button>
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                activeTab === 'entry' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Enter Marks Sheet
            </button>
            <button
              onClick={() => setIsAddExamOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Exam</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Select Examination Cycle:</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Select Academic Grade:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isSavedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Student marks and calculated grades saved to Supabase successfully!</span>
        </div>
      )}

      {/* VIEW 1: RESULTS DIRECTORY */}
      {activeTab === 'results' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll #</th>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Obtained</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4">GPA</th>
                  <th className="py-3 px-4 text-right">Result Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No results found for {selectedClass}. Switch to "Enter Marks Sheet" to compute grades!
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{r.student_name}</td>
                      <td className="py-3 px-4 font-mono">{r.roll_number}</td>
                      <td className="py-3 px-4 font-mono text-sky-700">{r.registration_number}</td>
                      <td className="py-3 px-4">{r.total_marks}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.obtained_marks}</td>
                      <td className="py-3 px-4 font-semibold text-sky-700">{r.percentage}%</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">{r.grade}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{r.gpa.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setCardToPrint(r)}
                          className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold rounded-md flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Card</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: MARKS ENTRY SHEET */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h3 className="text-base font-bold text-slate-900">Marks Entry Matrix: {selectedClass}</h3>
              <p className="text-xs text-slate-500">
                Enter scores out of 100 for each subject course. Percentage, letter grade and GPA compute automatically.
              </p>
            </div>
            <button
              onClick={handleSaveAllMarks}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Calculate All Results</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll #</th>
                  {classSubjects.map((sub) => (
                    <th key={sub.id} className="py-2.5 px-3">
                      {sub.name} (Max {sub.full_marks})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{st.name}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{st.roll_number}</td>
                    {classSubjects.map((sub) => {
                      const val = marksState[st.id]?.[sub.name] ?? 85;
                      return (
                        <td key={sub.id} className="py-2 px-3">
                          <input
                            type="number"
                            min={0}
                            max={sub.full_marks}
                            value={val}
                            onChange={(e) => handleMarkChange(st.id, sub.name, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center focus:ring-1 focus:ring-sky-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create New Examination Cycle</h3>
              <button onClick={() => setIsAddExamOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Examination Title *</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Term</label>
                  <select
                    value={examForm.term}
                    onChange={(e) => setExamForm({ ...examForm, term: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final Term">Final Term</option>
                    <option value="First Quarter">First Quarter</option>
                    <option value="Pre-Board">Pre-Board</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={examForm.academic_year}
                    onChange={(e) => setExamForm({ ...examForm, academic_year: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={examForm.start_date}
                    onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={examForm.end_date}
                    onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Create Exam Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL STUDENT RESULT CARD MODAL */}
      {cardToPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Action Bar */}
            <div className="p-4 bg-slate-100 border-b flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Official Student Report Card</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report Card</span>
                </button>
                <button
                  onClick={() => setCardToPrint(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Report Card Sheet */}
            <div id="printable-area" className="p-8 space-y-6 text-slate-900 bg-white">
              {/* Institution Title */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Teen School Academy</h2>
                <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                  Academic Progress & Evaluation Transcript
                </div>
                <div className="text-xs text-slate-500">
                  {cardToPrint.exam_title} · Academic Year 2026-2027
                </div>
              </div>

              {/* Student Identification Strip */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{cardToPrint.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Number:</span>
                  <span className="font-mono font-bold text-sky-700">{cardToPrint.registration_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Class & Section:</span>
                  <span className="font-semibold">{cardToPrint.class_name} · {cardToPrint.section_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Roll Number:</span>
                  <span className="font-mono font-bold">{cardToPrint.roll_number}</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <table className="w-full text-xs text-left">
                <thead className="border-b-2 border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="py-2">Course Subject</th>
                    <th className="py-2 text-center">Max Marks</th>
                    <th className="py-2 text-center">Obtained</th>
                    <th className="py-2 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {cardToPrint.subject_scores.map((score, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-medium">{score.subject_name}</td>
                      <td className="py-2.5 text-center text-slate-500">{score.max_marks}</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{score.obtained_marks}</td>
                      <td className="py-2.5 text-right font-bold text-sky-700">{score.grade}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-900 font-bold">
                  <tr>
                    <td className="py-3">Aggregate Total:</td>
                    <td className="py-3 text-center text-slate-600">{cardToPrint.total_marks}</td>
                    <td className="py-3 text-center text-slate-900">{cardToPrint.obtained_marks}</td>
                    <td className="py-3 text-right text-emerald-700 text-sm font-extrabold">{cardToPrint.grade}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs p-3 bg-sky-50 rounded-xl border border-sky-100 tabular-nums">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Percentage</span>
                  <span className="text-base font-extrabold text-sky-800">{cardToPrint.percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cumulative GPA</span>
                  <span className="text-base font-extrabold text-sky-800">{cardToPrint.gpa.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cohort Rank</span>
                  <span className="text-base font-extrabold text-sky-800">
                    {cardToPrint.rank ? `#${cardToPrint.rank}` : 'Top 5%'}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div className="text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Faculty Remarks:</span>
                <p className="italic text-slate-600">"{cardToPrint.remarks}"</p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
                <div className="text-center">
                  <div className="border-b border-slate-400 w-32 pb-1 mb-1" />
                  <span>Class Teacher</span>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-32 pb-1 mb-1" />
                  <span>Dr. Evelyn Vance (Principal)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
