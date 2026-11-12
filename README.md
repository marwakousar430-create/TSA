# Teen School Academy – Professional School Management Web Application

A full-stack, responsive, database-driven School Management Web Application and Public Institution Portal for **Teen School Academy**, built with React, TypeScript, Tailwind CSS, Lucide icons, and integrated with **Supabase** (PostgreSQL, Authentication, Row Level Security, and Storage).

---

## 1. Key Features Overview

### A. Public Website (12 Full Pages)
1. **Home**: Hero campus photography, institutional statistics, principal's welcome spotlight, academic programs bento grid, real-time school notices, academic events calendar, and online admission CTA.
2. **About Us**: Institution history since 1998, 45-acre campus overview, academic credentials, and educational pillars.
3. **Our Mission & Vision**: Institutional mandate, Vision 2030, and the five core values (Integrity, Inquiry, Rigor, Community, Resilience).
4. **Principal's Message**: Welcome address from Head of School Dr. Evelyn Vance, educational philosophy, and prospective parent letter.
5. **Academic Programs**: Curricula across Junior High (Grades 7–8), High School (Grades 9–10), and AP Capstone / Pre-Med STEM (Grades 11–12), with official Grading Scale and GPA matrix.
6. **Classes & Sections**: Roster of classes, room numbers, class capacities, fees, and assigned subjects.
7. **Our Teachers**: Faculty directory with qualifications, subjects, emails, and bios.
8. **Admissions**: Step-by-step application guide, tuition & fee schedules, scholarship criteria, and an embedded digital inquiry submission form.
9. **Student Achievements**: Science Olympiad national champions, National Merit semifinalists, athletic gold medals, and collegiate Ivy League matriculation list.
10. **School Events & News**: Searchable calendar of academic, cultural, athletic, and ceremonial fixtures.
11. **Photo Gallery**: High-resolution imagery across Campus, Laboratories, Sports, Library, and Cultural Life with full-screen preview modal.
12. **Contact Us**: Official campus addresses, office hours, visitor guidelines, and interactive messaging form.

### B. Secure Admin Dashboard & Management System
- **Executive Overview**: Real-time KPI cards (Total Students, Teachers, Classes, Fees Collected, Outstanding Balance, Today's Attendance %, Admissions Queue), progress trackers, and recent inquiry quick-actions.
- **Student Management System**:
  - Add New Student with automated registration number generation
  - Edit Student, Delete Student with confirmation modal
  - View Student Profile Card with photo and emergency contacts
  - Search, filter by class/section, sort by roll/name/reg/date
  - Pagination (8 per page)
  - One-click CSV Export (`Teen_School_Students_YYYY-MM-DD.csv`)
- **Teacher Management**: Faculty roster, teacher codes, qualifications, subjects, assigned cohorts, salaries, status, and profile views.
- **Class & Section Management**: Manage classes, section allocations, room assignments, capacities, and class teachers.
- **Subject Management**: Course curricula, codes, faculty leads, full marks, and passing thresholds.
- **Attendance Management**: Class and section selector, date picker, daily student roster with Present / Absent / Leave / Late controls, "Mark All Present" shortcut, duplicate prevention on same date, and Monthly Summary Report.
- **Fee Management System**: Tuition ledger, addon fees, payment collection modal (Cash, Bank Transfer, Online Card, Cheque), search by registration number, and Printable Official Fee Receipt with official school seal.
- **Examinations & Results**: Examination cycles, Marks Entry sheet with automated calculation of Total, Obtained, Percentage, Letter Grade (A+, A, B, C, F), and GPA; Printable Official Student Report Card.
- **Homework & Notices**: Homework assignments by class & subject; official administrative bulletins with category and audience toggles synced to the public website.
- **Admissions Inquiries Queue**: Review website inquiries, change status (Pending/Reviewed/Accepted/Rejected), and 1-click "Enroll as Student".
- **Events & Gallery Management**: Add/manage upcoming school events and photo gallery items.
- **Supabase Integration & SQL Hub**: Visual credentials manager, live connection tester, and 1-click copy for the entire PostgreSQL schema.

---

## 2. Supabase Database Schema (16 Tables)

The database schema is defined in `supabase-schema.sql` and includes:

1. `profiles`: Admin and staff accounts linked to `auth.users`.
2. `classes`: Grade levels (Grades 7–12), capacities, and monthly fees.
3. `sections`: Sections (Section A, Section B) linked to classes.
4. `teachers`: Faculty records, qualifications, subjects, salaries, and contacts.
5. `students`: Student directory with registration numbers, roll numbers, classes, parent details.
6. `subjects`: Courses with codes, full marks, and pass thresholds.
7. `attendance`: Daily attendance records with `UNIQUE(student_id, date)` constraint.
8. `fee_records`: Student billing ledgers, tuition fees, discounts, and late fees.
9. `fee_payments`: Payment transactions, payment methods, and receipt tokens.
10. `examinations`: Mid-term and final examination schedules.
11. `exam_results`: Computed scores, percentages, letter grades, and GPA with `UNIQUE(exam_id, student_id)`.
12. `homework`: Class homework assignments with due dates.
13. `notices`: Administrative bulletins with category and audience filters.
14. `admissions`: Incoming online admissions applications.
15. `school_events`: Campus fixtures and athletic meets.
16. `gallery`: Photo gallery items by category.

### Storage Buckets Configured
- `student-photos`
- `teacher-photos`
- `school-gallery`
- `school-documents`

---

## 3. Step-by-Step Supabase Connection Instructions

1. **Create Project**:
   Sign in to [supabase.com](https://supabase.com) and create a new project.
2. **Execute Database Schema**:
   - In your Supabase dashboard, open the **SQL Editor** in the left menu.
   - Open the **Supabase Setup & SQL** modal inside the application or copy the contents of `supabase-schema.sql`.
   - Paste the SQL into the Supabase editor and click **Run**.
3. **Configure Environment Variables**:
   - Go to **Project Settings → API** in Supabase.
   - Copy your **Project URL** and **anon public key**.
   - Create a `.env` file in the project root:
     ```env
     VITE_SUPABASE_URL="https://your-project-id.supabase.co"
     VITE_SUPABASE_ANON_KEY="your-anon-key"
     ```
   - *Alternatively*, you can paste them directly into the in-app **Supabase Setup** modal under the admin dashboard!

---

## 4. Local Development Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 5. Deployment Instructions for Vercel

1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **Add New → Project** and select your repository.
3. In **Build and Output Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
5. Click **Deploy**. Your application will be live with full SSL in seconds.

---

## 6. Default Admin Credentials

- **Email**: `admin@teenschool.edu`
- **Password**: `admin123`
- *Or use the "One-Click Demo Admin Login" button in the login modal for instant evaluation.*
