import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import {
  X,
  Camera,
  Upload,
  User,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  Sparkles
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
        title: 'Cập nhật thành công!',
        text: 'Ảnh đại diện và thông tin tài khoản đã được lưu.',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Cover Header Banner */}
        <div className="h-28 bg-gradient-to-r from-sky-600 via-primary-600 to-amber-500 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 pt-0 space-y-5">
          {/* Avatar Upload with Floating Camera Icon */}
          <div className="flex flex-col items-center -mt-14 mb-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                    {(fullName || user.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Upload trigger overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Camera className="w-6 h-6" />
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

            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
          </div>

          {/* Device Upload Button */}
          <div className="text-center">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Upload className={`w-3.5 h-3.5 text-primary-500 ${uploading ? 'animate-bounce' : ''}`} />
              <span>{uploading ? 'Đang tải ảnh...' : 'Chọn ảnh đại diện từ máy tính'}</span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('co_full_name')}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Hoặc dán URL ảnh đại diện trực tiếp
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm shadow-xl shadow-primary-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu ảnh đại diện & thông tin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
