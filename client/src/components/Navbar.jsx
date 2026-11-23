import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import FlagIcon from './FlagIcon';
import ProfileModal from './ProfileModal';
import { confirmLogout, notifyLogoutSuccess } from '../utils/alert';
import {
  Hotel,
  User,
  LogOut,
  Calendar,
  Shield,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, isAdmin, signOut, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef(null);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const confirmed = await confirmLogout(t);
    if (!confirmed) return;

    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
    notifyLogoutSuccess(t);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'lo', label: 'ພາສາລາວ' },
    { code: 'vi', label: 'Tiếng Việt' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[1];

  // Close dropdown when clicking outside
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

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition transform">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              Grand Horizon
            </span>
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium tracking-widest uppercase block">
              {t('brand_sub')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
            {t('nav_home')}
          </Link>
          <a href="/#rooms" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
            {t('nav_rooms')}
          </a>
          <a href="/#amenities" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
            {t('nav_amenities')}
          </a>
          <a href="/#about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
            {t('nav_about')}
          </a>
        </nav>

        {/* Right Section: Flag Button + Theme Toggle + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Flag Button (Vector SVG Flag - NEVER shows letters 'GB' or 'LA') */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-12 h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-sm"
              title="Change Language"
            >
              <FlagIcon code={currentLang.code} className="w-7 h-[18px] rounded-[3px] shadow-sm shrink-0" />
            </button>

            {/* Dropdown Menu (English, ພາສາລາວ, Tiếng Việt) */}
            {langDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-fade-in">
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
            className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-emerald-400 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5 text-emerald-400 stroke-[2.2]" /> : <Sun className="w-5 h-5 text-amber-500 stroke-[2.2]" />}
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 py-1 px-3 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-semibold flex items-center justify-center text-sm overflow-hidden">
                  {(user?.user_metadata?.avatar_url || profile?.avatar_url) ? (
                    <img
                      src={user?.user_metadata?.avatar_url || profile?.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile?.full_name || user.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {profile?.full_name || user.email.split('@')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">{t('logged_in_as')}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md">
                        {t('admin_role')}
                      </span>
                    )}
                  </div>

                  {/* Profile & Avatar Modal Trigger */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('nav_profile_avatar')}</span>
                  </button>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {t('nav_my_bookings')}
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition font-medium"
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      {t('nav_admin')}
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    {t('nav_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('signin')}
                className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 transition"
              >
                {t('nav_login')}
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="text-sm font-medium bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-4 py-2 rounded-full shadow-md shadow-primary-500/20 transition"
              >
                {t('nav_register')}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden"
          >
            <FlagIcon code={currentLang.code} className="w-6 h-4.5 rounded-[3px] shadow-sm object-cover" />
          </button>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-emerald-400 flex items-center justify-center"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b1120] px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language</span>
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    language === l.code
                      ? 'bg-slate-800 text-emerald-400 ring-1 ring-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FlagIcon code={l.code} className="w-5 h-3.5 rounded-[2px] object-cover" />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600"
          >
            {t('nav_home')}
          </Link>
          <a
            href="/#rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600"
          >
            {t('nav_rooms')}
          </a>

          {user ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="py-2">
                <p className="text-xs text-slate-400">{t('logged_in_as')}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.email}</p>
              </div>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600"
              >
                <Calendar className="w-5 h-5 text-slate-400" />
                {t('nav_my_bookings')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-medium text-amber-600 dark:text-amber-400"
                >
                  <Shield className="w-5 h-5 text-amber-500" />
                  {t('nav_admin')}
                </Link>
              )}
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 py-2 text-base font-medium text-red-600 dark:text-red-400"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                {t('nav_logout')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  openAuthModal('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl"
              >
                {t('nav_login')}
              </button>
              <button
                onClick={() => {
                  openAuthModal('signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-medium bg-primary-600 text-white rounded-xl shadow-md"
              >
                {t('nav_register')}
              </button>
            </div>
          )}
        </div>
      )}
      </header>

      {/* Profile & Avatar Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
