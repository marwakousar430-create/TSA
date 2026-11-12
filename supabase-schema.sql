-- ==============================================================================
-- TEEN SCHOOL ACADEMY - ENTERPRISE SCHOOL MANAGEMENT SYSTEM
-- COMPLETE SUPABASE POSTGRESQL SCHEMA WITH RLS & POLICIES
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Admins and Staff linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    numeric_order INT NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    class_teacher_id UUID,
    class_teacher_name TEXT,
    room_number TEXT NOT NULL,
    monthly_tuition_fee NUMERIC(10,2) NOT NULL DEFAULT 150.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 35,
    room_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(class_id, name)
);

-- 4. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    qualification TEXT NOT NULL,
    subject TEXT NOT NULL,
    assigned_classes TEXT[] DEFAULT '{}',
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    joining_date DATE NOT NULL,
    salary NUMERIC(10,2) NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'On Leave', 'Resigned')) DEFAULT 'Active',
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    class_name TEXT NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    section_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    parent_contact TEXT NOT NULL,
    address TEXT NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated')) DEFAULT 'Active',
    blood_group TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(class_id, section_id, roll_number)
);

-- 6. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name TEXT,
    full_marks INT NOT NULL DEFAULT 100,
    pass_marks INT NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(class_id, code)
);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave', 'Late')),
    remarks TEXT,
    recorded_by TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, date)
);

-- 8. FEE RECORDS TABLE
CREATE TABLE IF NOT EXISTS fee_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    class_name TEXT NOT NULL,
    month_year TEXT NOT NULL,
    tuition_fee NUMERIC(10,2) NOT NULL DEFAULT 150.00,
    exam_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    computer_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    sports_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    late_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Partially Paid')) DEFAULT 'Pending',
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, month_year)
);

-- 9. FEE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_record_id UUID NOT NULL REFERENCES fee_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    class_name TEXT NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Online Card', 'Cheque')),
    receipt_number TEXT NOT NULL UNIQUE,
    received_by TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS examinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('Mid Term', 'Final Term', 'First Quarter', 'Pre-Board')),
    academic_year TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
    exam_title TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    class_name TEXT NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    section_name TEXT NOT NULL,
    subject_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_marks INT NOT NULL,
    obtained_marks INT NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    grade TEXT NOT NULL,
    gpa NUMERIC(3,2) NOT NULL,
    rank INT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(exam_id, student_id)
);

-- 12. HOMEWORK TABLE
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic', 'Holiday', 'Exam', 'Event', 'Urgent', 'General')),
    audience TEXT NOT NULL CHECK (audience IN ('All', 'Students', 'Teachers', 'Parents')) DEFAULT 'All',
    is_published BOOLEAN NOT NULL DEFAULT true,
    priority TEXT NOT NULL CHECK (priority IN ('Normal', 'High')) DEFAULT 'Normal',
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    author TEXT NOT NULL DEFAULT 'Principal Office',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. ADMISSION INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    applying_for_class TEXT NOT NULL,
    previous_school TEXT,
    guardian_phone TEXT NOT NULL,
    guardian_email TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. SCHOOL EVENTS TABLE
CREATE TABLE IF NOT EXISTS school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Sports', 'Cultural', 'Academic', 'Ceremony', 'Holiday')),
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Campus', 'Sports', 'Laboratories', 'Cultural', 'Achievements', 'Library')),
    image_url TEXT NOT NULL,
    date_taken DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_reg ON students(registration_number);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_fee_records_student ON fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(is_published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public notices viewable by anyone" ON notices FOR SELECT USING (is_published = true);
CREATE POLICY "Public events viewable by anyone" ON school_events FOR SELECT USING (true);
CREATE POLICY "Public gallery viewable by anyone" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public classes viewable by anyone" ON classes FOR SELECT USING (true);
CREATE POLICY "Public teachers viewable by anyone" ON teachers FOR SELECT USING (status = 'Active');
CREATE POLICY "Public can submit admission inquiry" ON admissions FOR INSERT WITH CHECK (true);

-- Authenticated Full Access
CREATE POLICY "Admin full access on profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on classes" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on sections" ON sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on teachers" ON teachers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on students" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on subjects" ON subjects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on attendance" ON attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on fee_records" ON fee_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on fee_payments" ON fee_payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on examinations" ON examinations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on exam_results" ON exam_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on homework" ON homework FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on notices" ON notices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on admissions" ON admissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on school_events" ON school_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access on gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('student-photos', 'student-photos', true),
    ('teacher-photos', 'teacher-photos', true),
    ('school-gallery', 'school-gallery', true),
    ('school-documents', 'school-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access To Photos" ON storage.objects FOR SELECT USING (bucket_id IN ('student-photos', 'teacher-photos', 'school-gallery'));
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('student-photos', 'teacher-photos', 'school-gallery', 'school-documents') AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update/delete photos" ON storage.objects FOR ALL USING (bucket_id IN ('student-photos', 'teacher-photos', 'school-gallery', 'school-documents') AND auth.role() = 'authenticated');
