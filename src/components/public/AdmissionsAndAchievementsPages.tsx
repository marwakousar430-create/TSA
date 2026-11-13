import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Trophy,
  Users,
  AlertCircle,
  Loader2,
  Upload,
  User,
  Calculator,
  Bus,
  FileCheck2,
  Search,
  Printer,
  ChevronRight,
  ChevronLeft,
  Save,
  RotateCcw,
} from 'lucide-react';
import { db } from '../../lib/supabaseClient';
import { ADMISSION_DB_AI_PROMPT, ADMISSION_TABLE_SQL } from '../../lib/supabaseSchema';
import { AdmissionInquiry } from '../../types/database.types';
import {
  AVAILABLE_INTERESTS,
  REQUIRED_DOCUMENTS,
  SCHOLARSHIP_OPTIONS,
  TRANSPORT_ROUTES,
  calculateTuitionEstimate,
} from '../../lib/admissionHelpers';

const PAGE_DRAFT_KEY = 'tsa_admission_page_draft_v1';

export const AdmissionsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const initialForm = {
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
    student_photo_url: '',
    scholarship_type: 'None',
    transport_required: false,
    transport_route: TRANSPORT_ROUTES[0],
    documents_checklist: ['Birth Certificate / National ID Copy'] as string[],
    interests: ['STEM & Robotics'] as string[],
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [activeMode, setActiveMode] = useState<'apply' | 'track'>('apply');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{
    id: string;
    appNumber: string;
    isSynced?: boolean;
    estimatedFee: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const [trackQuery, setTrackQuery] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackResults, setTrackResults] = useState<AdmissionInquiry[] | null>(null);

  // Restore saved draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAGE_DRAFT_KEY);
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

  // Auto-save draft
  useEffect(() => {
    if (submittedApp) return;
    try {
      localStorage.setItem(PAGE_DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage quota errors
    }
  }, [formData, submittedApp]);

  const feeEstimate = useMemo(
    () =>
      calculateTuitionEstimate(
        formData.applying_for_class,
        formData.scholarship_type,
        formData.transport_required
      ),
    [formData.applying_for_class, formData.scholarship_type, formData.transport_required]
  );

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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Photo must be smaller than 3MB.');
      return;
    }
    setErrorMsg(null);
    setIsUploadingPhoto(true);
    try {
      const url = await db.admissions.uploadPhoto(file);
      setFormData((prev) => ({ ...prev, student_photo_url: url }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleScoreChange = (val: string) => {
    setFormData((prev) => {
      const num = parseFloat(val);
      let nextScholarship = prev.scholarship_type;
      if (!isNaN(num)) {
        if (num >= 90 && prev.scholarship_type === 'None') nextScholarship = 'Academic Merit (30%)';
        else if (num >= 85 && prev.scholarship_type === 'None') nextScholarship = 'Honor Roll (15%)';
      }
      return { ...prev, previous_grade_percentage: val, scholarship_type: nextScholarship };
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleDocument = (doc: string) => {
    setFormData((prev) => ({
      ...prev,
      documents_checklist: prev.documents_checklist.includes(doc)
        ? prev.documents_checklist.filter((d) => d !== doc)
        : [...prev.documents_checklist, doc],
    }));
  };

  const validateStep = (target: number) => {
    setErrorMsg(null);
    if (target > 1 && step === 1) {
      if (!formData.student_name.trim() || !formData.date_of_birth) {
        setErrorMsg('Please enter Student Full Name and Date of Birth before continuing.');
        return;
      }
    }
    if (target > 3 && step === 3) {
      if (!formData.father_name.trim() || !formData.guardian_phone.trim() || !formData.guardian_email.trim()) {
        setErrorMsg('Please fill Father Name, Guardian Phone, and Guardian Email before reviewing.');
        return;
      }
    }
    setStep(target as 1 | 2 | 3 | 4);
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setIsTracking(true);
    try {
      const res = await db.admissions.track(trackQuery);
      setTrackResults(res);
    } finally {
      setIsTracking(false);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(PAGE_DRAFT_KEY);
    setFormData(initialForm);
    setDraftRestored(false);
    setStep(1);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (!formData.student_name || !formData.father_name || !formData.guardian_phone || !formData.guardian_email) {
        throw new Error('Please fill in all mandatory fields marked with an asterisk (*).');
      }
      const record = await db.admissions.submit({
        ...formData,
        address: formData.address || 'On File',
        estimated_monthly_fee: feeEstimate.netMonthlyFee,
        transport_route: formData.transport_required ? formData.transport_route : undefined,
      });
      localStorage.removeItem(PAGE_DRAFT_KEY);
      setDraftRestored(false);
      setSubmittedApp({
        id: record.id,
        appNumber: record.application_number || `TSA-APP-${record.id.slice(0, 8).toUpperCase()}`,
        isSynced: record.isSupabaseSynced,
        estimatedFee: feeEstimate.netMonthlyFee,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>7-Feature Smart Enrollment Portal · Live Supabase Database</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Apply Now – Student Admission Application
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Includes 4-step wizard, student photo upload, auto-save draft, merit scholarship calculator, school bus selector, document readiness checklist, and live application tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPromptModal(true)}
            className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold text-sky-700 bg-white border border-sky-300 hover:bg-sky-50 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Supabase AI Prompt & Schema</span>
          </button>
        </div>

        {/* Mode Switcher + Draft Status */}
        {!submittedApp && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMode('apply')}
                className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ${
                  activeMode === 'apply'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Apply Online</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('track')}
                className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ${
                  activeMode === 'track'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Application Status</span>
              </button>
            </div>

            {activeMode === 'apply' && (
              <div className="flex items-center gap-3 text-xs px-2">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <Save className="w-3.5 h-3.5" />
                  <span>{draftRestored ? 'Saved Draft Restored' : 'Auto-Save Enabled'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Draft</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeMode === 'track' && !submittedApp ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Track Submitted Admission Application</h3>
              <p className="text-xs text-slate-600">
                Enter your Application Reference Number (e.g. <code className="font-mono font-bold text-sky-700">TSA-APP-2026-XXXX</code>) or Guardian Email address to fetch real-time status from Supabase.
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Application # or Guardian Email..."
                className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={isTracking}
                className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Check Status</span>
              </button>
            </form>

            {trackResults !== null && (
              <div className="space-y-3 pt-2">
                {trackResults.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No applications found matching <span className="font-bold text-slate-900">"{trackQuery}"</span>.
                  </div>
                ) : (
                  trackResults.map((app) => (
                    <div key={app.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <span className="font-mono font-bold text-sky-700">
                            {app.application_number || `TSA-${app.id.slice(0, 6).toUpperCase()}`}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{app.student_name}</h4>
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Applying Class</span>
                          <span className="font-semibold text-slate-900">{app.applying_for_class}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Guardian</span>
                          <span className="font-semibold text-slate-900">{app.father_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Submitted On</span>
                          <span className="font-semibold text-slate-900">{new Date(app.submitted_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Est. Monthly Fee</span>
                          <span className="font-semibold text-sky-700">
                            {app.estimated_monthly_fee ? `$${app.estimated_monthly_fee}/mo` : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : submittedApp ? (
          <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm space-y-5 max-w-2xl mx-auto">
            <div className="text-center space-y-2 print:hidden">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully!</h3>
              <p className="text-xs text-slate-600">
                Your admission data has been securely saved in the Supabase <code className="font-mono text-sky-700">admissions</code> table.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 text-left space-y-4 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                    Teen School Academy · Official Admission Slip
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">{formData.student_name}</h4>
                  <div className="font-mono font-bold text-sky-700 text-sm mt-1">
                    Application #: {submittedApp.appNumber}
                  </div>
                </div>
                {formData.student_photo_url ? (
                  <img
                    src={formData.student_photo_url}
                    alt={formData.student_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {formData.student_name.slice(0, 2).toUpperCase() || 'TS'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Class</span>
                  <span className="font-bold text-slate-900">{formData.applying_for_class}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Guardian</span>
                  <span className="font-semibold text-slate-900">{formData.father_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-semibold text-slate-900">{formData.guardian_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Scholarship Applied</span>
                  <span className="font-semibold text-emerald-700">{formData.scholarship_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est. Monthly Tuition</span>
                  <span className="font-bold text-sky-700">${submittedApp.estimatedFee}/mo</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bus Transport</span>
                  <span className="font-semibold text-slate-900">
                    {formData.transport_required ? formData.transport_route : 'Self Drop-off'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-1 print:hidden">
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
                onClick={() => {
                  setSubmittedApp(null);
                  setFormData(initialForm);
                  setStep(1);
                }}
                className="px-5 py-2.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer"
              >
                Submit Another Application
              </button>
              <button
                type="button"
                onClick={() => setShowPromptModal(true)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                View Supabase AI Prompt
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {/* Step Progress & Completion Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Step {step} of 4</span>
                <span className="font-bold text-sky-700">{completionPercent}% Application Complete</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-300"
                  style={{ width: `${Math.max(15, completionPercent)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { num: 1, label: '1. Identity & Photo' },
                  { num: 2, label: '2. Academics & Fee' },
                  { num: 3, label: '3. Parents & Bus' },
                  { num: 4, label: '4. Docs & Review' },
                ].map((item) => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => validateStep(item.num)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      step === item.num
                        ? 'bg-sky-600 text-white shadow-xs'
                        : step > item.num
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: STUDENT IDENTITY & PHOTO */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>Step 1: Student Identity & Passport Photo</span>
                  </h3>
                </div>

                {/* Photo Upload */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.student_photo_url ? (
                      <img src={formData.student_photo_url} alt="Applicant" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left text-xs">
                    <div className="font-bold text-slate-800">Upload Student Photograph</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stored in Supabase Storage (<code className="font-mono">student-photos</code>). JPG/PNG up to 3MB.
                    </p>
                  </div>
                  <label className="px-4 py-2 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0">
                    {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{formData.student_photo_url ? 'Change Photo' : 'Upload Photo'}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
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
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMICS & TUITION / SCHOLARSHIP CALCULATOR */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>Step 2: Academic History & Merit Scholarship Estimator</span>
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
                    <label className="block font-medium text-slate-700 mb-1">Previous Grade % (e.g. 92)</label>
                    <input
                      type="text"
                      value={formData.previous_grade_percentage}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      placeholder="Enter % to auto-qualify for Merit Scholarship"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-sky-50 to-blue-50/70 border border-sky-200 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Calculator className="w-4 h-4 text-sky-600" />
                      <span>Dynamic Tuition & Merit Scholarship Estimator</span>
                    </div>
                    <span className="font-bold text-sky-700">{formData.applying_for_class}</span>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Scholarship / Financial Aid Track</label>
                    <select
                      value={formData.scholarship_type}
                      onChange={(e) => setFormData({ ...formData, scholarship_type: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg font-medium"
                    >
                      {SCHOLARSHIP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Base Tuition</span>
                      <span className="font-bold text-slate-900 text-sm">${feeEstimate.baseTuition}/mo</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-600 block">Discount ({feeEstimate.discountPercent}%)</span>
                      <span className="font-bold text-emerald-700 text-sm">-${feeEstimate.discountAmount}/mo</span>
                    </div>
                    <div className="p-3 bg-sky-600 rounded-xl text-white">
                      <span className="text-[10px] text-sky-100 block">Estimated Monthly Fee</span>
                      <span className="font-extrabold text-sm">${feeEstimate.netMonthlyFee}/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PARENTS, SCHOOL BUS TRANSPORT & INTERESTS */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>Step 3: Parents, Transport Route & Club Interests</span>
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

                {/* Bus Transport */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                      <span>Require School Bus Service</span>
                    </label>
                  </div>
                  {formData.transport_required && (
                    <select
                      value={formData.transport_route}
                      onChange={(e) => setFormData({ ...formData, transport_route: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      {TRANSPORT_ROUTES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Clubs */}
                <div className="space-y-2 text-xs">
                  <label className="block font-medium text-slate-700">Extracurricular Clubs & Talents</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map((interest) => {
                      const active = formData.interests.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}{interest}
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
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <span>Step 4: Document Readiness Checklist & Final Review</span>
                  </h3>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <span className="font-bold text-slate-800 block">Confirm Documents Ready for Orientation / Review:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {REQUIRED_DOCUMENTS.map((doc) => {
                      const checked = formData.documents_checklist.includes(doc);
                      return (
                        <label
                          key={doc}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
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
                          <span>{doc}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-medium text-slate-700 mb-1">Additional Notes / Special Accommodations</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific academic goals or medical notes..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applicant</span>
                    <span className="font-bold text-slate-900">{formData.student_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Class</span>
                    <span className="font-bold text-sky-700">{formData.applying_for_class}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Monthly Fee</span>
                    <span className="font-bold text-emerald-700">${feeEstimate.netMonthlyFee}/mo</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Documents Ready</span>
                    <span className="font-bold text-slate-900">{formData.documents_checklist.length} / 4</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Controls */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Data connects directly to Supabase table <code className="font-mono text-sky-700">admissions</code></span>
              </p>

              <div className="flex items-center gap-2 ml-auto">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => validateStep(step + 1)}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
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
                )}
              </div>
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
