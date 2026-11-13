import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Loader2,
  Database,
  Sparkles,
  Phone,
  User,
  BookOpen,
  Copy,
  Check,
  Upload,
  Bus,
  Calculator,
  FileCheck2,
  Search,
  Printer,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Save,
} from 'lucide-react';
import { db } from '../../lib/supabaseClient';
import { ADMISSION_DB_AI_PROMPT } from '../../lib/supabaseSchema';
import { AdmissionInquiry } from '../../types/database.types';
import {
  AVAILABLE_INTERESTS,
  REQUIRED_DOCUMENTS,
  SCHOLARSHIP_OPTIONS,
  TRANSPORT_ROUTES,
  calculateTuitionEstimate,
} from '../../lib/admissionHelpers';

interface AdmissionInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClass?: string;
}

const DRAFT_KEY = 'tsa_admission_modal_draft_v1';

export const AdmissionInquiryModal: React.FC<AdmissionInquiryModalProps> = ({
  isOpen,
  onClose,
  defaultClass = 'Grade 9',
}) => {
  const initialFormState = {
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
    student_photo_url: '',
    scholarship_type: 'None',
    transport_required: false,
    transport_route: TRANSPORT_ROUTES[0],
    documents_checklist: ['Birth Certificate / National ID Copy'] as string[],
    interests: ['STEM & Robotics'] as string[],
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState<'apply' | 'track'>('apply');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [draftRestored, setDraftRestored] = useState(false);

  // Photo Upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    appNumber: string;
    isSupabaseSynced?: boolean;
    estimatedFee: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSqlPrompt, setShowSqlPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Tracker state
  const [trackQuery, setTrackQuery] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackResults, setTrackResults] = useState<AdmissionInquiry[] | null>(null);

  // Feature: Restore Auto-Saved Draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.student_name || parsed.father_name || parsed.guardian_phone)) {
          setFormData((prev) => ({ ...prev, ...parsed }));
          setDraftRestored(true);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Auto-save Draft whenever formData changes
  useEffect(() => {
    if (submittedData) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // ignore quota errors
    }
  }, [formData, submittedData]);

  // Live Tuition & Scholarship Estimate
  const feeEstimate = useMemo(
    () =>
      calculateTuitionEstimate(
        formData.applying_for_class,
        formData.scholarship_type,
        formData.transport_required
      ),
    [formData.applying_for_class, formData.scholarship_type, formData.transport_required]
  );

  // Completion % Meter
  const completionPercent = useMemo(() => {
    const checks = [
      Boolean(formData.student_name.trim()),
      Boolean(formData.date_of_birth),
      Boolean(formData.applying_for_class),
      Boolean(formData.previous_school.trim()),
      Boolean(formData.father_name.trim()),
      Boolean(formData.guardian_phone.trim()),
      Boolean(formData.guardian_email.trim()),
      Boolean(formData.address.trim()),
      formData.documents_checklist.length > 0,
      formData.interests.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Photo must be smaller than 3MB.');
      return;
    }
    setErrorMessage(null);
    setIsUploadingPhoto(true);
    try {
      const url = await db.admissions.uploadPhoto(file);
      setFormData((prev) => ({ ...prev, student_photo_url: url }));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePreviousScoreChange = (val: string) => {
    setFormData((prev) => {
      const num = parseFloat(val);
      let suggestedScholarship = prev.scholarship_type;
      if (!isNaN(num)) {
        if (num >= 90 && prev.scholarship_type === 'None') {
          suggestedScholarship = 'Academic Merit (30%)';
        } else if (num >= 85 && prev.scholarship_type === 'None') {
          suggestedScholarship = 'Honor Roll (15%)';
        }
      }
      return { ...prev, previous_grade_percentage: val, scholarship_type: suggestedScholarship };
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
      };
    });
  };

  const toggleDocument = (doc: string) => {
    setFormData((prev) => {
      const exists = prev.documents_checklist.includes(doc);
      return {
        ...prev,
        documents_checklist: exists
          ? prev.documents_checklist.filter((d) => d !== doc)
          : [...prev.documents_checklist, doc],
      };
    });
  };

  const validateStep = (targetStep: number) => {
    setErrorMessage(null);
    if (targetStep > 1 && step === 1) {
      if (!formData.student_name.trim() || !formData.date_of_birth) {
        setErrorMessage('Please enter Student Full Name and Date of Birth before continuing.');
        return;
      }
    }
    if (targetStep > 3 && step === 3) {
      if (!formData.father_name.trim() || !formData.guardian_phone.trim() || !formData.guardian_email.trim()) {
        setErrorMessage('Please enter Father/Guardian Name, Phone, and Email before reviewing.');
        return;
      }
    }
    setStep(targetStep as 1 | 2 | 3 | 4);
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
        address: formData.address || 'On File',
        blood_group: formData.blood_group,
        student_photo_url: formData.student_photo_url,
        scholarship_type: formData.scholarship_type,
        estimated_monthly_fee: feeEstimate.netMonthlyFee,
        transport_required: formData.transport_required,
        transport_route: formData.transport_required ? formData.transport_route : undefined,
        documents_checklist: formData.documents_checklist,
        interests: formData.interests,
        notes: formData.notes,
      });

      localStorage.removeItem(DRAFT_KEY);
      setDraftRestored(false);

      setSubmittedData({
        id: inquiry.id,
        appNumber: inquiry.application_number || `TSA-APP-2026-${inquiry.id.slice(0, 4)}`,
        isSupabaseSynced: inquiry.isSupabaseSynced,
        estimatedFee: feeEstimate.netMonthlyFee,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(initialFormState);
    setDraftRestored(false);
    setStep(1);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData(initialFormState);
    setStep(1);
    onClose();
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setIsTracking(true);
    try {
      const results = await db.admissions.track(trackQuery);
      setTrackResults(results);
    } finally {
      setIsTracking(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(ADMISSION_DB_AI_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:static print:bg-white print:p-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-scaleUp max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-0">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Apply Now – Student Admission Portal</h3>
                <span className="bg-sky-400/20 text-sky-100 border border-sky-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Supabase Linked
                </span>
              </div>
              <p className="text-xs text-sky-100">Teen School Academy · 4-Step Application & Live Status Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs: Apply Online | Track Status */}
        {!submittedData && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'apply'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Student Application</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'track'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Existing Application</span>
              </button>
            </div>

            {activeTab === 'apply' && (
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <Save className="w-3 h-3" />
                  <span>{draftRestored ? 'Draft Restored' : 'Auto-Save Active'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  title="Reset form and clear saved draft"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'track' && !submittedData ? (
            /* FEATURE 6: LIVE APPLICATION STATUS TRACKER */
            <div className="space-y-5 py-2">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Track Application Status in Real Time</h4>
                <p className="text-xs text-slate-600">
                  Enter your generated Application Number (e.g. <code className="font-mono font-bold text-sky-700">TSA-APP-2026-XXXX</code>) or Guardian Email to check admissions review progress.
                </p>
                <form onSubmit={handleTrackSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="Enter Application Number or Guardian Email..."
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    {isTracking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Track Status</span>
                  </button>
                </form>
              </div>

              {trackResults !== null && (
                <div className="space-y-3">
                  {trackResults.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                      No application matched <span className="font-bold text-slate-800">"{trackQuery}"</span>. Verify your reference code or email and try again.
                    </div>
                  ) : (
                    trackResults.map((app) => (
                      <div key={app.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-mono font-bold text-sky-700 text-sm">
                              {app.application_number || `TSA-${app.id.slice(0, 6).toUpperCase()}`}
                            </span>
                            <h5 className="font-bold text-slate-900 text-sm mt-0.5">{app.student_name}</h5>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-xs ${
                              app.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Applying Class</span>
                            <span className="font-semibold text-slate-900">{app.applying_for_class}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Submitted Date</span>
                            <span className="font-semibold text-slate-900">
                              {new Date(app.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Guardian</span>
                            <span className="font-semibold text-slate-900">{app.father_name}</span>
                          </div>
                        </div>
                        {app.notes && (
                          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                            <span className="font-bold text-slate-800">Committee Note: </span>
                            {app.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : submittedData ? (
            /* FEATURE 7: PRINTABLE ADMISSION CONFIRMATION SLIP */
            <div className="py-2 space-y-5">
              <div className="text-center space-y-2 print:hidden">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-600">
                  Saved to Supabase <code className="font-mono text-sky-700">admissions</code> table. Print or save your confirmation slip below.
                </p>
              </div>

              {/* Printable Official Slip */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-4 text-xs shadow-xs">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Teen School Academy · Official Admission Slip
                    </div>
                    <h5 className="text-lg font-extrabold text-slate-900 mt-0.5">{formData.student_name}</h5>
                    <div className="font-mono font-bold text-sky-700 text-sm mt-1">
                      Ref #: {submittedData.appNumber}
                    </div>
                  </div>
                  {formData.student_photo_url ? (
                    <img
                      src={formData.student_photo_url}
                      alt={formData.student_name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-lg shrink-0">
                      {formData.student_name.slice(0, 2).toUpperCase() || 'TS'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applying Class</span>
                    <span className="font-bold text-slate-900">{formData.applying_for_class}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Academic Session</span>
                    <span className="font-semibold text-slate-900">{formData.academic_session}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Father / Guardian</span>
                    <span className="font-semibold text-slate-900">{formData.father_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Guardian Contact</span>
                    <span className="font-semibold text-slate-900">{formData.guardian_phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Scholarship Track</span>
                    <span className="font-semibold text-emerald-700">{formData.scholarship_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Monthly Tuition</span>
                    <span className="font-bold text-sky-700">${submittedData.estimatedFee} / mo</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">School Transport</span>
                    <span className="font-semibold text-slate-900">
                      {formData.transport_required ? formData.transport_route : 'Self Drop-off'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Storage Sync</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>{submittedData.isSupabaseSynced ? 'Cloud Supabase' : 'Synced Local DB'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Done & Return
                </button>
              </div>
            </div>
          ) : (
            /* MULTI-STEP GUIDED WIZARD */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Feature 1: Progress Stepper + Completion Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Step {step} of 4</span>
                  <span className="font-bold text-sky-700">{completionPercent}% Completed</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 transition-all duration-300"
                    style={{ width: `${Math.max(15, completionPercent)}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { num: 1, label: 'Identity & Photo' },
                    { num: 2, label: 'Academics & Fee' },
                    { num: 3, label: 'Parents & Bus' },
                    { num: 4, label: 'Docs & Review' },
                  ].map((item) => (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => validateStep(item.num)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate ${
                        step === item.num
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : step > item.num
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {item.num}. {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: STUDENT IDENTITY & PASSPORT PHOTO UPLOAD */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <User className="w-4 h-4 text-sky-600" />
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                      Step 1: Student Identity & Passport Photo
                    </h4>
                  </div>

                  {/* Feature 2: Student Photo Upload */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {formData.student_photo_url ? (
                        <img
                          src={formData.student_photo_url}
                          alt="Applicant preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="font-bold text-slate-800">Upload Student Passport Photograph</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        JPG or PNG up to 3MB. Automatically uploaded to Supabase Storage (<code className="font-mono">student-photos</code>).
                      </p>
                    </div>
                    <label className="px-3.5 py-2 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                      {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{formData.student_photo_url ? 'Change Photo' : 'Upload Photo'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
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
              )}

              {/* STEP 2: ACADEMICS & LIVE SCHOLARSHIP / TUITION CALCULATOR */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                      Step 2: Academic History & Scholarship Estimator
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
                      <label className="block font-medium text-slate-700 mb-1">Previous Percentage / Score (e.g. 92)</label>
                      <input
                        type="text"
                        value={formData.previous_grade_percentage}
                        onChange={(e) => handlePreviousScoreChange(e.target.value)}
                        placeholder="Enter % to auto-detect merit scholarship"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Feature 4: Scholarship & Live Monthly Fee Calculator */}
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50/60 border border-sky-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Calculator className="w-4 h-4 text-sky-600" />
                        <span>Live Tuition & Merit Scholarship Estimator</span>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700">{formData.applying_for_class}</span>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Select Scholarship / Financial Aid Category</label>
                      <select
                        value={formData.scholarship_type}
                        onChange={(e) => setFormData({ ...formData, scholarship_type: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
                      >
                        {SCHOLARSHIP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Base Tuition</span>
                        <span className="font-bold text-slate-900 text-sm">${feeEstimate.baseTuition}/mo</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-600 block">Scholarship ({feeEstimate.discountPercent}%)</span>
                        <span className="font-bold text-emerald-700 text-sm">-${feeEstimate.discountAmount}/mo</span>
                      </div>
                      <div className="p-2.5 bg-sky-600 rounded-xl text-white">
                        <span className="text-[10px] text-sky-100 block">Est. Net Fee</span>
                        <span className="font-extrabold text-sm">${feeEstimate.netMonthlyFee}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PARENTS, SCHOOL BUS TRANSPORT & INTERESTS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <Phone className="w-4 h-4 text-sky-600" />
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                      Step 3: Parents, Transport & Clubs
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Father / Primary Guardian *</label>
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
                      <label className="block font-medium text-slate-700 mb-1">Primary Contact Phone *</label>
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
                      <label className="block font-medium text-slate-700 mb-1">Primary Email Address *</label>
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
                        placeholder="Street address, City, State, Postal code"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Feature 5: School Bus Transport Route Selector */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Bus className="w-4 h-4 text-sky-600" />
                        <span>Campus School Bus Transport (+$45/mo)</span>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-sky-700">
                        <input
                          type="checkbox"
                          checked={formData.transport_required}
                          onChange={(e) => setFormData({ ...formData, transport_required: e.target.checked })}
                          className="w-4 h-4 accent-sky-600 rounded"
                        />
                        <span>Need Bus Service</span>
                      </label>
                    </div>
                    {formData.transport_required && (
                      <select
                        value={formData.transport_route}
                        onChange={(e) => setFormData({ ...formData, transport_route: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        {TRANSPORT_ROUTES.map((route) => (
                          <option key={route} value={route}>{route}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Clubs & Extracurriculars */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-700">Special Talents & Club Interests</label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_INTERESTS.map((interest) => {
                        const isSelected = formData.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}{interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENT CHECKLIST & FINAL REVIEW */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                      Step 4: Document Readiness & Final Review
                    </h4>
                  </div>

                  {/* Document Checklist */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <span className="font-bold text-slate-800 block">Admission Documents Ready for Verification:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {REQUIRED_DOCUMENTS.map((doc) => {
                        const checked = formData.documents_checklist.includes(doc);
                        return (
                          <label
                            key={doc}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDocument(doc)}
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                            <span className="text-[11px]">{doc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Additional Notes / Medical Accommodations</label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special academic achievements, medical notes, or requests..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Compact Pre-Submit Summary */}
                  <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Applicant</span>
                      <span className="font-bold text-slate-900 truncate block">{formData.student_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Class</span>
                      <span className="font-bold text-sky-700 block">{formData.applying_for_class}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Est. Monthly Fee</span>
                      <span className="font-bold text-emerald-700 block">${feeEstimate.netMonthlyFee}/mo</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Docs Checked</span>
                      <span className="font-bold text-slate-900 block">{formData.documents_checklist.length} / 4</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowSqlPrompt(!showSqlPrompt)}
                  className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{showSqlPrompt ? 'Hide SQL Prompt' : 'Supabase AI Prompt'}</span>
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                      className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => validateStep(step + 1)}
                      className="px-5 py-2.5 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Submit Application Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

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
