import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Download,
  FileCheck,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Trophy,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { db } from '../../lib/supabaseClient';
import { ADMISSION_DB_AI_PROMPT, ADMISSION_TABLE_SQL } from '../../lib/supabaseSchema';

export const AdmissionsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '2011-04-12',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    blood_group: 'O+',
    applying_for_class: 'Grade 9',
    academic_session: '2026–2027',
    previous_school: '',
    previous_grade_percentage: '',
    guardian_phone: '',
    emergency_contact: '',
    guardian_email: '',
    address: '',
    interests: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{ id: string; appNumber: string; isSynced?: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (!formData.student_name || !formData.father_name || !formData.guardian_phone || !formData.guardian_email) {
        throw new Error('Please fill in all mandatory fields marked with an asterisk (*).');
      }
      const record = await db.admissions.submit(formData);
      setSubmittedApp({
        id: record.id,
        appNumber: record.application_number || `TSA-APP-${record.id.slice(0, 8).toUpperCase()}`,
        isSynced: record.isSupabaseSynced,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Enrollment Portal</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Admissions at Teen School Academy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          We welcome ambitious, inquisitive teenagers for enrollment in Grades 7 through 12. Applications are reviewed holistically with academic aptitude, curiosity, and character.
        </p>
      </div>

      {/* 4 Step Process */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 text-center">Four Simple Steps to Join Our Community</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Submit Online Inquiry</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Complete the digital application form below. Data is submitted directly to our admissions office.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Transcript Review</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Submit previous 2 years' report cards, standardized test scores, and teacher recommendation letters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Aptitude & Interview</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Candidate participates in an informal conversational interview and short math/English diagnostic.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900">Formal Admission</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Receive official acceptance package, register for classes, and attend the new scholar orientation.
            </p>
          </div>
        </div>
      </div>

      {/* Tuition & Fee Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Annual Tuition & Academic Fee Schedule (2026–2027)</h2>
          <p className="text-xs text-slate-500 mt-1">Transparent all-inclusive rates with monthly installment schedules.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Class Level</th>
                <th className="py-3 px-4">Monthly Tuition</th>
                <th className="py-3 px-4">Science / Tech Fee</th>
                <th className="py-3 px-4">Athletics & Activities</th>
                <th className="py-3 px-4">Annual Total</th>
                <th className="py-3 px-4">Scholarships Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Grade 7 & 8 (Junior High)</td>
                <td className="py-3 px-4 font-semibold text-sky-700">$140 / mo</td>
                <td className="py-3 px-4">$150 / yr</td>
                <td className="py-3 px-4">$100 / yr</td>
                <td className="py-3 px-4 font-bold">$1,930 / yr</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">Up to 30% Merit</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Grade 9 & 10 (Secondary Core)</td>
                <td className="py-3 px-4 font-semibold text-sky-700">$165 / mo</td>
                <td className="py-3 px-4">$200 / yr</td>
                <td className="py-3 px-4">$150 / yr</td>
                <td className="py-3 px-4 font-bold">$2,330 / yr</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">Up to 40% Merit</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Grade 11 & 12 (AP & Pre-Med STEM)</td>
                <td className="py-3 px-4 font-semibold text-sky-700">$210 / mo</td>
                <td className="py-3 px-4">$350 / yr</td>
                <td className="py-3 px-4">$150 / yr</td>
                <td className="py-3 px-4 font-bold">$3,020 / yr</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">Up to 50% STEM Fellowships</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Live Application Form */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50/50 rounded-3xl border border-sky-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Official Apply Now Portal · Live Supabase Database</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Apply Now – Student Admission Application
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Submit full student credentials directly to our Supabase database table (<code className="font-mono bg-sky-100/70 text-sky-800 px-1 py-0.5 rounded text-[11px]">admissions</code>). Your application is instantly processed with a unique application number.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPromptModal(true)}
            className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold text-sky-700 bg-white border border-sky-300 hover:bg-sky-50 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Supabase AI Prompt & Schema</span>
          </button>
        </div>

        {submittedApp ? (
          <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm text-center space-y-5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your admission data has been securely saved in the Supabase <code className="font-mono text-sky-700">admissions</code> table.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Application Number:</span>
                <span className="font-mono font-bold text-sky-700 text-sm tracking-wide">{submittedApp.appNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Database Record ID:</span>
                <span className="font-mono text-slate-700 text-[11px] truncate max-w-[200px]">{submittedApp.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Target Class:</span>
                <span className="font-semibold text-slate-900">{formData.applying_for_class}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Storage Engine:</span>
                <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                  submittedApp.isSynced ? 'text-emerald-700' : 'text-sky-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {submittedApp.isSynced ? 'Connected to Cloud Supabase' : 'Active Local Database & Sync'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  setSubmittedApp(null);
                  setFormData({
                    student_name: '',
                    father_name: '',
                    mother_name: '',
                    date_of_birth: '2011-04-12',
                    gender: 'Male',
                    blood_group: 'O+',
                    applying_for_class: 'Grade 9',
                    academic_session: '2026–2027',
                    previous_school: '',
                    previous_grade_percentage: '',
                    guardian_phone: '',
                    emergency_contact: '',
                    guardian_email: '',
                    address: '',
                    interests: '',
                    notes: '',
                  });
                }}
                className="px-5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg cursor-pointer"
              >
                Submit Another Application
              </button>
              <button
                type="button"
                onClick={() => setShowPromptModal(true)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Supabase AI Prompt</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Student Information */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>1. Student Identity & Program</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="e.g. Maya Elizabeth Taylor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Applying for Class *</label>
                  <select
                    value={formData.applying_for_class}
                    onChange={(e) => setFormData({ ...formData, applying_for_class: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Grade 7">Grade 7 (Middle School)</option>
                    <option value="Grade 8">Grade 8 (Middle School)</option>
                    <option value="Grade 9">Grade 9 (Freshman)</option>
                    <option value="Grade 10">Grade 10 (Sophomore)</option>
                    <option value="Grade 11 - STEM & Pre-Med">Grade 11 - STEM & Pre-Med Track</option>
                    <option value="Grade 12 - Advanced Placement">Grade 12 - Advanced Placement (AP)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={formData.academic_session}
                    onChange={(e) => setFormData({ ...formData, academic_session: e.target.value })}
                    placeholder="2026–2027"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
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
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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
            </div>

            {/* Section 2: Previous Academic Background */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>2. Previous Academic Background</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Previous School Attended</label>
                  <input
                    type="text"
                    value={formData.previous_school}
                    onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                    placeholder="e.g. St. Matthews Preparatory Academy"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Previous Grade Percentage / GPA</label>
                  <input
                    type="text"
                    value={formData.previous_grade_percentage}
                    onChange={(e) => setFormData({ ...formData, previous_grade_percentage: e.target.value })}
                    placeholder="e.g. 91.5% or 3.85 GPA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Parent & Contact Details */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>3. Parents & Emergency Contact Details</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    placeholder="e.g. Richard Taylor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    placeholder="e.g. Eleanor Taylor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Guardian Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Emergency Alternate Contact</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="+1 (555) 987-6543"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Guardian Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, State, Zip Code"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Talents & Notes */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sky-600" />
                  <span>4. Talents, Interests & Statement</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Extracurricular Interests / Sports / Arts</label>
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="e.g. Robotics, Violin, Varsity Soccer, Debate"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Additional Notes / Special Accommodations</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific academic goals or medical notes..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Data connects directly to Supabase table <code className="font-mono text-sky-700">admissions</code></span>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Supabase...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Apply Now – Submit Student Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal for AI Prompt & Schema */}
        {showPromptModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Supabase Table Prompt & SQL Schema</h3>
                    <p className="text-[11px] text-slate-500">Copy this prompt to create or migrate the student admissions table in Supabase.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  ✕
                </button>
              </div>

              {/* AI Prompt Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">1. AI Prompt for Database Architect</span>
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

              {/* Direct SQL Code Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">2. SQL Query for Supabase SQL Editor</span>
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

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-[11px] leading-relaxed">
                <strong>How to run in Supabase:</strong> Open your Supabase Dashboard &gt; <strong>SQL Editor</strong> &gt; click <strong>New Query</strong> &gt; paste the SQL script &gt; click <strong>Run</strong>. The table will immediately handle submissions from this form.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer"
                >
                  Close & Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AchievementsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Scholastic Pride</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Student Achievements & Collegiate Honors
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Celebrating the exceptional milestones of our scholars across academic competitions, national STEM challenges, debate tournaments, and varsity athletics.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-amber-700 uppercase">National Champions</span>
          <h3 className="text-lg font-bold text-slate-900">National High School Science Olympiad</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Grade 11 & 12 STEM scholars took 1st place overall in Optics, Robotics Prototyping, and Microbe Genetics out of 140 competing secondary schools.
          </p>
          <div className="text-[11px] text-slate-400 font-medium">Awarded: May 2026 · Washington D.C.</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-sky-700 uppercase">Collegiate Distinction</span>
          <h3 className="text-lg font-bold text-slate-900">14 National Merit Semifinalists</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Over 22% of our Grade 12 senior class placed in the top 1% of PSAT/NMSQT test-takers across the western United States.
          </p>
          <div className="text-[11px] text-slate-400 font-medium">Class of 2026 Official Recognition</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase">Athletic Title</span>
          <h3 className="text-lg font-bold text-slate-900">State Track & Field Gold Medalists</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Academy 4x400m relay varsity team set a new regional record of 3:18.42, capturing the Division-I State Championship banner.
          </p>
          <div className="text-[11px] text-slate-400 font-medium">Varsity Athletics · State Championships</div>
        </div>
      </div>

      {/* College Matriculation Roster */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-wider uppercase text-sky-400">Class of 2025 & 2026 Matriculation</span>
          <h2 className="text-2xl font-bold text-white">Where Our Graduates Thrive</h2>
          <p className="text-xs text-slate-400">Our alumni gain entrance into the most selective universities in the world.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-semibold">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">Harvard University</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">Stanford University</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">MIT</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">Columbia University</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">UC Berkeley</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">Oxford University</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">Johns Hopkins</div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">UCLA</div>
        </div>
      </div>
    </div>
  );
};
