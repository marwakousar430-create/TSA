import React from 'react';
import { Award, BookOpen, CheckCircle2, ChevronRight, GraduationCap, Microscope, Sparkles, FileText } from 'lucide-react';
import { PRINCIPAL_PORTRAIT_IMG, SCIENCE_LAB_IMG } from '../../lib/initialData';

export const PrincipalMessagePage: React.FC<{ onNavigate: (page: string) => void; onOpenAdmissionModal: () => void }> = ({
  onNavigate,
  onOpenAdmissionModal,
}) => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Executive Leadership</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Principal's Welcome Address
        </h1>
        <p className="text-sm text-slate-500">From the Desk of Dr. Evelyn Vance, Ph.D. · Head of School</p>
      </div>

      {/* Main Letter Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-sky-100 shadow-md shrink-0">
            <img src={PRINCIPAL_PORTRAIT_IMG} alt="Principal Dr. Evelyn Vance" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dr. Evelyn Vance, Ph.D.</h2>
            <div className="text-xs text-sky-700 font-semibold mt-0.5">Head of School & Academy Principal</div>
            <div className="text-xs text-slate-500 mt-1">Ph.D. Educational Leadership (Harvard) · M.A. Curriculum & Instruction (Stanford)</div>
            <div className="mt-3 text-xs text-slate-600 italic">"Serving Teen School Academy with profound dedication since 2016."</div>
          </div>
        </div>

        {/* The Letter Content */}
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">Dear Prospective Students, Parents, and Esteemed Community Members,</p>
          <p>
            It is my distinct honor to welcome you to Teen School Academy. When families walk through our oak-canopied main quadrangle, they often comment on the unmistakable energy that fills our campus. It is the palpable spark of adolescent curiosity met with exceptional pedagogical mentorship.
          </p>
          <p>
            Secondary school encompasses the most transformative years of a person's life. Between the ages of 12 and 18, students transition from childhood learners into self-aware, principled young adults formulating their individual worldviews. At Teen School Academy, we do not view adolescence as a phase to endure; we view it as a fertile period of boundless intellectual and creative capability.
          </p>
          <p>
            Our academic standards are unapologetically rigorous. Whether formulating novel mathematical hypotheses in David Harrison's calculus seminars, investigating protein folding in our biochemistry labs with Dr. Mercer, or debating constitutional law in Model UN with Elena Rostova, our scholars are held to the highest collegiate benchmarks. Yet this intellectual rigor is matched in equal measure by deep emotional support, tailored college counseling, and joyful school culture.
          </p>
          <p>
            We invite you to explore our campus, speak with our world-class faculty, and experience firsthand what makes Teen School Academy a truly remarkable community of scholars.
          </p>
          <p className="pt-4">
            With warmest academic regards,
          </p>
          <div className="pt-2">
            <div className="font-serif italic text-lg text-slate-900">Evelyn Vance, Ph.D.</div>
            <div className="text-xs text-slate-500">Principal & Head of School, Teen School Academy</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">Have questions for the Office of the Principal?</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Contact Principal's Office
            </button>
            <button
              onClick={onOpenAdmissionModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Apply for Admission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AcademicProgramsPage: React.FC<{ onNavigate: (page: string) => void; onOpenAdmissionModal: () => void }> = ({
  onNavigate,
  onOpenAdmissionModal,
}) => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Scholastic Framework</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Comprehensive Academic Curricula (Grades 7–12)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From junior high foundational seminars to Advanced Placement Capstone credentials and pre-med specialization, our coursework is tailored for collegiate distinction.
        </p>
      </div>

      {/* Program Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tier 1: Middle School */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              01
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-700 uppercase">Grades 7 & 8</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Junior High Foundations</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transitioning adolescents into structured analytical thought. Emphasizes foundational algebra, scientific laboratory methodology, essay composition, and world geography.
            </p>
            <div className="space-y-2 text-xs text-slate-700 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Pre-Algebra & Geometry Foundations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Integrated Earth & Physical Sciences</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Critical Reading & Socratic Discourse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Exploratory Fine Arts & Robotics</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="w-full py-2.5 px-4 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer text-center"
          >
            View Grades 7 & 8 Classes
          </button>
        </div>

        {/* Tier 2: High School */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              02
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase">Grades 9 & 10</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">High School Core & Pre-AP</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deepening rigor and independent study habits. Students undertake advanced algebra, biology, world history, and begin modern foreign language proficiency tracks.
            </p>
            <div className="space-y-2 text-xs text-slate-700 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Honors Biology & Chemistry Essentials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>World Literature & Formal Rhetoric</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Global Civilizations & Economics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>PSAT Prep & Academic Advising</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="w-full py-2.5 px-4 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer text-center"
          >
            View Grades 9 & 10 Classes
          </button>
        </div>

        {/* Tier 3: Senior College Prep */}
        <div className="p-8 rounded-2xl bg-gradient-to-b from-sky-50/80 to-white border border-sky-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              03
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-700 uppercase">Grades 11 & 12</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">AP Capstone & Pre-Med</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              University-level coursework with college credit eligibility. Specialized tracks in STEM / Biomedical Sciences, Advanced Placement, and Senior Thesis projects.
            </p>
            <div className="space-y-2 text-xs text-slate-700 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>AP Calculus BC & Multivariable Math</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>AP Physics C, AP Chemistry & Bio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>AP English Literature & Composition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>1-on-1 Ivy League College Placement</span>
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAdmissionModal}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer text-center"
          >
            Inquire for Senior Admissions
          </button>
        </div>
      </div>

      {/* Official Grading Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Academic Grading Scale & GPA Matrix</h3>
        <p className="text-xs text-slate-500">Official standard applied across examination calculation and transcript generation.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-4">Percentage Range</th>
                <th className="py-2.5 px-4">Letter Grade</th>
                <th className="py-2.5 px-4">Standard GPA</th>
                <th className="py-2.5 px-4">Honors / AP Weighted GPA</th>
                <th className="py-2.5 px-4">Performance Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
              <tr>
                <td className="py-2 px-4 font-semibold">93% – 100%</td>
                <td className="py-2 px-4 font-bold text-emerald-700">A+</td>
                <td className="py-2 px-4">4.00</td>
                <td className="py-2 px-4 font-semibold text-sky-700">5.00</td>
                <td className="py-2 px-4">Distinction & Highest Honors</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold">85% – 92%</td>
                <td className="py-2 px-4 font-bold text-emerald-700">A</td>
                <td className="py-2 px-4">3.75</td>
                <td className="py-2 px-4 font-semibold text-sky-700">4.75</td>
                <td className="py-2 px-4">Excellent Mastery</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold">78% – 84%</td>
                <td className="py-2 px-4 font-bold text-sky-700">B+</td>
                <td className="py-2 px-4">3.30</td>
                <td className="py-2 px-4 font-semibold text-sky-700">4.30</td>
                <td className="py-2 px-4">Very Good Competency</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold">70% – 77%</td>
                <td className="py-2 px-4 font-bold text-sky-700">B</td>
                <td className="py-2 px-4">3.00</td>
                <td className="py-2 px-4 font-semibold text-sky-700">4.00</td>
                <td className="py-2 px-4">Good Standing</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold">60% – 69%</td>
                <td className="py-2 px-4 font-bold text-amber-700">C</td>
                <td className="py-2 px-4">2.00</td>
                <td className="py-2 px-4 font-semibold text-sky-700">3.00</td>
                <td className="py-2 px-4">Satisfactory (Remediation Offered)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold">&lt; 50%</td>
                <td className="py-2 px-4 font-bold text-rose-700">F</td>
                <td className="py-2 px-4">0.00</td>
                <td className="py-2 px-4 font-semibold text-slate-700">0.00</td>
                <td className="py-2 px-4">Course Retake Mandatory</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
