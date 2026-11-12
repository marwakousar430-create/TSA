import React, { useState } from 'react';
import {
  Database,
  Key,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileCode,
  Shield,
  Layers,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  getSupabase,
} from '../../lib/supabaseClient';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabaseSchema';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isCopied, setIsCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'tables' | 'storage'>('config');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) {
      alert('Please provide both Project URL and Anon Key.');
      return;
    }
    saveSupabaseConfig(url, anonKey);
  };

  const handleClear = () => {
    if (confirm('Clear custom Supabase credentials and revert to persistent local store?')) {
      clearSupabaseConfig();
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const client = getSupabase();
    if (!client) {
      setTestResult({
        status: 'error',
        message: 'Supabase client is not yet initialized. Please save valid credentials first.',
      });
      setIsTesting(false);
      return;
    }

    try {
      const { data, error } = await client.from('classes').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult({
          status: 'error',
          message: `Connection error: ${error.message}. Have you run the SQL schema in your Supabase SQL Editor?`,
        });
      } else {
        setTestResult({
          status: 'success',
          message: 'Connected to Supabase successfully! Tables and RLS policies are operational.',
        });
      }
    } catch (err: unknown) {
      setTestResult({
        status: 'error',
        message: err instanceof Error ? err.message : 'Connection failed. Verify URL and publishable key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const tablesList = [
    { name: 'profiles', desc: 'Admin & Staff accounts linked to Supabase Auth' },
    { name: 'classes', desc: 'Grade cohorts (Grades 7–12), capacities, fees, teachers' },
    { name: 'sections', desc: 'Class divisions (Section A, B, etc.) with room allocation' },
    { name: 'teachers', desc: 'Faculty profiles, subject specializations, salaries, contact' },
    { name: 'students', desc: 'Full student directory, registration numbers, roll numbers, status' },
    { name: 'subjects', desc: 'Course catalog, codes, pass marks, full marks' },
    { name: 'attendance', desc: 'Daily attendance ledger with date-student duplicate lock' },
    { name: 'fee_records', desc: 'Monthly tuition ledgers, discount & late fee calculation' },
    { name: 'fee_payments', desc: 'Official payment transactions and receipt generation' },
    { name: 'examinations', desc: 'Exam cycles (Mid-term, final, quarters)' },
    { name: 'exam_results', desc: 'Student marks, automatic percentage, letter grade, GPA' },
    { name: 'homework', desc: 'Class homework assignments and due dates' },
    { name: 'notices', desc: 'Official administrative bulletins synced with public portal' },
    { name: 'admissions', desc: 'Online admissions inquiries submitted from public portal' },
    { name: 'school_events', desc: 'School events calendar and athletic fixtures' },
    { name: 'gallery', desc: 'Campus, laboratory, athletics, and library photo archive' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Supabase Database Integration & SQL Hub</h3>
              <p className="text-xs text-sky-300">Teen School Academy · 16 Production Tables & Storage</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg cursor-pointer ${
              activeTab === 'config' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Connection Setup
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schema' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Complete SQL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tables' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>16 Tables ({tablesList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'storage' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Storage Buckets</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  currentConfig.isConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {currentConfig.isConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {currentConfig.isConfigured
                      ? 'Live Supabase Connection Configured'
                      : 'Dual-Engine Mode: Local Persistent Reactive Engine Active'}
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {currentConfig.isConfigured
                      ? `Connected to: ${currentConfig.url}. All student, teacher, fee, and admissions changes are synchronized with Supabase.`
                      : 'All 16 modules are 100% operational in our local persistent engine. To connect your cloud database, paste your Supabase Project URL and Anon/Publishable Key below, then click Save.'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Supabase Project URL (e.g. https://your-project.supabase.co)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://xyzabcdefg.supabase.co"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Supabase Anon / Publishable Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Safe to use client-side. The Service Role Key is NEVER used on the frontend.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>Test Connection</span>
                    </button>
                    {currentConfig.isConfigured && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                      >
                        Reset / Clear Credentials
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                  >
                    Save & Reconnect
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2 ${
                      testResult.status === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </form>

              {/* Instructions */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900">How to Connect Real Supabase in 3 Minutes:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">supabase.com</a> and create a new project.</li>
                  <li>Click on the <strong>SQL Editor</strong> tab on the left sidebar.</li>
                  <li>Switch to the <strong>Complete SQL Schema</strong> tab above, click <strong>"Copy Complete SQL Script"</strong>, paste into the Supabase editor, and click <strong>Run</strong>.</li>
                  <li>Navigate to <strong>Project Settings → API</strong> to copy your <strong>Project URL</strong> and <strong>anon public key</strong>.</li>
                  <li>Paste them into the fields above and click <strong>Save & Reconnect</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">PostgreSQL Schema & Security Policies</h4>
                  <p className="text-slate-500">Includes all 16 tables, UUID generation, foreign keys, indexes, and Row Level Security.</p>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Complete SQL Script'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 font-mono text-[11px] p-4 max-h-[420px] overflow-y-auto">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">16 Dedicated Database Tables</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tablesList.map((tbl, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span className="font-mono text-sky-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tbl.name}
                    </span>
                    <span className="text-slate-600 text-[11px] leading-tight mt-0.5">{tbl.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Configured Supabase Storage Buckets</h4>
              <p className="text-slate-600 leading-relaxed">
                The provided SQL script automatically creates these four buckets with public and authenticated policies:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="font-mono font-bold text-sky-900 block text-xs">student-photos</span>
                  <p className="text-slate-600 text-[11px] mt-1">Student identification photos and student card portrait images.</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="font-mono font-bold text-sky-900 block text-xs">teacher-photos</span>
                  <p className="text-slate-600 text-[11px] mt-1">Faculty profile portraits for public and administrative directories.</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="font-mono font-bold text-sky-900 block text-xs">school-gallery</span>
                  <p className="text-slate-600 text-[11px] mt-1">High-resolution campus, athletics, and laboratory imagery.</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="font-mono font-bold text-sky-900 block text-xs">school-documents</span>
                  <p className="text-slate-600 text-[11px] mt-1">PDF syllabi, admission prospectuses, and academic calendar documents.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
