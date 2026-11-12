import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Loader2,
  Database,
  Sparkles,
  Phone,
  Mail,
  User,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { db } from '../../lib/supabaseClient';
import { ADMISSION_DB_AI_PROMPT, ADMISSION_TABLE_SQL } from '../../lib/supabaseSchema';

interface AdmissionInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClass?: string;
}

export const AdmissionInquiryModal: React.FC<AdmissionInquiryModalProps> = ({
  isOpen,
  onClose,
  defaultClass = 'Grade 9',
}) => {
  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '2011-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    applying_for_class: defaultClass,
    academic_session: '2026-2027',
    previous_school: '',
    previous_grade_percentage: '',
    guardian_phone: '',
    guardian_email: '',
    emergency_contact: '',
    address: '',
    blood_group: 'O+',
    interests: ['STEM & Robotics'] as string[],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    appNumber: string;
    isSupabaseSynced?: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSqlPrompt, setShowSqlPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!formData.student_name || !formData.father_name || !formData.guardian_phone || !formData.guardian_email) {
        throw new Error('Please fill in all required fields (Student Name, Father Name, Phone, Email).');
      }

      const inquiry = await db.admissions.submit({
        student_name: formData.student_name,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        applying_for_class: formData.applying_for_class,
        academic_session: formData.academic_session,
        previous_school: formData.previous_school,
        previous_grade_percentage: formData.previous_grade_percentage,
        guardian_phone: formData.guardian_phone,
        guardian_email: formData.guardian_email,
        emergency_contact: formData.emergency_contact,
        address: formData.address,
        blood_group: formData.blood_group,
        interests: formData.interests,
        notes: formData.notes,
      });

      setSubmittedData({
        id: inquiry.id,
        appNumber: inquiry.application_number || `TSA-APP-2026-${inquiry.id.slice(0, 4)}`,
        isSupabaseSynced: inquiry.isSupabaseSynced,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      student_name: '',
      father_name: '',
      mother_name: '',
      date_of_birth: '2011-05-15',
      gender: 'Male',
      applying_for_class: defaultClass,
      academic_session: '2026-2027',
      previous_school: '',
      previous_grade_percentage: '',
      guardian_phone: '',
      guardian_email: '',
      emergency_contact: '',
      address: '',
      blood_group: 'O+',
      interests: ['STEM & Robotics'],
      notes: '',
    });
    onClose();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(ADMISSION_DB_AI_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const availableInterests = [
    'STEM & Robotics',
    'Competitive Athletics',
    'Visual & Performing Arts',
    'Debate & Model UN',
    'Computer Science & AI',
    'Music & Orchestra',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Apply Now – Student Admission Application</h3>
                <span className="bg-sky-400/20 text-sky-100 border border-sky-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Supabase Linked
                </span>
              </div>
              <p className="text-xs text-sky-100">Teen School Academy · Academic Session 2026–2027</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {submittedData ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-extrabold text-slate-900">Application Submitted to Supabase!</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your admission application has been registered in the database under reference token:
                </p>
                <div className="inline-block bg-sky-50 border border-sky-200 px-4 py-2 rounded-xl mt-2">
                  <span className="font-mono text-base font-extrabold text-sky-700">
                    {submittedData.appNumber}
                  </span>
                </div>
              </div>

              {/* Data Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-800">{formData.student_name}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Class Applied:</span>
                  <span className="font-semibold text-slate-800">{formData.applying_for_class}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Guardian Contact:</span>
                  <span className="text-slate-800 font-medium">{formData.guardian_phone}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Guardian Email:</span>
                  <span className="text-slate-800 font-medium">{formData.guardian_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Database Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Synchronized in admissions table</span>
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 max-w-md mx-auto">
                Our Admissions Committee reviews submissions daily. An invitation for diagnostic assessment and personal interview will be delivered to <span className="font-semibold text-slate-800">{formData.guardian_email}</span>.
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Done & Return to Portal
                </button>
              </div>
            </div>
          ) : (
            /* APPLICATION FORM */
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. STUDENT IDENTITY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <User className="w-4 h-4 text-sky-600" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    1. Student Applicant Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Student Full Name <span className="text-rose-500">*</span>
                    </label>
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
                    <label className="block font-medium text-slate-700 mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
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

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Applying for Class *</label>
                    <select
                      value={formData.applying_for_class}
                      onChange={(e) => setFormData({ ...formData, applying_for_class: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-semibold text-sky-800"
                    >
                      <option value="Grade 7">Grade 7 (Junior High)</option>
                      <option value="Grade 8">Grade 8 (Junior High)</option>
                      <option value="Grade 9">Grade 9 (Secondary Core)</option>
                      <option value="Grade 10">Grade 10 (Secondary Core)</option>
                      <option value="Grade 11 - STEM & Pre-Med">Grade 11 - STEM & Pre-Med</option>
                      <option value="Grade 12 - Advanced Placement">Grade 12 - Advanced Placement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. ACADEMIC BACKGROUND */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    2. Previous Academic Background
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Previous School Attended</label>
                    <input
                      type="text"
                      value={formData.previous_school}
                      onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                      placeholder="e.g. Cambridge Preparatory Academy"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Previous Grade / GPA / %</label>
                    <input
                      type="text"
                      value={formData.previous_grade_percentage}
                      onChange={(e) => setFormData({ ...formData, previous_grade_percentage: e.target.value })}
                      placeholder="e.g. 3.92 GPA or 94%"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PARENT & GUARDIAN CONTACT */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    3. Parent & Guardian Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Father / Primary Guardian Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      placeholder="e.g. Jonathan Taylor"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={formData.mother_name}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      placeholder="e.g. Catherine Taylor"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Primary Contact Phone <span className="text-rose-500">*</span>
                    </label>
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
                    <label className="block font-medium text-slate-700 mb-1">
                      Primary Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.guardian_email}
                      onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address, City, State, Postal code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Emergency Secondary Phone</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="+1 (555) 987-6543"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. EXTRACURRICULAR INTERESTS */}
              <div className="space-y-2">
                <label className="block font-medium text-slate-700">Special Talents & Extracurricular Interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. NOTES */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Additional Notes, Aspirations, or Scholarship Inquiries
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Share any special academic honors, scholarship requests, or specific goals..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Supabase Notice & Submission */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowSqlPrompt(!showSqlPrompt)}
                  className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{showSqlPrompt ? 'Hide Database Prompt' : 'Need Supabase AI Prompt / SQL?'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Application to Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Application Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Supabase AI Prompt Card */}
              {showSqlPrompt && (
                <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">Prompt for Supabase AI / Database Assistant</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPrompt ? 'Copied!' : 'Copy AI Prompt'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 max-h-40 overflow-y-auto">
                    {ADMISSION_DB_AI_PROMPT}
                  </pre>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
