import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import {
  X,
  Camera,
  Upload,
  User,
  Shield,
  Save,
  Image as ImageIcon,
  Check
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, isAdmin, updateProfileAvatar } = useAuth();
  const { t } = useLanguage();

  const currentAvatar = user?.user_metadata?.avatar_url || profile?.avatar_url || '';
  const currentName = profile?.full_name || user?.user_metadata?.full_name || '';

  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [fullName, setFullName] = useState(currentName);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAvatarUrl(user?.user_metadata?.avatar_url || profile?.avatar_url || '');
      setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
    }
  }, [isOpen, user, profile]);

  // Support pressing ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // Handle uploading avatar from computer device to Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const cleanFileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Could not upload avatar image from device.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfileAvatar(avatarUrl, fullName);

      const isDark = document.documentElement.classList.contains('dark');
      Swal.fire({
        icon: 'success',
        title: t('pm_success_title'),
        text: t('pm_success_msg'),
        timer: 2000,
        showConfirmButton: false,
        background: isDark ? '#0b1329' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        iconColor: '#10b981'
      });
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Could not save profile changes.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in"
      style={{ zIndex: 99999 }}
    >
      <div className="relative w-full max-w-md my-auto bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all">
        {/* Cover Header Banner */}
        <div className="h-24 bg-gradient-to-r from-sky-600 via-primary-600 to-amber-500 relative flex items-start justify-between p-4">
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold text-sm tracking-wide drop-shadow-sm">
              {t('pm_title')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/90 hover:text-white rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-md transition transform hover:scale-110 active:scale-95"
            title={t('pm_cancel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 pt-0 space-y-5">
          {/* Avatar Upload with Floating Camera Icon */}
          <div className="flex flex-col items-center -mt-12 mb-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0f172a] bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.parentElement) {
                        e.target.parentElement.innerText = (fullName || user.email || 'U')[0].toUpperCase();
                      }
                    }}
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                    {(fullName || user.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Upload trigger overlay */}
              <label
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition"
                title={t('pm_upload_btn')}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Camera className="w-6 h-6 drop-shadow" />
              </label>
            </div>

            {/* Role Badge */}
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Admin Manager</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-primary-500" />
                  <span>Verified Guest</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 font-mono">{user.email}</p>
          </div>

          {/* Device Upload Button */}
          <div className="text-center">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Upload className={`w-4 h-4 text-primary-500 ${uploading ? 'animate-bounce' : ''}`} />
              <span>{uploading ? t('pm_uploading') : t('pm_upload_btn')}</span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('co_full_name')} *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('pm_url_label')}
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: Cancel + Save */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploading}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>{t('pm_cancel')}</span>
            </button>

            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 active:from-primary-800 active:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('pm_saving')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('pm_save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
