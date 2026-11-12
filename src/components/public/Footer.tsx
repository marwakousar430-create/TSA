import React from 'react';
import { GraduationCap, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenAdminLogin: () => void;
  onOpenAdmissionModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAdminLogin,
  onOpenAdmissionModal,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: School Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">
                  Teen School Academy
                </span>
                <span className="text-xs text-sky-400 font-medium tracking-wide uppercase">
                  Est. 1998 · Accredited College Preparatory
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering young scholars from Grades 7 through 12 through rigorous academics, advanced STEM laboratories, competitive athletics, and character development.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>450 Academy Way, Academic District, CA 94025</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+1 (555) 234-8800 · Admissions Office</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>admissions@teenschool.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Mon – Fri: 08:00 AM – 04:30 PM</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase text-sky-300">
              Institution
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mission')} className="hover:text-white transition-colors cursor-pointer">
                  Mission & Vision
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('principal')} className="hover:text-white transition-colors cursor-pointer">
                  Principal’s Message
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('teachers')} className="hover:text-white transition-colors cursor-pointer">
                  Faculty Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Academics & Admissions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase text-sky-300">
              Academics
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('academics')} className="hover:text-white transition-colors cursor-pointer">
                  Curriculum & AP Courses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-white transition-colors cursor-pointer">
                  Classes & Sections
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admissions')} className="hover:text-white transition-colors cursor-pointer">
                  Admissions Criteria
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('achievements')} className="hover:text-white transition-colors cursor-pointer">
                  Student Honors & Awards
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmissionModal} className="text-sky-400 font-medium hover:underline cursor-pointer">
                  Online Application Form
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Campus Life & Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase text-sky-300">
              Campus & Portal
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-white transition-colors cursor-pointer">
                  School News & Notices
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors cursor-pointer">
                  Campus Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Campus & Tours
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-xs font-semibold text-sky-300 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin & Staff Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Teen School Academy. All Rights Reserved. Built with Supabase Database Architecture.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-400">Privacy Policy</button>
            <span>·</span>
            <button onClick={() => onNavigate('about')} className="hover:text-slate-400">Terms of Enrollment</button>
            <span>·</span>
            <button onClick={onOpenAdminLogin} className="hover:text-sky-400 font-medium">Administrator Access</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
