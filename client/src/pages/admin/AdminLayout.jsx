import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import FlagIcon from '../../components/FlagIcon';
import ProfileModal from '../../components/ProfileModal';
import { confirmLogout, notifyLogoutSuccess } from '../../utils/alert';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  ArrowLeft,
  Hotel,
  Sun,
  Moon,
  LogOut,
  Shield,
  Settings,
  MessageSquareQuote
} from 'lucide-react';

export default function AdminLayout() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const langRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'lo', label: 'ພາສາລາວ' },
    { code: 'vi', label: 'Tiếng Việt' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[1];

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const confirmed = await confirmLogout(t);
    if (!confirmed) return;

    await signOut();
    navigate('/');
    notifyLogoutSuccess(t);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Guard: if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-900 text-slate-100">
        <div className="w-16 h-16 bg-red-950/60 border border-red-800 text-red-400 rounded-3xl flex items-center justify-center mb-4">
          <Hotel className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied (403)</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          This portal is reserved strictly for hotel administrators. Please sign in with an administrator account.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg"
        >
          {t('adm_back_to_site')}
        </button>
      </div>
    );
  }

  const navItems = [
    { label: t('adm_overview'), path: '/admin', icon: LayoutDashboard },
    { label: t('adm_bookings'), path: '/admin/bookings', icon: CalendarCheck2 },
    { label: t('adm_rooms'), path: '/admin/rooms', icon: BedDouble },
    { label: t('adm_nav_reviews'), path: '/admin/reviews', icon: MessageSquareQuote },
    { label: t('adm_nav_settings'), path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0b1120] flex flex-col md:flex-row transition-colors duration-200">
      {/* 1. Dark Sidebar: Fixed / Sticky 100vh height so bottom buttons stay permanently in place */}
      <aside className="w-full md:w-64 md:h-screen md:max-h-screen md:sticky md:top-0 bg-slate-900 dark:bg-[#0c1322] border-r border-slate-800 text-slate-300 p-6 flex flex-col justify-between flex-shrink-0 z-30">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-0.5">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 mb-8 flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{t('adm_portal')}</h1>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {t('adm_management')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Return to Hotel Site & Logout (Fixed permanently at bottom) */}
        <div className="pt-5 border-t border-slate-800/80 mt-auto flex-shrink-0 space-y-2.5">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition group py-1"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
            <span>{t('adm_back_to_site')}</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition group py-1"
          >
            <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            <span>{t('nav_logout')}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Admin Topbar Header */}
        <header className="h-20 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-10 flex items-center justify-between transition-colors shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </span>
          </div>

          {/* Admin Header Actions: Flag language switcher, Dark/Light mode, Admin Profile */}
          <div className="flex items-center gap-3">
            {/* Language Switcher (Flag icon with dropdown) */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-11 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-sm"
                title="Change Language"
              >
                <FlagIcon code={currentLang.code} className="w-6 h-4 rounded-[3px] shadow-sm shrink-0" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-fade-in">
                  <div className="space-y-1">
                    {languages.map((l) => {
                      const isSelected = language === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLanguage(l.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition text-left ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800/90 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FlagIcon code={l.code} className="w-6 h-4 rounded-[3px] shadow-sm shrink-0" />
                            <span>{l.label}</span>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 flex-shrink-0"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-emerald-400 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400 stroke-[2.2]" /> : <Sun className="w-4 h-4 text-amber-500 stroke-[2.2]" />}
            </button>

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2.5">
              <div
                onClick={() => setProfileModalOpen(true)}
                className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-500 transition shadow-sm"
                title="Thay đổi ảnh đại diện Admin"
              >
                {(user?.user_metadata?.avatar_url || profile?.avatar_url) ? (
                  <img
                    src={user?.user_metadata?.avatar_url || profile?.avatar_url}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile?.full_name || user.email || 'A')[0].toUpperCase()
                )}
              </div>
              <span
                onClick={() => setProfileModalOpen(true)}
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[140px] truncate cursor-pointer hover:text-amber-500 transition"
              >
                {profile?.full_name || user.email.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 flex items-center justify-center transition shadow-sm ml-1"
                title={t('nav_logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-10">
          <Outlet />
        </main>
      </div>

      {/* Admin Profile & Avatar Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}
