import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Settings,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Image,
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const DEFAULT_HERO_BANNERS = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85'
];

export default function AdminSettings() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanners, setUploadingBanners] = useState(false);
  const [manualBannerUrl, setManualBannerUrl] = useState('');

  const [formData, setFormData] = useState({
    messenger_url: 'https://m.me/grandhorizonresort',
    zalo_phone: '0901234567',
    zalo_url: 'https://zalo.me/0901234567',
    whatsapp_phone: '+84901234567',
    whatsapp_url: 'https://wa.me/84901234567',
    hotline: '+84 90 123 4567',
    email: 'concierge@grandhorizonresort.com',
    address: '128 Beachfront Blvd, Ao Nang, Krabi, Thailand'
  });

  const [banners, setBanners] = useState(DEFAULT_HERO_BANNERS);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      let loadedContact = null;
      let loadedBanners = null;

      // 1. Try fetching from Backend API
      try {
        const contactRes = await api.get('/settings/contact');
        if (contactRes.data?.success && contactRes.data?.data) {
          loadedContact = contactRes.data.data;
        }
      } catch (e) {}

      try {
        const bannersRes = await api.get('/settings/banners');
        if (bannersRes.data?.success && Array.isArray(bannersRes.data.data) && bannersRes.data.data.length > 0) {
          loadedBanners = bannersRes.data.data;
        }
      } catch (e) {}

      // 2. Try fetching from Supabase hotel_settings directly
      if (!loadedContact || !loadedBanners) {
        try {
          const { data } = await supabase.from('hotel_settings').select('*');
          if (data && data.length > 0) {
            const cRow = data.find((r) => r.key === 'contact_info');
            if (cRow?.value) loadedContact = cRow.value;
            const bRow = data.find((r) => r.key === 'hero_banners');
            if (bRow?.value && Array.isArray(bRow.value)) loadedBanners = bRow.value;
          }
        } catch (e) {}
      }

      // 3. Fallback to localStorage cache
      if (!loadedContact) {
        const cached = localStorage.getItem('grand_horizon_contact_info');
        if (cached) loadedContact = JSON.parse(cached);
      }
      if (!loadedBanners) {
        const cachedB = localStorage.getItem('grand_horizon_hero_banners');
        if (cachedB) loadedBanners = JSON.parse(cachedB);
      }

      if (loadedContact) setFormData((prev) => ({ ...prev, ...loadedContact }));
      if (loadedBanners) setBanners(loadedBanners);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'zalo_phone' && value) {
        const cleaned = value.replace(/\D/g, '');
        updated.zalo_url = `https://zalo.me/${cleaned}`;
      }

      if (name === 'whatsapp_phone' && value) {
        const cleaned = value.replace(/\D/g, '');
        updated.whatsapp_url = `https://wa.me/${cleaned}`;
      }

      return updated;
    });
  };

  // Upload hero banner image from computer to Supabase Storage
  const handleBannerUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingBanners(true);

    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const cleanFileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `banners/${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('room-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('room-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setBanners((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error('Upload error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Could not upload image from your computer.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setUploadingBanners(false);
      e.target.value = '';
    }
  };

  const handleAddManualBanner = (e) => {
    e.preventDefault();
    if (!manualBannerUrl.trim()) return;
    setBanners((prev) => [...prev, manualBannerUrl.trim()]);
    setManualBannerUrl('');
  };

  const handleRemoveBanner = (indexToRemove) => {
    setBanners((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleResetDefaultBanners = () => {
    setBanners(DEFAULT_HERO_BANNERS);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      // 1. Save to Backend API (which saves to Supabase Admin metadata & file cache)
      try {
        await api.put('/settings/contact', formData);
      } catch (apiErr) {
        console.warn('API save note:', apiErr.message);
      }

      try {
        await api.put('/settings/banners', { banners });
      } catch (bannerErr) {
        console.warn('Banners API save note:', bannerErr.message);
      }

      // 2. Direct upsert to Supabase hotel_settings table if available
      try {
        await supabase
          .from('hotel_settings')
          .upsert([
            { key: 'contact_info', value: formData, updated_at: new Date().toISOString() },
            { key: 'hero_banners', value: banners, updated_at: new Date().toISOString() }
          ], { onConflict: 'key' });
      } catch (sbErr) {
        // Table may not exist yet
      }

      // 3. Save to localStorage cache as immediate client guarantee
      localStorage.setItem('grand_horizon_contact_info', JSON.stringify(formData));
      localStorage.setItem('grand_horizon_hero_banners', JSON.stringify(banners));

      const isDark = document.documentElement.classList.contains('dark');
      Swal.fire({
        icon: 'success',
        title: t('adm_set_saved_success') || 'Settings saved successfully!',
        text: 'Đã lưu thông tin liên hệ và ảnh slide nền vào Database thành công.',
        timer: 2400,
        timerProgressBar: true,
        showConfirmButton: false,
        background: isDark ? '#0b1329' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        iconColor: '#10b981',
        customClass: {
          popup: 'rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl font-sans'
        }
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || err.message || 'Could not save settings. Please try again.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">{t('adm_set_saving')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Settings className="w-6 h-6" />
            </span>
            <span>{t('adm_settings_title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t('adm_settings_sub')}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? t('adm_set_saving') : t('adm_set_save_btn')}</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Section A: Hero Background Slider Management */}
        <div className="bg-white dark:bg-[#0c1322] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('adm_set_section_banners')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('adm_set_banners_sub')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetDefaultBanners}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('adm_set_reset_default_banners')}</span>
            </button>
          </div>

          {/* Current Banners Preview Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Danh sách ảnh Slide hiện tại ({banners.length} ảnh):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-[16/10] shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Hero Slide ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold">
                    Slide #{idx + 1}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveBanner(idx)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg transition opacity-0 group-hover:opacity-100"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload and URL input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Direct Device Upload */}
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-5 text-center transition flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/40">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanners}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Upload className={`w-8 h-8 text-amber-500 mb-2 ${uploadingBanners ? 'animate-bounce' : ''}`} />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {uploadingBanners ? 'Đang tải ảnh lên Cloud...' : t('adm_set_upload_banners')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Nhấn để chọn ảnh từ máy tính (JPG, PNG, WEBP)
              </p>
            </div>

            {/* Direct URL input */}
            <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('adm_set_add_banner_url')}
                </label>
                <input
                  type="url"
                  value={manualBannerUrl}
                  onChange={(e) => setManualBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddManualBanner}
                className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm ảnh vào danh sách</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section B: Online Chat Channels (Messenger, Zalo, WhatsApp) */}
        <div className="bg-white dark:bg-[#0c1322] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('adm_set_section_chat')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chỉnh sửa link Messenger, Zalo và WhatsApp hiển thị ở nút liên hệ nổi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook Messenger */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>{t('adm_set_messenger')}</span>
                <span className="text-[11px] font-normal text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> https://m.me/yourpage
                </span>
              </label>
              <input
                type="url"
                name="messenger_url"
                value={formData.messenger_url}
                onChange={handleChange}
                placeholder="https://m.me/grandhorizonresort"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Zalo Phone / ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_zalo_phone')}
              </label>
              <input
                type="text"
                name="zalo_phone"
                value={formData.zalo_phone}
                onChange={handleChange}
                placeholder="0901234567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Zalo URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_zalo_url')}
              </label>
              <input
                type="url"
                name="zalo_url"
                value={formData.zalo_url}
                onChange={handleChange}
                placeholder="https://zalo.me/0901234567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* WhatsApp Phone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_whatsapp_phone')}
              </label>
              <input
                type="text"
                name="whatsapp_phone"
                value={formData.whatsapp_phone}
                onChange={handleChange}
                placeholder="+84 90 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* WhatsApp URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_whatsapp_url')}
              </label>
              <input
                type="url"
                name="whatsapp_url"
                value={formData.whatsapp_url}
                onChange={handleChange}
                placeholder="https://wa.me/84901234567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section C: Direct Contact & Hotel Info */}
        <div className="bg-white dark:bg-[#0c1322] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('adm_set_section_direct')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hotline, Email và địa chỉ resort hiển thị ở chân trang (Footer)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotline 24/7 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('adm_set_hotline')}</span>
              </label>
              <input
                type="text"
                name="hotline"
                value={formData.hotline}
                onChange={handleChange}
                placeholder="+84 90 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('adm_set_email')}</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="concierge@grandhorizonresort.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('adm_set_address')}</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="128 Beachfront Blvd, Ao Nang, Krabi, Thailand"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? t('adm_set_saving') : t('adm_set_save_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
