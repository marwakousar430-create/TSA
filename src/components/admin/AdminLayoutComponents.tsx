import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileCheck2,
  BookMarked,
  BellRing,
  UserPlus,
  Calendar,
  Image as ImageIcon,
  Database,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'attendance'
  | 'fees'
  | 'exams'
  | 'homework'
  | 'notices'
  | 'admissions'
  | 'events-gallery'
  | 'supabase';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onSwitchToPublic: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingAdmissionsCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onSwitchToPublic,
  isOpenMobile,
  onCloseMobile,
  pendingAdmissionsCount,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'classes', label: 'Classes & Sections', icon: Building },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'exams', label: 'Exams & Results', icon: FileCheck2 },
    { id: 'homework', label: 'Homework', icon: BookMarked },
    { id: 'notices', label: 'School Notices', icon: BellRing },
    {
      id: 'admissions',
      label: 'Admissions Inquiries',
      icon: UserPlus,
      badge: pendingAdmissionsCount > 0 ? pendingAdmissionsCount : undefined,
    },
    { id: 'events-gallery', label: 'Events & Gallery', icon: Calendar },
    { id: 'supabase', label: 'Supabase & SQL', icon: Database },
  ];

  const handleSelect = (tab: AdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block">Teen School</span>
                <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase">Admin Console</span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick link to public site */}
          <div className="px-4 py-3 border-b border-slate-800/80">
            <button
              onClick={onSwitchToPublic}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>View Public Website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with user profile and logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sky-800 border border-sky-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              EV
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">Dr. Evelyn Vance</div>
              <div className="text-[10px] text-sky-400 font-medium">Head Administrator</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
};

interface AdminHeaderProps {
  currentTab: AdminTab;
  onOpenMobileSidebar: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConfigured: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenSupabaseModal,
  isSupabaseConfigured,
}) => {
  const tabTitles: Record<AdminTab, string> = {
    overview: 'School Management Overview',
    students: 'Student Records Directory',
    teachers: 'Faculty & Teacher Management',
    classes: 'Class & Section Allocations',
    subjects: 'Course & Subject Syllabi',
    attendance: 'Daily Student Attendance Ledger',
    fees: 'Fee Collection & Financial Ledger',
    exams: 'Examinations & Student Result Cards',
    homework: 'Class Homework Assignments',
    notices: 'Official School Bulletins & Notices',
    admissions: 'Online Admission Applications',
    'events-gallery': 'Campus Events & Photo Gallery',
    supabase: 'Supabase Database Schema & Setup',
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Teen School Academy · Management Console
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">{tabTitles[currentTab]}</h1>
        </div>
      </div>

      {/* Right: Supabase Status Indicator & Quick Setup */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-current shrink-0" />
          <span className="hidden sm:inline">
            {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Setup & SQL'}
          </span>
          <span className="sm:hidden">{isSupabaseConfigured ? 'Connected' : 'SQL'}</span>
        </button>
      </div>
    </header>
  );
};
