import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAdmissionModal: () => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAdmissionModal,
  onOpenAdminLogin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'teachers', label: 'Faculty' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'events', label: 'News & Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      {/* Top institution bar with contact & emergency notice */}
      <div className="bg-sky-900 text-sky-100 text-xs py-1.5 px-4 sm:px-8 border-b border-sky-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Admissions Open 2026-2027</span>
            <span className="hidden sm:inline text-sky-400">·</span>
            <span>Inquiries: +1 (555) 234-8800</span>
            <span className="hidden md:inline text-sky-400">·</span>
            <span className="hidden md:inline">info@teenschool.edu</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 text-sky-200 hover:text-white transition-colors cursor-pointer font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAdminLoggedIn ? 'Open Admin Dashboard' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">
              Teen School Academy
            </div>
            <div className="text-[11px] tracking-wide text-sky-700 font-medium uppercase">
              Excellence in Secondary Education
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                  isActive
                    ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                    : 'hover:text-sky-600'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAdmissionModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-sm transition-all hover:shadow cursor-pointer whitespace-nowrap"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmissionModal();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700"
            >
              Apply Now
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-semibold text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
