import React from 'react';
import { Award, BookOpen, Compass, GraduationCap, Users, Shield, Target, Sparkles, Building, Globe } from 'lucide-react';
import { HERO_CAMPUS_IMG, SCIENCE_LAB_IMG, LIBRARY_STUDY_IMG } from '../../lib/initialData';

export const AboutUsPage: React.FC<{ onNavigate: (page: string) => void; onOpenAdmissionModal: () => void }> = ({
  onNavigate,
  onOpenAdmissionModal,
}) => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Institutional Heritage</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Nurturing Leaders and Scholars Since 1998
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Teen School Academy was founded with a singular conviction: secondary education should ignite intellectual passion, cultivate moral character, and prepare young adults to thrive in a complex global society.
        </p>
      </div>

      {/* Campus Hero Image */}
      <div className="rounded-3xl overflow-hidden shadow-xl aspect-[21/9] max-h-[460px] relative border border-slate-200">
        <img src={HERO_CAMPUS_IMG} alt="Academy Campus" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent flex items-end p-6 sm:p-10">
          <div className="text-white">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-300">Oakwood Academic Sanctuary</div>
            <div className="text-xl sm:text-2xl font-bold mt-1">45 Acres of Purpose-Built Learning Infrastructure</div>
          </div>
        </div>
      </div>

      {/* History & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">A Tradition of Distinction</h2>
          <p>
            Established in 1998 as an independent secondary school, Teen School Academy has grown into one of the country's most respected college-preparatory academies. Over the past three decades, we have graduated more than 3,500 alumni who now excel in medicine, engineering, public service, entrepreneurship, and the arts.
          </p>
          <p>
            Our academic framework harmonizes classical rigor with modern technological inquiry. In 2018, we unveiled our state-of-the-art Science & Innovation Wing, offering Grade 7–12 students hands-on access to advanced optics, spectrophotometry, robotics fabrication, and molecular genetics tools typically reserved for university undergraduates.
          </p>
          <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-medium text-slate-800">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
              <span className="font-bold text-sky-800 block text-sm">3,500+</span>
              <span>Distinguished Global Alumni</span>
            </div>
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
              <span className="font-bold text-sky-800 block text-sm">100%</span>
              <span>Certified Subject Specialists</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden aspect-square border border-slate-200 shadow-sm">
            <img src={SCIENCE_LAB_IMG} alt="Science Laboratory" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="rounded-2xl overflow-hidden aspect-square border border-slate-200 shadow-sm">
            <img src={LIBRARY_STUDY_IMG} alt="Collegiate Library" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Core Educational Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">The Teen School Academy Standard</h2>
          <p className="text-xs text-slate-500 mt-1">Four enduring commitments guiding every classroom and athletic field.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Academic Rigor</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Curricula designed to challenge and inspire, fostering mastery in advanced STEM and analytical humanities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Moral Character</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Developing integrity, empathy, and civic responsibility through community engagement and honor code governance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Holistic Growth</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Balancing scholarly pursuit with competitive athletics, performing arts, and independent creative passions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Global Perspective</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Cultivating cultural fluency, multilingual competency, and awareness of global sustainability challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MissionVisionPage: React.FC<{ onNavigate: (page: string) => void; onOpenAdmissionModal: () => void }> = ({
  onNavigate,
  onOpenAdmissionModal,
}) => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Guiding Philosophy</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Our Mission, Vision, and Institutional Values
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Every policy, teaching syllabus, and community initiative at Teen School Academy is anchored in clear moral purpose and scholastic excellence.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Institutional Mandate</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Our Mission</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed">
            "To cultivate inquiring, disciplined, and courageous adolescent minds within a rigorous scholastic environment that fosters intellectual discovery, ethical leadership, and joyful dedication to the betterment of humanity."
          </p>
          <div className="mt-6 pt-6 border-t border-sky-100 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>Inspire lifelong intellectual curiosity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>Instill unwavering ethical integrity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>Ensure university readiness across all disciplines</span>
            </div>
          </div>
        </div>

        {/* Vision */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-6 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Strategic Horizon</span>
          <h2 className="text-2xl font-bold text-white mt-1">Our Vision 2030</h2>
          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
            "To stand as the preeminent secondary academy recognized internationally for groundbreaking STEM innovation, exemplary humanities discourse, and compassionate alumni who shape ethical progress worldwide."
          </p>
          <div className="mt-6 pt-6 border-t border-blue-800 text-xs text-sky-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Pioneering student-led scientific research</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Equitable access through merit scholarships</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Carbon-neutral green campus stewardship</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Values */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Our Five Core Values</h2>
          <p className="text-xs text-slate-500 mt-1">The moral compass woven into everyday academy life.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="font-bold text-sm text-sky-700">1. Integrity</div>
            <p className="text-slate-600 mt-1 leading-relaxed">Uncompromising honesty in scholarship, competition, and human relations.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="font-bold text-sm text-sky-700">2. Inquiry</div>
            <p className="text-slate-600 mt-1 leading-relaxed">The courage to question, investigate deeply, and construct original insight.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="font-bold text-sm text-sky-700">3. Rigor</div>
            <p className="text-slate-600 mt-1 leading-relaxed">Commitment to discipline, meticulous work habits, and continual refinement.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="font-bold text-sm text-sky-700">4. Community</div>
            <p className="text-slate-600 mt-1 leading-relaxed">Fostering mutual respect, inclusivity, and celebration of diverse talents.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="font-bold text-sm text-sky-700">5. Resilience</div>
            <p className="text-slate-600 mt-1 leading-relaxed">Treating setbacks as valuable catalysts for emotional and intellectual growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
