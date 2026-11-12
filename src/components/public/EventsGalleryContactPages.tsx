import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Building,
  GraduationCap,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { SchoolEvent, SchoolNotice, GalleryItem } from '../../types/database.types';

export const EventsNewsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [notices, setNotices] = useState<SchoolNotice[]>([]);
  const [eventCategory, setEventCategory] = useState('All');
  const [noticeCategory, setNoticeCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      const [e, n] = await Promise.all([db.events.getAll(), db.notices.getAll()]);
      setEvents(e);
      setNotices(n);
    };
    load();
    const unsubE = subscribeToTable('school_events', load);
    const unsubN = subscribeToTable('notices', load);
    return () => {
      unsubE();
      unsubN();
    };
  }, []);

  const filteredEvents = eventCategory === 'All' ? events : events.filter((e) => e.category === eventCategory);
  const filteredNotices = noticeCategory === 'All' ? notices : notices.filter((n) => n.category === noticeCategory);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Happenings & Announcements</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          School Events, Calendar & Bulletins
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Stay connected with academic milestones, varsity matches, STEM expos, and official administrative bulletins.
        </p>
      </div>

      {/* Events Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Academy Events</h2>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Academic', 'Sports', 'Cultural', 'Ceremony'].map((cat) => (
              <button
                key={cat}
                onClick={() => setEventCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  eventCategory === cat ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {evt.image_url && (
                <div className="h-44 overflow-hidden relative">
                  <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                    {evt.category}
                  </div>
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-semibold text-slate-700">{evt.event_date}</span>
                    <span>·</span>
                    <span>{evt.event_time}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{evt.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notices Section */}
      <div className="space-y-6 pt-8 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Official Administrative Bulletins</h2>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Academic', 'Holiday', 'Exam', 'Event', 'Urgent'].map((cat) => (
              <button
                key={cat}
                onClick={() => setNoticeCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  noticeCategory === cat ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{notice.category}</span>
                  <span>Published: {notice.published_date}</span>
                  <span>·</span>
                  <span>Audience: {notice.audience}</span>
                  {notice.priority === 'High' && (
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold text-[10px]">Urgent</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{notice.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{notice.content}</p>
              </div>
              <div className="text-right text-xs text-slate-400 shrink-0">
                <span>By {notice.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PhotoGalleryPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const load = async () => {
      const g = await db.gallery.getAll();
      setGallery(g);
    };
    load();
    const unsub = subscribeToTable('gallery', load);
    return () => unsub();
  }, []);

  const categories = ['All', 'Campus', 'Laboratories', 'Sports', 'Library', 'Cultural', 'Achievements'];

  const filteredItems = selectedCategory === 'All' ? gallery : gallery.filter((item) => item.category === selectedCategory);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Visual Experience</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Teen School Academy Photo Gallery
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Glimpses into our historic campus grounds, advanced scientific laboratories, athletic championships, and collaborative student life.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setPreviewImage(item)}
            className="group rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer relative"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <span className="text-xs text-white font-semibold">Click to enlarge</span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-[11px] font-semibold text-sky-700 uppercase">{item.category}</div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] max-h-[70vh] bg-black">
              <img src={previewImage.image_url} alt={previewImage.title} className="w-full h-full object-contain" />
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase">{previewImage.category}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{previewImage.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{previewImage.caption}</p>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ContactUsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Connect With Our Team</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
          Contact Teen School Academy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          We welcome prospective families, academic partners, and alumni visitors. Get in touch with our admissions directors or schedule a campus walking tour.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Campus Address & Hours</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Main Campus</span>
                  <span>450 Academy Way, Academic District, CA 94025</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Telephone Inquiries</span>
                  <span>Main Switchboard: +1 (555) 234-8800</span>
                  <span className="block text-slate-400">Admissions Direct: +1 (555) 234-8801</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Email Correspondence</span>
                  <span>General: info@teenschool.edu</span>
                  <span className="block text-slate-400">Admissions: admissions@teenschool.edu</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Administrative Office Hours</span>
                  <span>Monday – Friday: 08:00 AM – 04:30 PM PST</span>
                  <span className="block text-slate-400">Saturday: By Appointment (Tours & Assessments)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-900 to-blue-900 text-white shadow-md space-y-3">
            <h3 className="text-base font-bold">Directions & Parking</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Visitor parking is complimentary in Lot A off Academy Way. Please check in at the reception pavilion inside the main administration building upon arrival.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Send a Direct Message</h3>
          <p className="text-xs text-slate-500 mb-6">Our admissions advisors typically reply within one business day.</p>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Message Delivered</h4>
              <p className="text-xs text-slate-600">
                Thank you, {formData.name}. Our administrative team has received your communication and will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-4 py-2 text-xs font-semibold text-sky-700 bg-white border border-sky-200 rounded-lg"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Inquiry Purpose</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Admissions & Prospectus">Admissions & Prospectus</option>
                    <option value="Campus Tour Scheduling">Campus Tour Scheduling</option>
                    <option value="Scholarships & Financial Aid">Scholarships & Financial Aid</option>
                    <option value="Alumni Relations">Alumni Relations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our admissions and administrative faculty assist your family?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
