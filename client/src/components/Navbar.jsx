import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const languages = [
    { code: 'vi', flag: '🇻🇳', title: 'Tiếng Việt' },
    { code: 'en', flag: '🇬🇧', title: 'English' },
    { code: 'th', flag: '🇹🇭', title: 'ไทย' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition transform">
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

        {/* Actions: Theme Toggle, Flag-only Language Switcher, User Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Flag-only Language Switcher Pill */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                title={l.title}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                  language === l.code
                    ? 'bg-white dark:bg-slate-700 shadow-sm scale-110 ring-1 ring-slate-200 dark:ring-slate-600'
                    : 'opacity-50 hover:opacity-100 hover:scale-105'
                }`}
              >
                <span className="leading-none">{l.flag}</span>
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-semibold flex items-center justify-center text-sm">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {profile?.full_name || user.email.split('@')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400">{t('logged_in_as')}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md">
                        {t('admin_role')}
                      </span>
                    )}
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary-600 transition"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {t('nav_my_bookings')}
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 transition font-medium"
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      {t('nav_admin')}
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 transition"
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

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {/* Flag-only Switcher for Mobile */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngôn ngữ / Language</span>
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  title={l.title}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
                    language === l.code
                      ? 'bg-white dark:bg-slate-700 shadow-sm scale-110 ring-1 ring-slate-200 dark:ring-slate-600'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <span className="leading-none">{l.flag}</span>
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
  );
}
