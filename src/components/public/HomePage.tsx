import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  GraduationCap,
  Sparkles,
  Users,
  ChevronRight,
  Building,
  Microscope,
  Trophy,
} from 'lucide-react';
import {
  HERO_CAMPUS_IMG,
  PRINCIPAL_PORTRAIT_IMG,
  SCIENCE_LAB_IMG,
  SPORTS_COMPLEX_IMG,
  LIBRARY_STUDY_IMG,
} from '../../lib/initialData';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { SchoolNotice, SchoolEvent } from '../../types/database.types';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenAdmissionModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAdmissionModal }) => {
  const [notices, setNotices] = useState<SchoolNotice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const n = await db.notices.getPublished();
      const e = await db.events.getAll();
      setNotices(n.slice(0, 3));
      setEvents(e.slice(0, 3));
    };
    load();

    const unsubN = subscribeToTable('notices', load);
    const unsubE = subscribeToTable('school_events', load);
    return () => {
      unsubN();
      unsubE();
    };
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/60 to-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-800 bg-sky-100/80 px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Admissions Now Open for Academic Year 2026-2027</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
                Empowering Inquisitive Minds, Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">Enduring Character</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Teen School Academy is a premier college-preparatory institution for Grades 7 through 12. We cultivate critical thinkers, innovative problem solvers, and compassionate leaders through experiential STEM laboratories, advanced humanities, and collegiate athletics.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenAdmissionModal}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('academics')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Explore Academic Programs
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>WASC Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>College Board AP Capstone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>98% Ivy & Tier-1 Acceptance</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] lg:aspect-auto lg:h-[480px]">
                <img
                  src={HERO_CAMPUS_IMG}
                  alt="Teen School Academy Campus"
                  className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Historic Main Quadrangle</div>
                      <div className="text-slate-500">45-Acre Modern Educational Sanctuary</div>
                    </div>
                    <button
                      onClick={() => onNavigate('gallery')}
                      className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Take Tour</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-COLUMN STAT STRIP */}
          <div className="mt-14 pt-10 border-t border-sky-100 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">100%</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">College Placement Rate</div>
              <div className="text-xs text-slate-500 mt-0.5">Top North American & Global universities</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">14 : 1</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">Student-Faculty Ratio</div>
              <div className="text-xs text-slate-500 mt-0.5">Personalized mentoring & small seminars</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">35+</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">Advanced AP & Honors Courses</div>
              <div className="text-xs text-slate-500 mt-0.5">Rigorous pre-college STEM & humanities</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">98.4%</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">Parent Satisfaction</div>
              <div className="text-xs text-slate-500 mt-0.5">Continuous community-verified feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRINCIPAL WELCOME SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 text-white rounded-3xl p-8 lg:p-12 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Principal Image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-4 border-sky-400/30 shadow-2xl shrink-0">
                <img
                  src={PRINCIPAL_PORTRAIT_IMG}
                  alt="Dr. Evelyn Vance, Principal"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Principal Quote & Bio */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-sky-300">
                <GraduationCap className="w-4 h-4" />
                <span>Message from the Head of School</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                "We don't merely prepare teenagers for college examinations; we equip them for purposeful, principled lives."
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                At Teen School Academy, we cherish the boundless curiosity of youth. In our state-of-the-art research laboratories, vibrant seminar rooms, and athletics complexes, young women and men discover their distinctive strengths. We blend classical scholarly inquiry with forward-thinking scientific research to cultivate resilient leaders for tomorrow.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white text-base">Dr. Evelyn Vance, Ph.D.</div>
                  <div className="text-xs text-sky-300">Head of School & Academy Principal</div>
                </div>
                <button
                  onClick={() => onNavigate('principal')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <span>Read Full Principal's Address</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACADEMIC EXCELLENCE PILLARS (BENTO GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-sky-600">Scholastic Foundation</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Holistic Secondary Education
            </h2>
          </div>
          <button
            onClick={() => onNavigate('academics')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Curriculum & Syllabi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: STEM Lab */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img
                src={SCIENCE_LAB_IMG}
                alt="Science Lab"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-sky-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Microscope className="w-3 h-3 text-sky-300" />
                <span>STEM & Bio-Research</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Advanced Laboratories</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Dual organic chemistry suites, experimental physics optics benches, and dedicated robotics prototyping for Grade 9–12 scholars.
                </p>
              </div>
              <button
                onClick={() => onNavigate('academics')}
                className="mt-4 text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lab Courses</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2: Athletics */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img
                src={SPORTS_COMPLEX_IMG}
                alt="Sports complex"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-sky-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-sky-300" />
                <span>Athletics & Fitness</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Varsity Athletic Complex</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Regulation 400m Olympic-standard track, heated aquatics pavilion, and competitive football facilities fostering teamwork.
                </p>
              </div>
              <button
                onClick={() => onNavigate('academics')}
                className="mt-4 text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Sports Programs</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Library & Commons */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img
                src={LIBRARY_STUDY_IMG}
                alt="Library"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-sky-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-sky-300" />
                <span>Collegiate Commons</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Research & Digital Commons</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Quiet study halls, 30,000 scholarly volumes, peer tutoring centers, and academic counseling for college applications.
                </p>
              </div>
              <button
                onClick={() => onNavigate('academics')}
                className="mt-4 text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Study Commons</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME NOTICES & SCHOOL EVENTS (DIRECT FROM DATABASE) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Notices Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-sky-700">Official Bulletins</span>
                  <h3 className="text-xl font-bold text-slate-900">Latest School Notices</h3>
                </div>
                <button
                  onClick={() => onNavigate('events')}
                  className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
                >
                  View All Notices
                </button>
              </div>

              <div className="space-y-3">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-sky-700">{notice.category}</span>
                      <span>{notice.published_date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{notice.content}</p>
                    <div className="mt-2 text-[11px] text-slate-400">Audience: {notice.audience} · Issued by {notice.author}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-sky-700">Academy Calendar</span>
                  <h3 className="text-xl font-bold text-slate-900">Upcoming Events</h3>
                </div>
                <button
                  onClick={() => onNavigate('events')}
                  className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
                >
                  View Academic Calendar
                </button>
              </div>

              <div className="space-y-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-4 hover:border-sky-300 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg bg-sky-50 border border-sky-100 flex flex-col items-center justify-center text-sky-800 shrink-0">
                      <Calendar className="w-4 h-4 mb-0.5 text-sky-600" />
                      <span className="text-[10px] font-bold uppercase">{evt.event_date.split('-')[1] || 'NOV'}</span>
                      <span className="text-sm font-extrabold tabular-nums">{evt.event_date.split('-')[2] || '20'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-sky-700">{evt.category}</span>
                        <span>·</span>
                        <span>{evt.event_time}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{evt.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{evt.description}</p>
                      <div className="text-[11px] text-slate-500 mt-1">📍 {evt.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Begin Your Scholastic Journey at Teen School Academy</h3>
            <p className="text-sm text-sky-100 leading-relaxed">
              Accepting inquiries for Grades 7 through 12. Connect with our admissions counselors and register for upcoming scholarship evaluations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAdmissionModal}
              className="px-6 py-3 text-xs font-bold text-sky-900 bg-white hover:bg-sky-50 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Submit Online Inquiry
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 text-xs font-bold text-white bg-sky-800/60 hover:bg-sky-800 border border-white/20 rounded-xl transition-colors cursor-pointer"
            >
              Schedule Campus Tour
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
