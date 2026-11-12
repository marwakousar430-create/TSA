import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  INITIAL_CLASSES,
  INITIAL_SECTIONS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_ATTENDANCE,
  INITIAL_FEE_RECORDS,
  INITIAL_FEE_PAYMENTS,
  INITIAL_EXAMS,
  INITIAL_EXAM_RESULTS,
  INITIAL_HOMEWORK,
  INITIAL_NOTICES,
  INITIAL_ADMISSIONS,
  INITIAL_EVENTS,
  INITIAL_GALLERY,
  INITIAL_PROFILES,
} from './initialData';
import {
  SchoolClass,
  Section,
  Teacher,
  Student,
  Subject,
  AttendanceRecord,
  FeeRecord,
  FeePayment,
  Examination,
  ExamResult,
  Homework,
  SchoolNotice,
  AdmissionInquiry,
  SchoolEvent,
  GalleryItem,
  Profile,
} from '../types/database.types';

// Storage keys
const LS_URL_KEY = 'tsa_supabase_url';
const LS_ANON_KEY = 'tsa_supabase_anon_key';
const DB_STORAGE_KEY_PREFIX = 'tsa_db_table_';

// Retrieve credentials
export function getStoredSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const lsUrl = typeof window !== 'undefined' ? localStorage.getItem(LS_URL_KEY) || '' : '';
  const lsKey = typeof window !== 'undefined' ? localStorage.getItem(LS_ANON_KEY) || '' : '';

  const url = lsUrl || envUrl;
  const anonKey = lsKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('YOUR_SUPABASE') &&
    url.startsWith('https://') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_URL_KEY, url.trim());
    localStorage.setItem(LS_ANON_KEY, anonKey.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_URL_KEY);
    localStorage.removeItem(LS_ANON_KEY);
    window.location.reload();
  }
}

// Global Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// -----------------------------------------------------------------------------
// REACTIVE LOCAL DATABASE ENGINE WITH COMPLETE CRUD
// When real Supabase credentials are plugged in, operations mirror to Supabase.
// -----------------------------------------------------------------------------

type Listener = () => void;
const listeners: Record<string, Set<Listener>> = {};

export function subscribeToTable(table: string, listener: Listener): () => void {
  if (!listeners[table]) {
    listeners[table] = new Set();
  }
  listeners[table].add(listener);
  return () => {
    listeners[table]?.delete(listener);
  };
}

function notifyTableSubscribers(table: string): void {
  if (listeners[table]) {
    listeners[table].forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error(err);
      }
    });
  }
}

function getStoredTable<T>(table: string, defaultData: T[]): T[] {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY_PREFIX + table);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY_PREFIX + table, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function setStoredTable<T>(table: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DB_STORAGE_KEY_PREFIX + table, JSON.stringify(data));
    notifyTableSubscribers(table);
  } catch (err) {
    console.error(`Failed to write to localStorage for table ${table}:`, err);
  }
}

// Data Store API with Supabase Dual-Mode Support
export const db = {
  // 1. PROFILES
  profiles: {
    getAll: async (): Promise<Profile[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
          if (!error && data) return data as Profile[];
        } catch (e) {
          console.warn('Supabase profiles query fallback:', e);
        }
      }
      return getStoredTable<Profile>('profiles', INITIAL_PROFILES);
    },
  },

  // 2. CLASSES
  classes: {
    getAll: async (): Promise<SchoolClass[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('classes').select('*').order('numeric_order', { ascending: true });
          if (!error && data) return data as SchoolClass[];
        } catch (e) {
          console.warn('Supabase classes query fallback:', e);
        }
      }
      return getStoredTable<SchoolClass>('classes', INITIAL_CLASSES).sort((a, b) => a.numeric_order - b.numeric_order);
    },
    create: async (item: Omit<SchoolClass, 'id' | 'created_at'>): Promise<SchoolClass> => {
      const newClass: SchoolClass = {
        ...item,
        id: 'cls-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('classes').insert(newClass);
        } catch (e) {
          console.warn('Supabase class create fallback:', e);
        }
      }
      const all = getStoredTable<SchoolClass>('classes', INITIAL_CLASSES);
      all.push(newClass);
      setStoredTable('classes', all);
      return newClass;
    },
    update: async (id: string, updates: Partial<SchoolClass>): Promise<SchoolClass | null> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('classes').update(updates).eq('id', id);
        } catch (e) {
          console.warn('Supabase class update fallback:', e);
        }
      }
      const all = getStoredTable<SchoolClass>('classes', INITIAL_CLASSES);
      const index = all.findIndex((c) => c.id === id);
      if (index === -1) return null;
      all[index] = { ...all[index], ...updates };
      setStoredTable('classes', all);
      return all[index];
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('classes').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase class delete fallback:', e);
        }
      }
      const all = getStoredTable<SchoolClass>('classes', INITIAL_CLASSES);
      const filtered = all.filter((c) => c.id !== id);
      setStoredTable('classes', filtered);
      return true;
    },
  },

  // 3. SECTIONS
  sections: {
    getAll: async (): Promise<Section[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('sections').select('*');
          if (!error && data) return data as Section[];
        } catch (e) {
          console.warn('Supabase sections query fallback:', e);
        }
      }
      return getStoredTable<Section>('sections', INITIAL_SECTIONS);
    },
    create: async (item: Omit<Section, 'id' | 'created_at'>): Promise<Section> => {
      const newSec: Section = {
        ...item,
        id: 'sec-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('sections').insert(newSec);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Section>('sections', INITIAL_SECTIONS);
      all.push(newSec);
      setStoredTable('sections', all);
      return newSec;
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('sections').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Section>('sections', INITIAL_SECTIONS);
      setStoredTable('sections', all.filter((s) => s.id !== id));
      return true;
    },
  },

  // 4. TEACHERS
  teachers: {
    getAll: async (): Promise<Teacher[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('teachers').select('*').order('created_at', { ascending: false });
          if (!error && data) return data as Teacher[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<Teacher>('teachers', INITIAL_TEACHERS);
    },
    create: async (item: Omit<Teacher, 'id' | 'created_at'>): Promise<Teacher> => {
      const newTeacher: Teacher = {
        ...item,
        id: 'tch-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('teachers').insert(newTeacher);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Teacher>('teachers', INITIAL_TEACHERS);
      all.unshift(newTeacher);
      setStoredTable('teachers', all);
      return newTeacher;
    },
    update: async (id: string, updates: Partial<Teacher>): Promise<Teacher | null> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('teachers').update(updates).eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Teacher>('teachers', INITIAL_TEACHERS);
      const idx = all.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      setStoredTable('teachers', all);
      return all[idx];
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('teachers').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Teacher>('teachers', INITIAL_TEACHERS);
      setStoredTable('teachers', all.filter((t) => t.id !== id));
      return true;
    },
  },

  // 5. STUDENTS
  students: {
    getAll: async (): Promise<Student[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('students').select('*').order('created_at', { ascending: false });
          if (!error && data) return data as Student[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<Student>('students', INITIAL_STUDENTS);
    },
    getById: async (id: string): Promise<Student | null> => {
      const all = await db.students.getAll();
      return all.find((s) => s.id === id) || null;
    },
    create: async (item: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
      const newStudent: Student = {
        ...item,
        id: 'stu-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('students').insert(newStudent);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Student>('students', INITIAL_STUDENTS);
      all.unshift(newStudent);
      setStoredTable('students', all);

      // Auto-generate a pending fee record for current month for the new student
      const classObj = INITIAL_CLASSES.find((c) => c.name === newStudent.class_name);
      const tuition = classObj ? classObj.monthly_tuition_fee : 150;
      await db.fees.createRecord({
        student_id: newStudent.id,
        student_name: newStudent.name,
        registration_number: newStudent.registration_number,
        class_id: newStudent.class_id,
        class_name: newStudent.class_name,
        month_year: 'November 2026',
        tuition_fee: tuition,
        exam_fee: 25,
        computer_fee: 15,
        sports_fee: 10,
        discount: 0,
        late_fee: 0,
        total_amount: tuition + 50,
        paid_amount: 0,
        balance_due: tuition + 50,
        status: 'Pending',
        due_date: '2026-11-15',
      });

      return newStudent;
    },
    update: async (id: string, updates: Partial<Student>): Promise<Student | null> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('students').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Student>('students', INITIAL_STUDENTS);
      const idx = all.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
      setStoredTable('students', all);
      return all[idx];
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('students').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Student>('students', INITIAL_STUDENTS);
      setStoredTable('students', all.filter((s) => s.id !== id));
      return true;
    },
  },

  // 6. SUBJECTS
  subjects: {
    getAll: async (): Promise<Subject[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('subjects').select('*');
          if (!error && data) return data as Subject[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<Subject>('subjects', INITIAL_SUBJECTS);
    },
    create: async (item: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> => {
      const newSub: Subject = {
        ...item,
        id: 'sbj-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('subjects').insert(newSub);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Subject>('subjects', INITIAL_SUBJECTS);
      all.push(newSub);
      setStoredTable('subjects', all);
      return newSub;
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('subjects').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Subject>('subjects', INITIAL_SUBJECTS);
      setStoredTable('subjects', all.filter((s) => s.id !== id));
      return true;
    },
  },

  // 7. ATTENDANCE
  attendance: {
    getAll: async (): Promise<AttendanceRecord[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('attendance').select('*').order('date', { ascending: false });
          if (!error && data) return data as AttendanceRecord[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<AttendanceRecord>('attendance', INITIAL_ATTENDANCE);
    },
    getByClassAndDate: async (className: string, date: string): Promise<AttendanceRecord[]> => {
      const all = await db.attendance.getAll();
      return all.filter((a) => a.class_name === className && a.date === date);
    },
    saveBatch: async (records: Omit<AttendanceRecord, 'id' | 'created_at'>[]): Promise<AttendanceRecord[]> => {
      const all = getStoredTable<AttendanceRecord>('attendance', INITIAL_ATTENDANCE);
      const saved: AttendanceRecord[] = [];

      for (const rec of records) {
        // Prevent duplicate attendance records for the same student on the same date!
        const existingIdx = all.findIndex((a) => a.student_id === rec.student_id && a.date === rec.date);
        if (existingIdx !== -1) {
          all[existingIdx] = {
            ...all[existingIdx],
            ...rec,
          };
          saved.push(all[existingIdx]);
        } else {
          const newRec: AttendanceRecord = {
            ...rec,
            id: 'att-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
          };
          all.push(newRec);
          saved.push(newRec);
        }
      }

      const client = getSupabase();
      if (client) {
        try {
          await client.from('attendance').upsert(saved, { onConflict: 'student_id,date' });
        } catch (e) {
          console.warn(e);
        }
      }

      setStoredTable('attendance', all);
      return saved;
    },
  },

  // 8 & 9. FEE RECORDS & PAYMENTS
  fees: {
    getRecords: async (): Promise<FeeRecord[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('fee_records').select('*').order('created_at', { ascending: false });
          if (!error && data) return data as FeeRecord[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<FeeRecord>('fee_records', INITIAL_FEE_RECORDS);
    },
    getPayments: async (): Promise<FeePayment[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('fee_payments').select('*').order('created_at', { ascending: false });
          if (!error && data) return data as FeePayment[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<FeePayment>('fee_payments', INITIAL_FEE_PAYMENTS);
    },
    createRecord: async (item: Omit<FeeRecord, 'id' | 'created_at'>): Promise<FeeRecord> => {
      const newRec: FeeRecord = {
        ...item,
        id: 'fee-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('fee_records').insert(newRec);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<FeeRecord>('fee_records', INITIAL_FEE_RECORDS);
      all.unshift(newRec);
      setStoredTable('fee_records', all);
      return newRec;
    },
    submitPayment: async (
      feeRecordId: string,
      paymentData: {
        amount: number;
        payment_method: 'Cash' | 'Bank Transfer' | 'Online Card' | 'Cheque';
        received_by: string;
        remarks?: string;
      }
    ): Promise<{ record: FeeRecord; payment: FeePayment }> => {
      const records = getStoredTable<FeeRecord>('fee_records', INITIAL_FEE_RECORDS);
      const recIdx = records.findIndex((r) => r.id === feeRecordId);
      if (recIdx === -1) throw new Error('Fee record not found');

      const record = records[recIdx];
      const newPaid = Number(record.paid_amount) + Number(paymentData.amount);
      const newBalance = Math.max(0, Number(record.total_amount) - newPaid);
      const newStatus = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending';

      const updatedRecord: FeeRecord = {
        ...record,
        paid_amount: newPaid,
        balance_due: newBalance,
        status: newStatus,
      };
      records[recIdx] = updatedRecord;
      setStoredTable('fee_records', records);

      const receiptNumber = 'REC-2026-' + Math.floor(1000 + Math.random() * 9000);
      const payment: FeePayment = {
        id: 'pay-' + Math.random().toString(36).substr(2, 9),
        fee_record_id: feeRecordId,
        student_id: record.student_id,
        student_name: record.student_name,
        registration_number: record.registration_number,
        class_name: record.class_name,
        amount_paid: paymentData.amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentData.payment_method,
        receipt_number: receiptNumber,
        received_by: paymentData.received_by,
        remarks: paymentData.remarks,
        created_at: new Date().toISOString(),
      };

      const payments = getStoredTable<FeePayment>('fee_payments', INITIAL_FEE_PAYMENTS);
      payments.unshift(payment);
      setStoredTable('fee_payments', payments);

      const client = getSupabase();
      if (client) {
        try {
          await client.from('fee_records').update(updatedRecord).eq('id', feeRecordId);
          await client.from('fee_payments').insert(payment);
        } catch (e) {
          console.warn(e);
        }
      }

      return { record: updatedRecord, payment };
    },
  },

  // 10 & 11. EXAMINATIONS & RESULTS
  exams: {
    getAll: async (): Promise<Examination[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('examinations').select('*').order('created_at', { ascending: false });
          if (!error && data) return data as Examination[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<Examination>('examinations', INITIAL_EXAMS);
    },
    create: async (item: Omit<Examination, 'id' | 'created_at'>): Promise<Examination> => {
      const newExam: Examination = {
        ...item,
        id: 'exm-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('examinations').insert(newExam);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Examination>('examinations', INITIAL_EXAMS);
      all.unshift(newExam);
      setStoredTable('examinations', all);
      return newExam;
    },
    getResults: async (): Promise<ExamResult[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('exam_results').select('*').order('percentage', { ascending: false });
          if (!error && data) return data as ExamResult[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<ExamResult>('exam_results', INITIAL_EXAM_RESULTS);
    },
    saveResult: async (item: Omit<ExamResult, 'id' | 'created_at'>): Promise<ExamResult> => {
      const all = getStoredTable<ExamResult>('exam_results', INITIAL_EXAM_RESULTS);
      const existingIdx = all.findIndex((r) => r.exam_id === item.exam_id && r.student_id === item.student_id);

      let saved: ExamResult;
      if (existingIdx !== -1) {
        saved = {
          ...all[existingIdx],
          ...item,
        };
        all[existingIdx] = saved;
      } else {
        saved = {
          ...item,
          id: 'res-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        all.unshift(saved);
      }

      const client = getSupabase();
      if (client) {
        try {
          await client.from('exam_results').upsert(saved, { onConflict: 'exam_id,student_id' });
        } catch (e) {
          console.warn(e);
        }
      }

      setStoredTable('exam_results', all);
      return saved;
    },
  },

  // 12. HOMEWORK
  homework: {
    getAll: async (): Promise<Homework[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('homework').select('*').order('due_date', { ascending: true });
          if (!error && data) return data as Homework[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<Homework>('homework', INITIAL_HOMEWORK);
    },
    create: async (item: Omit<Homework, 'id' | 'created_at'>): Promise<Homework> => {
      const newHw: Homework = {
        ...item,
        id: 'hw-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('homework').insert(newHw);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Homework>('homework', INITIAL_HOMEWORK);
      all.unshift(newHw);
      setStoredTable('homework', all);
      return newHw;
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('homework').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<Homework>('homework', INITIAL_HOMEWORK);
      setStoredTable('homework', all.filter((h) => h.id !== id));
      return true;
    },
  },

  // 13. NOTICES
  notices: {
    getAll: async (): Promise<SchoolNotice[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('notices').select('*').order('published_date', { ascending: false });
          if (!error && data) return data as SchoolNotice[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<SchoolNotice>('notices', INITIAL_NOTICES);
    },
    getPublished: async (): Promise<SchoolNotice[]> => {
      const all = await db.notices.getAll();
      return all.filter((n) => n.is_published);
    },
    create: async (item: Omit<SchoolNotice, 'id' | 'created_at'>): Promise<SchoolNotice> => {
      const newNotice: SchoolNotice = {
        ...item,
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('notices').insert(newNotice);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<SchoolNotice>('notices', INITIAL_NOTICES);
      all.unshift(newNotice);
      setStoredTable('notices', all);
      return newNotice;
    },
    update: async (id: string, updates: Partial<SchoolNotice>): Promise<SchoolNotice | null> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('notices').update(updates).eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<SchoolNotice>('notices', INITIAL_NOTICES);
      const idx = all.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      setStoredTable('notices', all);
      return all[idx];
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('notices').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<SchoolNotice>('notices', INITIAL_NOTICES);
      setStoredTable('notices', all.filter((n) => n.id !== id));
      return true;
    },
  },

  // 14. ADMISSIONS
  admissions: {
    getAll: async (): Promise<AdmissionInquiry[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('admissions').select('*').order('submitted_at', { ascending: false });
          if (!error && data) return data as AdmissionInquiry[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<AdmissionInquiry>('admissions', INITIAL_ADMISSIONS);
    },
    submit: async (
      item: Omit<AdmissionInquiry, 'id' | 'created_at' | 'submitted_at' | 'status'>
    ): Promise<AdmissionInquiry & { isSupabaseSynced?: boolean }> => {
      const year = new Date().getFullYear();
      const appNumber = item.application_number || `TSA-APP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newInquiry: AdmissionInquiry = {
        ...item,
        application_number: appNumber,
        id: 'adm-' + Math.random().toString(36).substr(2, 9),
        status: 'Pending',
        academic_session: item.academic_session || `${year}-${year + 1}`,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      let isSupabaseSynced = false;
      const client = getSupabase();
      if (client) {
        try {
          const { error } = await client.from('admissions').insert([
            {
              application_number: newInquiry.application_number,
              student_name: newInquiry.student_name,
              father_name: newInquiry.father_name,
              mother_name: newInquiry.mother_name || null,
              date_of_birth: newInquiry.date_of_birth,
              gender: newInquiry.gender,
              applying_for_class: newInquiry.applying_for_class,
              academic_session: newInquiry.academic_session,
              previous_school: newInquiry.previous_school || null,
              previous_grade_percentage: newInquiry.previous_grade_percentage || null,
              guardian_phone: newInquiry.guardian_phone,
              guardian_email: newInquiry.guardian_email,
              emergency_contact: newInquiry.emergency_contact || null,
              address: newInquiry.address,
              blood_group: newInquiry.blood_group || null,
              interests: newInquiry.interests || [],
              status: newInquiry.status,
              notes: newInquiry.notes || null,
              submitted_at: newInquiry.submitted_at,
              created_at: newInquiry.created_at,
            },
          ]);

          if (!error) {
            isSupabaseSynced = true;
          } else {
            console.warn('Supabase admissions insert notice (retrying core fields):', error.message);
            // Fallback for minimalist tables
            const { error: fallbackErr } = await client.from('admissions').insert([
              {
                student_name: newInquiry.student_name,
                father_name: newInquiry.father_name,
                date_of_birth: newInquiry.date_of_birth,
                gender: newInquiry.gender,
                applying_for_class: newInquiry.applying_for_class,
                previous_school: newInquiry.previous_school,
                guardian_phone: newInquiry.guardian_phone,
                guardian_email: newInquiry.guardian_email,
                address: newInquiry.address,
                status: newInquiry.status,
                notes: newInquiry.notes,
              },
            ]);
            if (!fallbackErr) isSupabaseSynced = true;
          }
        } catch (e) {
          console.warn('Supabase admission insert fallback:', e);
        }
      }

      const all = getStoredTable<AdmissionInquiry>('admissions', INITIAL_ADMISSIONS);
      all.unshift(newInquiry);
      setStoredTable('admissions', all);

      return { ...newInquiry, isSupabaseSynced };
    },
    updateStatus: async (id: string, status: AdmissionInquiry['status'], notes?: string): Promise<AdmissionInquiry | null> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('admissions').update({ status, ...(notes ? { notes } : {}) }).eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<AdmissionInquiry>('admissions', INITIAL_ADMISSIONS);
      const idx = all.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], status, ...(notes !== undefined ? { notes } : {}) };
      setStoredTable('admissions', all);
      return all[idx];
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('admissions').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<AdmissionInquiry>('admissions', INITIAL_ADMISSIONS);
      setStoredTable('admissions', all.filter((a) => a.id !== id));
      return true;
    },
  },

  // 15. EVENTS
  events: {
    getAll: async (): Promise<SchoolEvent[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('school_events').select('*').order('event_date', { ascending: true });
          if (!error && data) return data as SchoolEvent[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<SchoolEvent>('school_events', INITIAL_EVENTS);
    },
    create: async (item: Omit<SchoolEvent, 'id' | 'created_at'>): Promise<SchoolEvent> => {
      const newEvt: SchoolEvent = {
        ...item,
        id: 'evt-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('school_events').insert(newEvt);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<SchoolEvent>('school_events', INITIAL_EVENTS);
      all.push(newEvt);
      setStoredTable('school_events', all);
      return newEvt;
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('school_events').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<SchoolEvent>('school_events', INITIAL_EVENTS);
      setStoredTable('school_events', all.filter((e) => e.id !== id));
      return true;
    },
  },

  // 16. GALLERY
  gallery: {
    getAll: async (): Promise<GalleryItem[]> => {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.from('gallery').select('*').order('date_taken', { ascending: false });
          if (!error && data) return data as GalleryItem[];
        } catch (e) {
          console.warn(e);
        }
      }
      return getStoredTable<GalleryItem>('gallery', INITIAL_GALLERY);
    },
    create: async (item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> => {
      const newGal: GalleryItem = {
        ...item,
        id: 'gal-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      const client = getSupabase();
      if (client) {
        try {
          await client.from('gallery').insert(newGal);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<GalleryItem>('gallery', INITIAL_GALLERY);
      all.unshift(newGal);
      setStoredTable('gallery', all);
      return newGal;
    },
    delete: async (id: string): Promise<boolean> => {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('gallery').delete().eq('id', id);
        } catch (e) {
          console.warn(e);
        }
      }
      const all = getStoredTable<GalleryItem>('gallery', INITIAL_GALLERY);
      setStoredTable('gallery', all.filter((g) => g.id !== id));
      return true;
    },
  },
};
