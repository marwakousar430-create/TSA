export type UserRole = 'admin' | 'staff';

export interface Profile {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type StudentStatus = 'Active' | 'Inactive' | 'Suspended' | 'Graduated';

export interface Student {
  id: string;
  registration_number: string;
  name: string;
  father_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  class_id: string;
  class_name: string;
  section_id: string;
  section_name: string;
  roll_number: string;
  contact_number: string;
  parent_contact: string;
  address: string;
  admission_date: string;
  photo_url: string;
  status: StudentStatus;
  blood_group?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at?: string;
}

export interface Teacher {
  id: string;
  teacher_id_code: string;
  name: string;
  qualification: string;
  subject: string;
  assigned_classes: string[];
  phone: string;
  email: string;
  joining_date: string;
  salary: number;
  photo_url: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  bio?: string;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Grade 9", "Grade 10"
  numeric_order: number;
  capacity: number;
  class_teacher_id?: string;
  class_teacher_name?: string;
  room_number: string;
  monthly_tuition_fee: number;
  created_at: string;
}

export interface Section {
  id: string;
  class_id: string;
  class_name?: string;
  name: string; // e.g. "Section A", "Section B"
  capacity: number;
  room_number: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  class_id: string;
  class_name: string;
  teacher_id?: string;
  teacher_name?: string;
  full_marks: number;
  pass_marks: number;
  created_at: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Late';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  class_id: string;
  class_name: string;
  section_id: string;
  section_name: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  recorded_by: string;
  created_at: string;
}

export type FeeStatus = 'Paid' | 'Pending' | 'Partially Paid';

export interface FeeRecord {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  class_id: string;
  class_name: string;
  month_year: string; // e.g. "November 2026"
  tuition_fee: number;
  exam_fee: number;
  computer_fee: number;
  sports_fee: number;
  discount: number;
  late_fee: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: FeeStatus;
  due_date: string;
  created_at: string;
}

export interface FeePayment {
  id: string;
  fee_record_id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  class_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: 'Cash' | 'Bank Transfer' | 'Online Card' | 'Cheque';
  receipt_number: string;
  received_by: string;
  remarks?: string;
  created_at: string;
}

export interface Examination {
  id: string;
  title: string; // e.g. "Mid-Term Examination 2026"
  term: 'Mid Term' | 'Final Term' | 'First Quarter' | 'Pre-Board';
  academic_year: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  created_at: string;
}

export interface SubjectScore {
  subject_id: string;
  subject_name: string;
  max_marks: number;
  obtained_marks: number;
  grade: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  exam_title: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  registration_number: string;
  class_id: string;
  class_name: string;
  section_id: string;
  section_name: string;
  subject_scores: SubjectScore[];
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  gpa: number;
  rank?: number;
  remarks: string;
  created_at: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  class_id: string;
  class_name: string;
  subject: string;
  assigned_date: string;
  due_date: string;
  teacher_id: string;
  teacher_name: string;
  attachment_url?: string;
  created_at: string;
}

export interface SchoolNotice {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Holiday' | 'Exam' | 'Event' | 'Urgent' | 'General';
  audience: 'All' | 'Students' | 'Teachers' | 'Parents';
  is_published: boolean;
  priority: 'Normal' | 'High';
  published_date: string;
  author: string;
  created_at: string;
}

export type AdmissionStatus = 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';

export interface AdmissionInquiry {
  id: string;
  application_number?: string;
  student_name: string;
  father_name: string;
  mother_name?: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  applying_for_class: string;
  academic_session?: string;
  previous_school?: string;
  previous_grade_percentage?: string;
  guardian_phone: string;
  guardian_email: string;
  emergency_contact?: string;
  address: string;
  blood_group?: string;
  student_photo_url?: string;
  scholarship_type?: string;
  estimated_monthly_fee?: number;
  transport_required?: boolean;
  transport_route?: string;
  documents_checklist?: string[];
  interests?: string[] | string;
  status: AdmissionStatus;
  notes?: string;
  submitted_at: string;
  created_at: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  category: 'Sports' | 'Cultural' | 'Academic' | 'Ceremony' | 'Holiday';
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: 'Campus' | 'Sports' | 'Laboratories' | 'Cultural' | 'Achievements' | 'Library';
  image_url: string;
  date_taken: string;
  created_at: string;
}
