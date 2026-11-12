import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { AdmissionInquiryModal } from './components/public/AdmissionInquiryModal';
import { HomePage } from './components/public/HomePage';
import { AboutUsPage, MissionVisionPage } from './components/public/AboutAndMissionPages';
import { PrincipalMessagePage, AcademicProgramsPage } from './components/public/PrincipalAndAcademicsPages';
import { ClassesSectionsPage, TeachersDirectoryPage } from './components/public/ClassesAndTeachersPages';
import { AdmissionsPage, AchievementsPage } from './components/public/AdmissionsAndAchievementsPages';
import { EventsNewsPage, PhotoGalleryPage, ContactUsPage } from './components/public/EventsGalleryContactPages';

import { AdminSidebar, AdminHeader, AdminTab } from './components/admin/AdminLayoutComponents';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { StudentManagement } from './components/admin/StudentManagement';
import { TeacherManagement, ClassManagement } from './components/admin/TeacherAndClassManagement';
import { SubjectManagement } from './components/admin/SubjectManagement';
import { AttendanceManagement } from './components/admin/AttendanceManagement';
import { FeeManagement } from './components/admin/FeeManagement';
import { ExamResultsManagement } from './components/admin/ExamResultsManagement';
import { HomeworkManagement, NoticesManagement } from './components/admin/HomeworkAndNoticesManagement';
import { AdmissionsManagement, EventsGalleryManagement } from './components/admin/AdmissionsAndEventsManagement';
import { SupabaseConfigModal } from './components/admin/SupabaseConfigModal';
import { getStoredSupabaseConfig, db, subscribeToTable } from './lib/supabaseClient';
import { AdmissionInquiry } from './types/database.types';

function MainApp() {
  const { isAuthenticated, logout } = useAuth();
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [publicPage, setPublicPage] = useState('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Modals
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOpenAddStudentDefault, setIsOpenAddStudentDefault] = useState(false);

  // Live count of pending admissions for sidebar badge
  const [pendingAdmissionsCount, setPendingAdmissionsCount] = useState(0);

  const updateInquiriesCount = async () => {
    const list = await db.admissions.getAll();
    setPendingAdmissionsCount(list.filter((a) => a.status === 'Pending').length);
  };

  useEffect(() => {
    updateInquiriesCount();
    const unsub = subscribeToTable('admissions', updateInquiriesCount);
    return () => unsub();
  }, []);

  const { isConfigured: isSupabaseConfigured } = getStoredSupabaseConfig();

  // Scroll to top on public page change
  const handleNavigatePublic = (page: string) => {
    setPublicPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminPortal = () => {
    if (isAuthenticated) {
      setViewMode('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setViewMode('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    setViewMode('public');
    setPublicPage('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {viewMode === 'public' ? (
        /* PUBLIC ACADEMY WEBSITE */
        <div className="flex-1 flex flex-col">
          <Navbar
            currentPage={publicPage}
            onNavigate={handleNavigatePublic}
            onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
            onOpenAdminLogin={handleOpenAdminPortal}
            isAdminLoggedIn={isAuthenticated}
          />

          <main className="flex-1">
            {publicPage === 'home' && (
              <HomePage
                onNavigate={handleNavigatePublic}
                onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              />
            )}
            {publicPage === 'about' && (
              <AboutUsPage
                onNavigate={handleNavigatePublic}
                onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              />
            )}
            {publicPage === 'mission' && (
              <MissionVisionPage
                onNavigate={handleNavigatePublic}
                onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              />
            )}
            {publicPage === 'principal' && (
              <PrincipalMessagePage
                onNavigate={handleNavigatePublic}
                onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              />
            )}
            {publicPage === 'academics' && (
              <AcademicProgramsPage
                onNavigate={handleNavigatePublic}
                onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              />
            )}
            {publicPage === 'classes' && (
              <ClassesSectionsPage
                onNavigate={handleNavigatePublic}
                onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              />
            )}
            {publicPage === 'teachers' && <TeachersDirectoryPage onNavigate={handleNavigatePublic} />}
            {publicPage === 'admissions' && <AdmissionsPage onNavigate={handleNavigatePublic} />}
            {publicPage === 'achievements' && <AchievementsPage onNavigate={handleNavigatePublic} />}
            {publicPage === 'events' && <EventsNewsPage onNavigate={handleNavigatePublic} />}
            {publicPage === 'gallery' && <PhotoGalleryPage onNavigate={handleNavigatePublic} />}
            {publicPage === 'contact' && <ContactUsPage onNavigate={handleNavigatePublic} />}
          </main>

          <Footer
            onNavigate={handleNavigatePublic}
            onOpenAdminLogin={handleOpenAdminPortal}
            onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
          />
        </div>
      ) : (
        /* SECURE ADMIN DASHBOARD */
        <div className="min-h-screen flex flex-col lg:pl-64">
          <AdminSidebar
            currentTab={adminTab}
            onSelectTab={(tab) => {
              if (tab === 'supabase') {
                setIsSupabaseModalOpen(true);
              } else {
                setAdminTab(tab);
              }
            }}
            onLogout={handleLogout}
            onSwitchToPublic={() => {
              setViewMode('public');
              setPublicPage('home');
            }}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            pendingAdmissionsCount={pendingAdmissionsCount}
          />

          <AdminHeader
            currentTab={adminTab}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            isSupabaseConfigured={isSupabaseConfigured}
          />

          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {adminTab === 'overview' && (
              <AdminDashboardOverview
                onNavigateTab={(tab) => {
                  if (tab === 'supabase') {
                    setIsSupabaseModalOpen(true);
                  } else {
                    setAdminTab(tab);
                  }
                }}
                onOpenAddStudent={() => {
                  setAdminTab('students');
                  setIsOpenAddStudentDefault(true);
                }}
              />
            )}
            {adminTab === 'students' && (
              <StudentManagement
                isOpenAddDefault={isOpenAddStudentDefault}
                onCloseAddDefault={() => setIsOpenAddStudentDefault(false)}
              />
            )}
            {adminTab === 'teachers' && <TeacherManagement />}
            {adminTab === 'classes' && <ClassManagement />}
            {adminTab === 'subjects' && <SubjectManagement />}
            {adminTab === 'attendance' && <AttendanceManagement />}
            {adminTab === 'fees' && <FeeManagement />}
            {adminTab === 'exams' && <ExamResultsManagement />}
            {adminTab === 'homework' && <HomeworkManagement />}
            {adminTab === 'notices' && <NoticesManagement />}
            {adminTab === 'admissions' && (
              <AdmissionsManagement
                onSwitchToStudents={() => setAdminTab('students')}
              />
            )}
            {adminTab === 'events-gallery' && <EventsGalleryManagement />}
          </main>
        </div>
      )}

      {/* Global Modals */}
      <AdmissionInquiryModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
